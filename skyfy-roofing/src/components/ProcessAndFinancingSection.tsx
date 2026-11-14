import { ArrowRight, Info } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

export function ProcessAndFinancingSection() {
  const { process, financing } = siteConfig;

  return (
    <>
      {/* Our Process */}
      <section id="process" className="py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-semibold text-[#0284C7] mb-2">
              Our Process
            </p>
            <h2
              className="font-display font-bold text-[#0B1F3A] tracking-tight mb-4"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", textWrap: "balance" }}
            >
              Four Clear Steps from First Call to Final Walkthrough
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Every homeowner and property manager knows exactly what happens next—from on-site inspection through deposit and final completion billing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((item) => (
              <div
                key={item.step}
                className="bg-[#F8FAFC] rounded-xl border border-slate-200 p-6 flex flex-col"
              >
                <span className="font-mono text-2xl font-bold text-[#0284C7] tabular-nums mb-4">
                  {item.step}
                </span>
                <h3 className="font-display text-lg font-bold text-[#0B1F3A] mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financing Callout */}
      <section id="financing" className="py-16 lg:py-20 bg-[#0B1F3A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <p className="text-sm font-medium text-[#7DD3FC] mb-2">
                Flexible Roofing Payment Options
              </p>
              <h2
                className="font-display font-bold text-white tracking-tight mb-4"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)", textWrap: "balance" }}
              >
                {financing.headline}
              </h2>
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mb-4">
                {financing.description}
              </p>
              <p className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed max-w-2xl">
                <Info className="w-4 h-4 text-[#7DD3FC] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{financing.disclosure}</span>
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <a
                href="#payments"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-[#0B1F3A] bg-[#38BDF8] hover:bg-[#7DD3FC] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                <span>{financing.cta}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
