import "dotenv/config";
import express, { type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WhopClient, WhopEnvironment, WhopError } from "@whop/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const IS_PRODUCTION = process.env.NODE_ENV === "production";

interface WhopRuntimeConfig {
  apiKey: string;
  companyId: string;
  environment: "production" | "sandbox";
  productId: string;
  plans: {
    inspection: string;
    deposit: string;
    repair: string;
    finalInvoice: string;
  };
}

function getWhopRuntimeConfig(): WhopRuntimeConfig {
  const envRaw = (process.env.WHOP_ENVIRONMENT || "production").toLowerCase();
  const environment = envRaw === "sandbox" ? "sandbox" : "production";

  return {
    apiKey: (process.env.WHOP_API_KEY || "").trim(),
    companyId: (process.env.WHOP_COMPANY_ID || "").trim(),
    environment,
    productId: (process.env.WHOP_PRODUCT_ID || "").trim(),
    plans: {
      inspection: (process.env.WHOP_PLAN_INSPECTION_ID || "").trim(),
      deposit: (process.env.WHOP_PLAN_DEPOSIT_ID || "").trim(),
      repair: (process.env.WHOP_PLAN_REPAIR_ID || "").trim(),
      finalInvoice: (process.env.WHOP_PLAN_FINAL_INVOICE_ID || "").trim(),
    },
  };
}

function createWhopClient(cfg: WhopRuntimeConfig): WhopClient | null {
  if (!cfg.apiKey) return null;
  return new WhopClient({
    token: cfg.apiKey,
    environment:
      cfg.environment === "sandbox"
        ? WhopEnvironment.Sandbox
        : WhopEnvironment.Production,
  });
}

// Simple in-memory rate limiter for lead submission spam protection
const leadSubmissionTimestamps = new Map<string, number[]>();
const LEAD_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LEAD_RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (leadSubmissionTimestamps.get(ip) || []).filter(
    (ts) => now - ts < LEAD_RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= LEAD_RATE_LIMIT_MAX) {
    leadSubmissionTimestamps.set(ip, recent);
    return true;
  }
  recent.push(now);
  leadSubmissionTimestamps.set(ip, recent);
  return false;
}

function extractWhopError(error: unknown): { status: number; message: string; details?: unknown } {
  if (error instanceof WhopError) {
    return {
      status: error.statusCode && error.statusCode >= 400 ? error.statusCode : 502,
      message: error.message || "Whop API returned an error.",
      details: error.body,
    };
  }
  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }
  return { status: 500, message: "Unexpected server error while communicating with Whop." };
}

