import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { trackWhopEvent } from "../lib/whopTracking";
import type { PublicWhopConfig } from "../types/whop";

interface EstimateFormSectionProps {
  whopConfig: PublicWhopConfig | null;
  preselectedService: string;
  preselectedCity: string;
  onTrackingEventLogged: (message: string) => void;
}

export function EstimateFormSection({
  whopConfig,
  preselectedService,
  preselectedCity,
  onTrackingEventLogged,
}: EstimateFormSectionProps) {
  const formLoadedAtRef = useRef<number>(Date.now());
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [serviceRequired, setServiceRequired] = useState("Roof Replacement");
  const [projectDescription, setProjectDescription] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState("Phone");
  const [companyWebsiteHoneypot, setCompanyWebsiteHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([]);
  const [successLeadId, setSuccessLeadId] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedService) {
      setServiceRequired(preselectedService);
    }
  }, [preselectedService]);

  useEffect(() => {
    if (preselectedCity && !propertyAddress) {
      setPropertyAddress(preselectedCity);
    }
  }, [preselectedCity, propertyAddress]);

  const validateClient = (): string | null => {
    if (fullName.trim().length < 2) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    if (phone.replace(/\D/g, "").length < 10) {
      return "Please enter a valid 10-digit US phone number.";
    }
    if (propertyAddress.trim().length < 5) {
      return "Please enter the property address.";
    }
    if (!serviceRequired) return "Please select a roofing service.";
    if (projectDescription.trim().length < 10) {
      return "Please describe your project (at least 10 characters).";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMissingEnvVars([]);
    setSuccessLeadId(null);

    const validationError = validateClient();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/whop/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          propertyAddress: propertyAddress.trim(),
          serviceRequired,
          projectDescription: projectDescription.trim(),
          preferredContactMethod,
          companyWebsiteHoneypot,
          formLoadedAt: formLoadedAtRef.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.missingEnvVars)) {
          setMissingEnvVars(data.missingEnvVars);
        }
        throw new Error(data.error || "Unable to submit estimate request to Whop Leads API.");
      }

      const createdLeadId = data.lead?.id || "Submitted";
      setSuccessLeadId(createdLeadId);

      // Dispatch official Whop tracking event upon verified lead creation
      const trackRes = trackWhopEvent("estimate_requested", {
        service: serviceRequired,
        preferred_contact: preferredContactMethod,
        lead_id: createdLeadId,
      });
      onTrackingEventLogged(
        trackRes.tracked
          ? `whop.track("estimate_requested", { service: "${serviceRequired}" }) dispatched`
          : `estimate_requested triggered (${trackRes.reason})`,
      );

      setFullName("");
      setEmail("");
      setPhone("");
      setPropertyAddress("");
      setProjectDescription("");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit estimate request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="estimate-form" className="py-20 lg:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Contact & Placeholder Notice */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#0284C7] mb-2">
                Free Estimate Request
              </p>
              <h2
                className="font-display font-bold text-[#0B1F3A] tracking-tight mb-4"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", textWrap: "balance" }}
              >
                Schedule Your Roofing Estimate with {siteConfig.brand.name}
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Tell us about your roof repair, replacement, or inspection needs. Every valid request creates a real lead record inside the connected Whop merchant account.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Phone (Demo Placeholder)</p>
                  <a
                    href={siteConfig.contact.phoneHref}
                    className="font-display text-base font-bold text-[#0B1F3A] hover:text-[#0284C7]"
                  >
                    {siteConfig.contact.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Email (Demo Placeholder)</p>
                  <p className="font-display text-sm font-semibold text-[#0B1F3A]">
                    {siteConfig.contact.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Office Address (Demo Placeholder)</p>
                  <p className="text-sm text-slate-700">
                    {siteConfig.contact.address}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{siteConfig.contact.hours}</p>
                </div>
              </div>

              <p className="pt-3 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
                {siteConfig.contact.placeholderNotice}
              </p>
            </div>

            {!whopConfig?.capabilities.leadsApi && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-950 leading-relaxed">
                <p className="font-semibold mb-1">Whop Leads API Credentials Needed</p>
                <p>
                  Configure <code className="font-mono bg-white px-1 py-0.5 rounded">WHOP_API_KEY</code> and{" "}
                  <code className="font-mono bg-white px-1 py-0.5 rounded">WHOP_COMPANY_ID</code> on the server so form submissions create real leads in Whop.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Lead-Generation Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Honeypot field for spam protection (hidden visually and from screen readers) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="company-website-hp">Leave this field empty</label>
                <input
                  id="company-website-hp"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={companyWebsiteHoneypot}
                  onChange={(e) => setCompanyWebsiteHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="est-name" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="est-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Miller"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="est-email" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="est-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="est-phone" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="est-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(713) 555-0142"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="est-service" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                    Service Required <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="est-service"
                    value={serviceRequired}
                    onChange={(e) => setServiceRequired(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Roof Repair">Roof Repair</option>
                    <option value="Roof Replacement">Roof Replacement</option>
                    <option value="Roof Inspection">Roof Inspection</option>
                    <option value="Emergency Storm Restoration">Emergency Storm Restoration</option>
                    <option value="Commercial Roofing">Commercial Roofing</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="est-address" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                  Property Address <span className="text-red-600">*</span>
                </label>
                <input
                  id="est-address"
                  type="text"
                  required
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="Street address, City, TX, ZIP"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label htmlFor="est-desc" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                  Project Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="est-desc"
                  rows={4}
                  required
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe roof age, shingle or metal type, leak location, storm concerns, or preferred inspection window..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-[#0B1F3A] mb-2">
                  Preferred Contact Method
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {["Phone", "Email", "Text Message"].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg border cursor-pointer transition-colors ${
                        preferredContactMethod === method
                          ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="preferredContact"
                        value={method}
                        checked={preferredContactMethod === method}
                        onChange={(e) => setPreferredContactMethod(e.target.value)}
                        className="sr-only"
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-medium">{errorMessage}</p>
                    {missingEnvVars.length > 0 && (
                      <p className="font-mono text-xs mt-1.5">
                        Missing server env vars: {missingEnvVars.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {successLeadId && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-950 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">
                      Estimate Request Received — Lead Created in Whop
                    </p>
                    <p className="text-xs text-emerald-800 mt-1">
                      Whop Lead Reference: <code className="font-mono font-semibold">{successLeadId}</code>. Our team will reach out via {preferredContactMethod}.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-400 rounded-lg transition-colors duration-150"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{submitting ? "Submitting to Whop Leads API..." : "Request My Free Estimate"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
