import { useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Payments", href: "#payments" },
  { label: "Workflow", href: "#workflow" },
  { label: "Service Areas", href: "#service-areas" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title (single line, clean architectural roofline mark) */}
        <a
          href="#top"
          className="flex items-center gap-2.5 text-[#0B1F3A] font-display font-bold text-lg tracking-tight whitespace-nowrap shrink-0"
        >
          <svg
            width="28"
            height="20"
            viewBox="0 0 28 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M2 13L14 3L26 13"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 17L14 10.5L22 17"
              stroke="#0B1F3A"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{siteConfig.brand.name}</span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#0B1F3A] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#0284C7]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#estimate-form"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 shadow-xs"
          >
            Request Estimate
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#0B1F3A] hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1F3A]"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#estimate-form"
            onClick={handleLinkClick}
            className="block w-full text-center mt-2 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1]"
          >
            Request a Free Estimate
          </a>
        </div>
      )}
    </header>
  );
}