async function startServer() {
  const app = express();
  app.set("trust proxy", true);
  app.use(express.json({ limit: "1mb" }));

  // 1. Public configuration status endpoint (NEVER leaks WHOP_API_KEY)
  app.get("/api/config", (_req: Request, res: Response) => {
    const cfg = getWhopRuntimeConfig();
    const missingForLeads: string[] = [];
    if (!cfg.apiKey) missingForLeads.push("WHOP_API_KEY");
    if (!cfg.companyId) missingForLeads.push("WHOP_COMPANY_ID");

    const missingForCheckout: string[] = [];
    if (!cfg.plans.inspection) missingForCheckout.push("WHOP_PLAN_INSPECTION_ID");
    if (!cfg.plans.deposit) missingForCheckout.push("WHOP_PLAN_DEPOSIT_ID");
    if (!cfg.plans.repair) missingForCheckout.push("WHOP_PLAN_REPAIR_ID");

    const missingForWorkflow: string[] = [];
    if (!cfg.apiKey) missingForWorkflow.push("WHOP_API_KEY");
    if (!cfg.companyId) missingForWorkflow.push("WHOP_COMPANY_ID");
    if (!cfg.plans.deposit) missingForWorkflow.push("WHOP_PLAN_DEPOSIT_ID");
    if (!cfg.plans.finalInvoice) missingForWorkflow.push("WHOP_PLAN_FINAL_INVOICE_ID");

    res.json({
      environment: cfg.environment,
      companyId: cfg.companyId || null,
      productId: cfg.productId || null,
      plans: {
        inspection: cfg.plans.inspection || null,
        deposit: cfg.plans.deposit || null,
        repair: cfg.plans.repair || null,
        finalInvoice: cfg.plans.finalInvoice || null,
      },
      capabilities: {
        trackingPixel: Boolean(cfg.companyId && cfg.companyId.startsWith("biz_")),
        leadsApi: Boolean(cfg.apiKey && cfg.companyId),
        checkoutElements: Boolean(
          cfg.plans.inspection || cfg.plans.deposit || cfg.plans.repair,
        ),
        setupIntents: Boolean(cfg.apiKey && cfg.companyId),
        invoicesApi: Boolean(cfg.apiKey && cfg.companyId),
      },
      missingEnvVars: {
        leads: missingForLeads,
        checkout: missingForCheckout,
        workflow: missingForWorkflow,
      },
    });
  });

  // 2. Whop Leads API — Create Lead from Estimate Request Form
  app.post("/api/whop/leads", async (req: Request, res: Response) => {
    const cfg = getWhopRuntimeConfig();
    const client = createWhopClient(cfg);

    const {
      fullName,
      email,
      phone,
      propertyAddress,
      serviceRequired,
      projectDescription,
      preferredContactMethod,
      companyWebsiteHoneypot,
      formLoadedAt,
    } = req.body || {};

    // Spam Protection 1: Honeypot field check
    if (typeof companyWebsiteHoneypot === "string" && companyWebsiteHoneypot.trim().length > 0) {
      res.status(400).json({ error: "Submission rejected by spam protection." });
      return;
    }

    // Spam Protection 2: Minimum human fill time (1.5 seconds)
    if (typeof formLoadedAt === "number" && Date.now() - formLoadedAt < 1500) {
      res.status(400).json({ error: "Form submitted too quickly. Please review your details and try again." });
      return;
    }

    // Spam Protection 3: IP rate limiting
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    if (isRateLimited(clientIp)) {
      res.status(429).json({
        error: "Too many estimate requests from this connection. Please wait a few minutes and try again.",
      });
      return;
    }

    // Server-side input validation
    const trimmedName = typeof fullName === "string" ? fullName.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedAddress = typeof propertyAddress === "string" ? propertyAddress.trim() : "";
    const trimmedService = typeof serviceRequired === "string" ? serviceRequired.trim() : "";
    const trimmedDesc = typeof projectDescription === "string" ? projectDescription.trim() : "";
    const trimmedContact = typeof preferredContactMethod === "string" ? preferredContactMethod.trim() : "";

    if (trimmedName.length < 2) {
      res.status(400).json({ error: "Please enter your full name." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }
    if (trimmedPhone.replace(/\D/g, "").length < 10) {
      res.status(400).json({ error: "Please enter a valid 10-digit US phone number." });
      return;
    }
    if (trimmedAddress.length < 5) {
      res.status(400).json({ error: "Please enter the property address." });
      return;
    }
    if (!trimmedService) {
      res.status(400).json({ error: "Please select the roofing service required." });
      return;
    }
    if (trimmedDesc.length < 10) {
      res.status(400).json({ error: "Please provide a brief description of your roofing project (at least 10 characters)." });
      return;
    }

    if (!client || !cfg.companyId) {
      const missing: string[] = [];
      if (!cfg.apiKey) missing.push("WHOP_API_KEY");
      if (!cfg.companyId) missing.push("WHOP_COMPANY_ID");
      res.status(503).json({
        error: "Whop Leads API credentials are not configured on this server.",
        requiresConfiguration: true,
        missingEnvVars: missing,
      });
      return;
    }

    try {
      const leadPayload: Record<string, unknown> = {
        company_id: cfg.companyId,
        email: trimmedEmail,
        referrer: req.get("referer") || process.env.APP_URL || "https://whop.app",
        metadata: {
          source: "skyfy_roofing_estimate_form",
          full_name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          property_address: trimmedAddress,
          service_required: trimmedService,
          project_description: trimmedDesc.slice(0, 500),
          preferred_contact_method: trimmedContact || "Phone",
          submitted_at: new Date().toISOString(),
        },
      };

      if (cfg.productId) {
        leadPayload.product_id = cfg.productId;
      }

      const whopResponse = await client.fetch("leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadPayload),
      });

      const responseText = await whopResponse.text();
      let parsed: Record<string, unknown> = {};
      try {
        parsed = responseText ? (JSON.parse(responseText) as Record<string, unknown>) : {};
      } catch {
        parsed = { raw: responseText };
      }

      if (!whopResponse.ok) {
        res.status(whopResponse.status).json({
          error:
            (parsed.error as { message?: string } | undefined)?.message ||
            (typeof parsed.message === "string" ? parsed.message : null) ||
            `Whop Leads API rejected the request (HTTP ${whopResponse.status}).`,
          details: parsed,
        });
        return;
      }

      res.status(201).json({
        ok: true,
        lead: parsed,
      });
    } catch (err) {
      const info = extractWhopError(err);
      res.status(info.status).json({ error: info.message, details: info.details });
    }
  });

  // 3. Setup Intents API — Save Card on File via Confirmation Token
  app.post("/api/whop/setup-intent", async (req: Request, res: Response) => {
    const cfg = getWhopRuntimeConfig();
    const client = createWhopClient(cfg);

    if (!client || !cfg.companyId) {
      res.status(503).json({
        error: "Whop Setup Intents API requires WHOP_API_KEY and WHOP_COMPANY_ID.",
        requiresConfiguration: true,
      });
      return;
    }

    const { confirmationToken, email, customerName, projectName, returnUrl, consentAccepted } =
      req.body || {};

    if (!consentAccepted) {
      res.status(400).json({ error: "Customer authorization consent is required to save a payment method on file." });
      return;
    }
    if (typeof confirmationToken !== "string" || !confirmationToken.trim()) {
      res.status(400).json({ error: "Missing confirmationToken from Whop PaymentElement." });
      return;
    }

    try {
      const setupIntent = await client.setupIntents.create({
        account_id: cfg.companyId,
        confirmation_token: confirmationToken.trim(),
        currency: "usd",
        email: typeof email === "string" && email.trim() ? email.trim() : undefined,
        return_url: typeof returnUrl === "string" && returnUrl.startsWith("https://") ? returnUrl : undefined,
        metadata: {
          workflow: "skyfy_deposit_to_final_invoice",
          customer_name: typeof customerName === "string" ? customerName : "",
          project_name: typeof projectName === "string" ? projectName : "",
          off_session_consent: "true",
          consented_at: new Date().toISOString(),
        },
      });

      res.status(201).json({ ok: true, setupIntent });
    } catch (err) {
      const info = extractWhopError(err);
      res.status(info.status).json({ error: info.message, details: info.details });
    }
  });

  // 4. Retrieve Setup Intent Status (poll for payment_method_id)
  app.get("/api/whop/setup-intent/:id", async (req: Request, res: Response) => {
    const cfg = getWhopRuntimeConfig();
    const client = createWhopClient(cfg);

    if (!client) {
      res.status(503).json({ error: "WHOP_API_KEY is not configured.", requiresConfiguration: true });
      return;
    }

    const setupIntentId = String(req.params.id || "");
    try {
      const setupIntent = await client.setupIntents.retrieve({ id: setupIntentId });
      res.json({ ok: true, setupIntent });
    } catch (err) {
      const info = extractWhopError(err);
      res.status(info.status).json({ error: info.message, details: info.details });
    }
  });

  // 5. Invoices API — Create & Issue Final Project Invoice
  app.post("/api/whop/invoices", async (req: Request, res: Response) => {
    const cfg = getWhopRuntimeConfig();
    const client = createWhopClient(cfg);

    if (!client || !cfg.companyId) {
      res.status(503).json({
        error: "Whop Invoices API requires WHOP_API_KEY and WHOP_COMPANY_ID.",
        requiresConfiguration: true,
      });
      return;
    }

    const {
      customerName,
      customerEmail,
      memberId,
      paymentMethodId,
      planId,
      quantity,
      memo,
      dueInDays,
      billingAddress,
      issueImmediately,
    } = req.body || {};

    const resolvedPlanId =
      (typeof planId === "string" && planId.trim()) || cfg.plans.finalInvoice;

    if (!resolvedPlanId) {
      res.status(400).json({
        error:
          "A Whop final invoice plan/variant ID (WHOP_PLAN_FINAL_INVOICE_ID) is required by the Whop Invoices API to create line items.",
        requiresConfiguration: true,
        missingEnvVars: ["WHOP_PLAN_FINAL_INVOICE_ID"],
      });
      return;
    }

    if (typeof customerEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      res.status(400).json({ error: "A valid customer email address is required to create an invoice." });
      return;
    }

    const days = typeof dueInDays === "number" && dueInDays > 0 ? dueInDays : 14;
    const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    try {
      const draftInvoice = await client.invoices.create({
        account_id: cfg.companyId,
        customer_name: typeof customerName === "string" && customerName.trim() ? customerName.trim() : undefined,
        email_address: customerEmail.trim(),
        member_id: typeof memberId === "string" && memberId.trim() ? memberId.trim() : undefined,
        payment_method_id:
          typeof paymentMethodId === "string" && paymentMethodId.trim()
            ? paymentMethodId.trim()
            : undefined,
        recipient_emails: [customerEmail.trim()],
        due_at: dueDate,
        memo:
          typeof memo === "string" && memo.trim()
            ? memo.trim()
            : "SkyFy Roofing – Final project balance invoice upon completion.",
        billing_address:
          billingAddress && billingAddress.line1 && billingAddress.city && billingAddress.postal_code
            ? {
                name: customerName || undefined,
                line1: String(billingAddress.line1),
                city: String(billingAddress.city),
                state: billingAddress.state ? String(billingAddress.state) : undefined,
                postal_code: String(billingAddress.postal_code),
                country: String(billingAddress.country || "US"),
              }
            : undefined,
        items: [
          {
            variant_id: resolvedPlanId,
            quantity: typeof quantity === "number" && quantity > 0 ? quantity : 1,
          },
        ],
        metadata: {
          workflow: "skyfy_deposit_to_final_invoice",
          created_from: "skyfy_roofing_website",
        },
      });

      let finalInvoice = draftInvoice;
      if (issueImmediately !== false) {
        finalInvoice = await client.invoices.issue({
          id: draftInvoice.id,
          collection_method: paymentMethodId ? "charge_automatically" : "send_invoice",
        });
      }

      res.status(201).json({ ok: true, invoice: finalInvoice });
    } catch (err) {
      const info = extractWhopError(err);
      res.status(info.status).json({ error: info.message, details: info.details });
    }
  });

  // 6. Charge Open Invoice Using Stored Payment Method
  app.post("/api/whop/invoices/:id/charge", async (req: Request, res: Response) => {
    const cfg = getWhopRuntimeConfig();
    const client = createWhopClient(cfg);

    if (!client) {
      res.status(503).json({ error: "WHOP_API_KEY is not configured.", requiresConfiguration: true });
      return;
    }

    const invoiceId = String(req.params.id || "");
    const { paymentMethodId, customerAuthorized } = req.body || {};

    if (!customerAuthorized) {
      res.status(400).json({
        error: "Stored payment method charge requires verified customer off-session authorization.",
      });
      return;
    }

    try {
      const chargedInvoice = await client.invoices.charge({
        id: invoiceId,
        payment_method_id:
          typeof paymentMethodId === "string" && paymentMethodId.trim()
            ? paymentMethodId.trim()
            : undefined,
      });
      res.json({ ok: true, invoice: chargedInvoice });
    } catch (err) {
      const info = extractWhopError(err);
      res.status(info.status).json({ error: info.message, details: info.details });
    }
  });

  // 7. Send Open/Draft Invoice for Manual Customer Payment
  app.post("/api/whop/invoices/:id/send", async (req: Request, res: Response) => {
    const cfg = getWhopRuntimeConfig();
    const client = createWhopClient(cfg);

    if (!client) {
      res.status(503).json({ error: "WHOP_API_KEY is not configured.", requiresConfiguration: true });
      return;
    }

    const invoiceId = String(req.params.id || "");
    try {
      const sentInvoice = await client.invoices.send({
        id: invoiceId,
        collection_method: "send_invoice",
      });
      res.json({ ok: true, invoice: sentInvoice });
    } catch (err) {
      const info = extractWhopError(err);
      res.status(info.status).json({ error: info.message, details: info.details });
    }
  });

  // Vite Dev Middleware or Static Production Build
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkyFy Roofing server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
