import { useState, type FormEvent } from "react";
import {
  BrandingElement,
  Checkout,
  CheckoutElement,
  ExpressCheckoutElement,
  PaymentElement,
  Payments,
  usePayments,
  useWhop,
} from "@whop/elements-react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileCheck2,
  Lock,
  Send,
} from "lucide-react";
import { trackWhopEvent } from "../lib/whopTracking";
import type {
  PublicWhopConfig,
  WhopInvoiceSummary,
  WhopSetupIntentSummary,
} from "../types/whop";

interface DepositInvoiceWorkflowSectionProps {
  whopConfig: PublicWhopConfig | null;
  depositPaymentId: string | null;
  onDepositCompleted: (paymentId: string, sessionId: string) => void;
  onTrackingEventLogged: (message: string) => void;
}

const PROJECT_OPTIONS = [
  {
    id: "architectural-replacement",
    name: "Complete Architectural Shingle Replacement (2,600 sq ft)",
    estimatedTotal: "$14,800",
    deposit: "$500",
    remainingEstimate: "$14,300",
  },
  {
    id: "standing-seam-metal",
    name: "Standing-Seam Metal Roof Upgrade",
    estimatedTotal: "$24,500",
    deposit: "$500",
    remainingEstimate: "$24,000",
  },
  {
    id: "storm-restoration",
    name: "Storm & Wind Roof Restoration Package",
    estimatedTotal: "$6,400",
    deposit: "$500",
    remainingEstimate: "$5,900",
  },
];

interface SetupIntentCardFormProps {
  customerName: string;
  customerEmail: string;
  projectName: string;
  onSetupComplete: (intent: WhopSetupIntentSummary) => void;
}

function SetupIntentCardForm({
  customerName,
  customerEmail,
  projectName,
  onSetupComplete,
}: SetupIntentCardFormProps) {
  const whop = useWhop();
  const payments = usePayments();
  const [elementComplete, setElementComplete] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveCard = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!consentChecked) {
      setErrorMsg("Customer consent must be checked before saving a payment method on file.");
      return;
    }
    if (!payments || !whop) {
      setErrorMsg("Whop Payment Elements are still initializing. Please wait a moment.");
      return;
    }
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setErrorMsg("Please enter a valid customer email address above before saving a card.");
      return;
    }

    setSubmitting(true);
    try {
      const { confirmationToken } = await payments.createConfirmationToken({
        billingDetails: {
          email: customerEmail.trim(),
          name: customerName.trim() || "SkyFy Customer",
          address: {
            country: "US",
          },
        },
      });

      const response = await fetch("/api/whop/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationToken,
          email: customerEmail.trim(),
          customerName: customerName.trim(),
          projectName,
          consentAccepted: true,
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create Whop Setup Intent.");
      }

      let setupIntent: WhopSetupIntentSummary = data.setupIntent;

      if (setupIntent.client_secret && setupIntent.status !== "succeeded") {
        await whop.payments.handleNextAction({
          clientSecret: setupIntent.client_secret,
          returnUrl: window.location.href,
        });

        const pollRes = await fetch(`/api/whop/setup-intent/${encodeURIComponent(setupIntent.id)}`);
        const pollData = await pollRes.json();
        if (pollRes.ok && pollData.setupIntent) {
          setupIntent = pollData.setupIntent;
        }
      }

      onSetupComplete(setupIntent);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not save payment method.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSaveCard} className="space-y-4">
      <div className="rounded-lg border border-slate-200 p-4 bg-white">
        <PaymentElement
          onChange={(ev) => setElementComplete(Boolean(ev.complete))}
        />
      </div>

      {/* Mandatory Whop BrandingElement required for PaymentElement confirmation */}
      <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
        <BrandingElement />
      </div>

      <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 bg-[#F8FAFC] cursor-pointer">
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0284C7]"
        />
        <span className="text-xs text-slate-700 leading-relaxed">
          I authorize <strong>SkyFy Roofing</strong> and Whop to securely save this payment method on file for off-session billing of the remaining project balance upon completion and final walkthrough approval.
        </span>
      </label>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !elementComplete || !consentChecked}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 disabled:text-slate-500 rounded-lg transition-colors"
      >
        <Lock className="w-4 h-4" aria-hidden="true" />
        <span>{submitting ? "Saving Payment Method..." : "Save Card on File (Setup Intent)"}</span>
      </button>
    </form>
  );
}

