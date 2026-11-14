import { useState } from "react";
import { X } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export function Footer() {
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-[#0B1F3A] text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="#top"
              className="inline-flex items-center gap-2.5 text-white font-display font-bold text-xl tracking-tight"
            >
              <svg
                width="28"
                height="20"
                viewBox="0 0 28 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 13L14 3L26 13"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 17L14 10.5L22 17"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{siteConfig.brand.name}</span>
            </a>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              {siteConfig.brand.tagline}. Built for residential homeowners, property managers, and commercial facilities across the United States.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {siteConfig.socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-xs font-medium text-slate-300 hover:text-[#38BDF8] transition-colors"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-bold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-white transition-colors">
                  Why Choose Us
                </a>
              </li>
              <li>
                <a href="#process" className="hover:text-white transition-colors">
                  Our Process
                </a>
              </li>
              <li>
                <a href="#payments" className="hover:text-white transition-colors">
                  Whop Payments
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-white transition-colors">
                  Deposit &amp; Invoicing
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-bold text-white mb-4">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              {siteConfig.services.map((service) => (
                <li key={service.id}>
                  <a href="#services" className="hover:text-white transition-colors">
                    {service.title}
                  </a>
                </li>
              ))}
              <li>
                <a href="#financing" className="hover:text-white transition-colors">
                  Payment Options
                </a>
              </li>
            </ul>
          </div>

          {/* Service Areas & Placeholder Contact */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <h3 className="font-display text-sm font-bold text-white mb-3">
                Demo Service Areas
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {siteConfig.serviceAreas.locations
                  .map((loc) => `${loc.city}, ${loc.state}`)
                  .join(" · ")}
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-bold text-white mb-3">
                Contact Information (Editable Placeholders)
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-300">
                <li>{siteConfig.contact.phoneDisplay}</li>
                <li>{siteConfig.contact.email}</li>
                <li>{siteConfig.contact.address}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {currentYear} {siteConfig.brand.legalEntity}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setLegalModal("privacy")}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalModal("terms")}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Legal Policy Modal */}
      {legalModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/70 backdrop-blur-xs"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="bg-white text-slate-800 rounded-xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 id="legal-modal-title" className="font-display text-xl font-bold text-[#0B1F3A]">
                {legalModal === "privacy" ? "Privacy Policy (Template)" : "Terms of Service (Template)"}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                aria-label="Close legal dialog"
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {legalModal === "privacy" ? (
              <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                <p>
                  This template Privacy Policy explains how {siteConfig.brand.name} handles estimate inquiry details (name, email, phone, property address, and project scope) submitted through this website.
                </p>
                <p>
                  Lead submissions are transmitted to Whop Leads API for customer follow-up. Payment card details and wallet transactions are collected directly inside Whop&apos;s PCI-isolated Payment Elements and never touch our application server.
                </p>
                <p className="text-xs text-slate-500">
                  Replace this notice with your roofing company&apos;s reviewed legal policy prior to production launch.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                <p>
                  All roofing estimates, inspection findings, deposit terms, and final project invoices are governed by the written roofing agreement executed between {siteConfig.brand.name} and the property owner.
                </p>
                <p>
                  Deposits, card-on-file setup authorizations, and final invoices are processed through Whop Payments subject to Whop&apos;s Buyer Terms of Service and merchant configuration.
                </p>
                <p className="text-xs text-slate-500">
                  Replace this template text with your company&apos;s state-compliant construction terms prior to live commercial deployment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
