import { ArrowRight, CheckCircle2 } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { ResilientImage } from "./ResilientImage";

export function HeroSection() {
  const { hero, brand } = siteConfig;

  return (
    <section id="top" className="relative bg-[#0B1F3A] text-white overflow-hidden">
      {/* Full-width Architectural Roofing Backdrop */}
      <div className="relative min-h-[540px] lg:min-h-[620px] flex items-center">
        <div className="absolute inset-0">
          <ResilientImage
            src={hero.imageUrl}
            alt={hero.imageAlt}
            loading="eager"
            fallbackTitle={brand.name}
            className="w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#07152B]/95 via-[#0B1F3A]/82 to-[#0B1F3A]/35"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#7DD3FC] tracking-wide mb-4">
              {brand.tagline} · {brand.regionDescriptor}
            </p>
            <h1
              className="font-display font-bold text-white tracking-tight leading-[1.08] mb-6"
              style={{
                fontSize: "clamp(2.25rem, 4.2vw, 3.75rem)",
                textWrap: "balance",
              }}
            >
              {hero.headline}
            </h1>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl mb-8">
              {hero.subheading}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#estimate-form"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#0284C7] hover:bg-[#0EA5E9] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 shadow-sm"
              >
                <span>{hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 backdrop-blur-xs"
              >
                {hero.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicator Strip */}
      <div className="relative z-10 bg-[#08172D] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {hero.trustIndicators.map((indicator) => (
              <div key={indicator} className="flex items-center gap-3 text-sm font-medium text-slate-100">
                <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" aria-hidden="true" />
                <span>{indicator}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