export function DepositInvoiceWorkflowSection({
  whopConfig,
  depositPaymentId,
  onDepositCompleted,
  onTrackingEventLogged,
}: DepositInvoiceWorkflowSectionProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECT_OPTIONS[0].id);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [depositCheckoutMode, setDepositCheckoutMode] = useState<"full" | "express">("full");
  const [depositCheckoutOpen, setDepositCheckoutOpen] = useState(false);

  const [setupIntent, setSetupIntent] = useState<WhopSetupIntentSummary | null>(null);
  const [manualPaymentMethodId, setManualPaymentMethodId] = useState("");
  const [invoicePlanOverride, setInvoicePlanOverride] = useState("");
  const [invoiceMemo, setInvoiceMemo] = useState(
    "Final project balance upon completion and homeowner walkthrough.",
  );
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [invoiceActionLoading, setInvoiceActionLoading] = useState<"charge" | "send" | null>(null);
  const [invoice, setInvoice] = useState<WhopInvoiceSummary | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [workflowNotice, setWorkflowNotice] = useState<string | null>(null);

  const selectedProject =
    PROJECT_OPTIONS.find((p) => p.id === selectedProjectId) || PROJECT_OPTIONS[0];

  const depositPlanId = whopConfig?.plans.deposit || null;
  const companyId = whopConfig?.companyId || null;
  const effectivePaymentMethodId =
    setupIntent?.payment_method_id || manualPaymentMethodId.trim() || null;

  const handleOpenDepositStep = () => {
    setDepositCheckoutOpen(true);
    const res = trackWhopEvent("deposit_started", {
      source: "deposit_invoice_workflow",
      project: selectedProject.name,
      amount_usd: 500,
    });
    onTrackingEventLogged(
      res.tracked
        ? `whop.track("deposit_started", { source: "workflow" }) dispatched`
        : `deposit_started triggered (${res.reason})`,
    );
  };

  const handleCreateFinalInvoice = async () => {
    setWorkflowError(null);
    setWorkflowNotice(null);

    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setWorkflowError("Enter a valid customer email address in Step 1 before creating an invoice.");
      return;
    }

    setCreatingInvoice(true);
    try {
      const res = await fetch("/api/whop/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || "SkyFy Roofing Client",
          customerEmail: customerEmail.trim(),
          paymentMethodId: effectivePaymentMethodId || undefined,
          planId: invoicePlanOverride.trim() || undefined,
          memo: `${selectedProject.name} — ${invoiceMemo}`,
          dueInDays: 14,
          issueImmediately: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create Whop invoice.");
      }
      setInvoice(data.invoice);
      setWorkflowNotice(`Invoice ${data.invoice.number || data.invoice.id} created and issued via Whop Invoices API.`);
      setActiveStep(5);
    } catch (err) {
      setWorkflowError(err instanceof Error ? err.message : "Invoice creation failed.");
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleChargeStoredMethod = async () => {
    if (!invoice) return;
    setWorkflowError(null);
    setWorkflowNotice(null);

    if (!effectivePaymentMethodId) {
      setWorkflowError("No saved payment method ID (payt_...) is attached. Complete Step 3 or send the invoice for manual payment.");
      return;
    }

    setInvoiceActionLoading("charge");
    try {
      const res = await fetch(`/api/whop/invoices/${encodeURIComponent(invoice.id)}/charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId: effectivePaymentMethodId,
          customerAuthorized: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to charge stored payment method.");
      }
      setInvoice(data.invoice);
      setWorkflowNotice(`Charge submitted for invoice ${data.invoice.id}. Current status: ${data.invoice.status}.`);
    } catch (err) {
      setWorkflowError(err instanceof Error ? err.message : "Failed to charge stored payment method.");
    } finally {
      setInvoiceActionLoading(null);
    }
  };

  const handleSendManualInvoice = async () => {
    if (!invoice) return;
    setWorkflowError(null);
    setWorkflowNotice(null);
    setInvoiceActionLoading("send");

    try {
      const res = await fetch(`/api/whop/invoices/${encodeURIComponent(invoice.id)}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send Whop invoice.");
      }
      setInvoice(data.invoice);
      setWorkflowNotice(`Invoice ${data.invoice.id} emailed to ${customerEmail} for manual payment.`);
    } catch (err) {
      setWorkflowError(err instanceof Error ? err.message : "Failed to send invoice.");
    } finally {
      setInvoiceActionLoading(null);
    }
  };

  const STEP_LABELS = [
    "1. Select Project",
    "2. $500 Deposit",
    "3. Save Card on File",
    "4. Create Final Invoice",
    "5. Charge or Send",
  ];

  return (
    <section id="workflow" className="py-20 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-sm font-semibold text-[#0284C7] mb-2">
            Deposit-to-Final-Invoice Billing Workflow
          </p>
          <h2
            className="font-display font-bold text-[#0B1F3A] tracking-tight mb-4"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", textWrap: "balance" }}
          >
            End-to-End Roofing Deposit, Card-on-File Setup &amp; Final Invoice Flow
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Walk through the complete 5-stage Whop billing lifecycle: collect a $500 project deposit, authorize a card on file via Whop Setup Intents, issue a final invoice upon project completion, and either charge the stored payment method or send a payment link.
          </p>
        </div>

        {/* Stepper Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = activeStep === stepNum;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveStep(stepNum)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                    : "bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Step Workspace */}
          <div className="lg:col-span-8 bg-[#F8FAFC] rounded-xl border border-slate-200 p-6 sm:p-8">
            {/* Step 1: Select Project & Customer Info */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#0B1F3A] mb-1">
                    Step 1: Select Roofing Project &amp; Homeowner Details
                  </h3>
                  <p className="text-sm text-slate-600">
                    Choose a roofing project scope and enter the property owner&apos;s billing name and email used across deposit checkout, card setup, and final invoicing.
                  </p>
                </div>

                <div className="space-y-3">
                  {PROJECT_OPTIONS.map((project) => (
                    <label
                      key={project.id}
                      className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border bg-white cursor-pointer transition-colors ${
                        selectedProjectId === project.id
                          ? "border-[#0284C7] ring-2 ring-[#0284C7]/15"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="workflowProject"
                          checked={selectedProjectId === project.id}
                          onChange={() => setSelectedProjectId(project.id)}
                          className="h-4 w-4 text-[#0284C7]"
                        />
                        <div>
                          <p className="font-display text-sm font-bold text-[#0B1F3A]">
                            {project.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Initial Deposit: {project.deposit} · Est. Final Balance: {project.remainingEstimate}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-base font-bold text-[#0B1F3A] tabular-nums">
                        {project.estimatedTotal}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="wf-name" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                      Customer Full Name
                    </label>
                    <input
                      id="wf-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g., Jordan Vance"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label htmlFor="wf-email" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                      Customer Email Address
                    </label>
                    <input
                      id="wf-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors"
                  >
                    <span>Continue to $500 Deposit</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: $500 Deposit Checkout */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0B1F3A] mb-1">
                      Step 2: Collect $500 Project Deposit via Whop Checkout
                    </h3>
                    <p className="text-sm text-slate-600">
                      Customer pays the initial $500 deposit for <strong>{selectedProject.name}</strong> using Whop&apos;s hosted CheckoutElement or ExpressCheckoutElement.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setDepositCheckoutMode("full")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        depositCheckoutMode === "full" ? "bg-white text-[#0B1F3A]" : "text-slate-600"
                      }`}
                    >
                      CheckoutElement
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositCheckoutMode("express")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        depositCheckoutMode === "express" ? "bg-white text-[#0B1F3A]" : "text-slate-600"
                      }`}
                    >
                      ExpressCheckoutElement
                    </button>
                  </div>
                </div>

                {!depositCheckoutOpen ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-base font-bold text-[#0B1F3A]">
                        Roofing Project Deposit · $500.00
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Triggers <code className="font-mono">whop.track(&quot;deposit_started&quot;)</code> and opens Whop checkout.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenDepositStep}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors"
                    >
                      Begin $500 Deposit Checkout
                    </button>
                  </div>
                ) : depositPlanId && depositPlanId.startsWith("plan_") ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <Checkout
                      key={`wf-${depositPlanId}-${depositCheckoutMode}`}
                      plan={depositPlanId}
                      returnUrl={window.location.href}
                      onComplete={(payload) => {
                        if (payload.result === "payment") {
                          onDepositCompleted(payload.paymentId, payload.sessionId);
                        }
                      }}
                    >
                      {depositCheckoutMode === "full" ? (
                        <CheckoutElement buyerEmail={customerEmail || undefined} />
                      ) : (
                        <ExpressCheckoutElement layout="auto" />
                      )}
                    </Checkout>
                  </div>
                ) : (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-950 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-bold mb-1">WHOP_PLAN_DEPOSIT_ID Required for Live $500 Deposit</p>
                      <p className="text-xs leading-relaxed">
                        Configure <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">WHOP_PLAN_DEPOSIT_ID=plan_...</code> in your environment variables to mount the live $500 deposit checkout element.
                      </p>
                    </div>
                  </div>
                )}

                {depositPaymentId && (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-950 flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                    <span>
                      Deposit Payment Recorded: <code className="font-mono font-semibold">{depositPaymentId}</code>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg"
                  >
                    <span>Next: Card-on-File Setup</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Save Card on File via Whop Setup Intent */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#0B1F3A] mb-1">
                    Step 3: Save Card on File (Whop Setup Intent + Consent)
                  </h3>
                  <p className="text-sm text-slate-600">
                    Mounts Whop <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">PaymentElement</code> +{" "}
                    <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">BrandingElement</code> in{" "}
                    <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">mode=&quot;setup&quot;</code> to store a payment method without charging immediately.
                  </p>
                </div>

                {companyId && companyId.startsWith("biz_") ? (
                  <Payments
                    accountId={companyId}
                    mode="setup"
                    currency="usd"
                    setupFutureUsage="off_session"
                    returnUrl={typeof window !== "undefined" ? window.location.href : undefined}
                  >
                    <SetupIntentCardForm
                      customerName={customerName}
                      customerEmail={customerEmail}
                      projectName={selectedProject.name}
                      onSetupComplete={(intent) => {
                        setSetupIntent(intent);
                        setWorkflowNotice(
                          `Setup Intent ${intent.id} created (status: ${intent.status}).`,
                        );
                      }}
                    />
                  </Payments>
                ) : (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-950 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-bold mb-1">WHOP_COMPANY_ID &amp; WHOP_API_KEY Required</p>
                      <p className="text-xs leading-relaxed">
                        Configure <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">WHOP_COMPANY_ID=biz_...</code> and{" "}
                        <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">WHOP_API_KEY</code> to mount the Setup Intent{" "}
                        <code className="font-mono">&lt;PaymentElement /&gt;</code> and <code className="font-mono">&lt;BrandingElement /&gt;</code>.
                      </p>
                    </div>
                  </div>
                )}

                {setupIntent && (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1 font-mono">
                    <p className="font-sans font-semibold text-sm">Setup Intent Stored</p>
                    <p>Setup Intent ID: {setupIntent.id}</p>
                    <p>Status: {setupIntent.status}</p>
                    <p>Saved Payment Method ID: {setupIntent.payment_method_id || "Pending verification"}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg"
                  >
                    <span>Next: Create Final Invoice</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Create Final Project Invoice */}
            {activeStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#0B1F3A] mb-1">
                    Step 4: Project Completed — Create Final Invoice (Whop Invoices API)
                  </h3>
                  <p className="text-sm text-slate-600">
                    Calls <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">POST /api/whop/invoices</code> to create and issue a real receipt-backed invoice in Whop.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inv-plan" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                      Final Invoice Plan ID (optional override)
                    </label>
                    <input
                      id="inv-plan"
                      type="text"
                      value={invoicePlanOverride}
                      onChange={(e) => setInvoicePlanOverride(e.target.value)}
                      placeholder={whopConfig?.plans.finalInvoice || "Uses WHOP_PLAN_FINAL_INVOICE_ID"}
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label htmlFor="inv-pm" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                      Stored Payment Method ID (optional)
                    </label>
                    <input
                      id="inv-pm"
                      type="text"
                      value={setupIntent?.payment_method_id || manualPaymentMethodId}
                      onChange={(e) => setManualPaymentMethodId(e.target.value)}
                      placeholder="payt_xxxxxxxxxxxxx (from Step 3)"
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="inv-memo" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                    Invoice Memo / Completion Summary
                  </label>
                  <textarea
                    id="inv-memo"
                    rows={2}
                    value={invoiceMemo}
                    onChange={(e) => setInvoiceMemo(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={creatingInvoice}
                    onClick={handleCreateFinalInvoice}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-400 rounded-lg"
                  >
                    <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                    <span>{creatingInvoice ? "Creating Whop Invoice..." : "Create & Issue Final Invoice"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Charge Stored Method or Send Manual Invoice */}
            {activeStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#0B1F3A] mb-1">
                    Step 5: Charge Stored Payment Method or Send Invoice
                  </h3>
                  <p className="text-sm text-slate-600">
                    Choose whether to charge the authorized card on file via Whop Invoices API or email the hosted Whop invoice checkout link for manual customer payment.
                  </p>
                </div>

                {invoice ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500">Whop Invoice Record</p>
                        <p className="font-mono text-sm font-bold text-[#0B1F3A]">
                          {invoice.number || invoice.id}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#0284C7]">
                        Status: {invoice.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-slate-600">
                      <div>Invoice ID: {invoice.id}</div>
                      <div>Payment Method: {invoice.payment_method_id || effectivePaymentMethodId || "None"}</div>
                    </div>

                    {invoice.checkout_link && (
                      <a
                        href={invoice.checkout_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:underline"
                      >
                        <span>Open Whop Invoice Checkout Link</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        disabled={invoiceActionLoading !== null || !effectivePaymentMethodId}
                        onClick={handleChargeStoredMethod}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-[#152E52] disabled:bg-slate-300 disabled:text-slate-500 rounded-lg transition-colors"
                      >
                        <CreditCard className="w-4 h-4" aria-hidden="true" />
                        <span>
                          {invoiceActionLoading === "charge"
                            ? "Charging Stored Method..."
                            : "Charge Stored Payment Method"}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={invoiceActionLoading !== null}
                        onClick={handleSendManualInvoice}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" aria-hidden="true" />
                        <span>
                          {invoiceActionLoading === "send"
                            ? "Sending Invoice..."
                            : "Send Invoice for Manual Payment"}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-600">
                    No invoice has been created in this session yet. Complete Step 4 first to generate a real Whop invoice ID (<code className="font-mono text-xs">pay_...</code>).
                  </div>
                )}

                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg"
                  >
                    Back to Invoice Creation
                  </button>
                </div>
              </div>
            )}

            {workflowError && (
              <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{workflowError}</span>
              </div>
            )}

            {workflowNotice && (
              <div className="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{workflowNotice}</span>
              </div>
            )}
          </div>

          {/* Right: Live Workflow State & Credentials Checklist */}
          <aside className="lg:col-span-4 bg-[#0B1F3A] text-white rounded-xl p-6 sm:p-7 space-y-6">
            <div>
              <p className="text-xs font-medium text-[#7DD3FC] mb-1">
                Active Session Summary
              </p>
              <h3 className="font-display text-lg font-bold">
                {selectedProject.name}
              </h3>
            </div>

            <dl className="space-y-3 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-300">Client</dt>
                <dd className="font-medium text-right truncate max-w-[190px]">
                  {customerName || customerEmail || "Not entered"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-300">Deposit Status</dt>
                <dd className="font-mono text-xs text-right">
                  {depositPaymentId || "Awaiting checkout"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-300">Setup Intent</dt>
                <dd className="font-mono text-xs text-right">
                  {setupIntent?.id || "Not created"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-300">Saved Method</dt>
                <dd className="font-mono text-xs text-right">
                  {effectivePaymentMethodId || "None"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-300">Final Invoice</dt>
                <dd className="font-mono text-xs text-right">
                  {invoice ? `${invoice.id} (${invoice.status})` : "Not issued"}
                </dd>
              </div>
            </dl>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-semibold text-[#7DD3FC] mb-2.5">
                Whop Environment Readiness
              </p>
              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center justify-between gap-2">
                  <span>API Key &amp; Company ID</span>
                  <span className="font-mono">
                    {whopConfig?.capabilities.invoicesApi ? "Configured" : "Required"}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span>$500 Deposit Plan</span>
                  <span className="font-mono">
                    {whopConfig?.plans.deposit ? "Configured" : "Required"}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span>Final Invoice Plan</span>
                  <span className="font-mono">
                    {whopConfig?.plans.finalInvoice ? "Configured" : "Required"}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span>Whop Tracking Pixel</span>
                  <span className="font-mono">
                    {whopConfig?.capabilities.trackingPixel ? "Active" : "Needs biz_ ID"}
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
