import { Shield, Layers, FileText, Users, Hammer, MessageSquare } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { ResilientImage } from "./ResilientImage";

const PILLAR_ICONS = [Users, Layers, FileText, Shield, Hammer, MessageSquare];

export function WhyChooseSection() {
  const { whyChooseUs } = siteConfig;

  return (
    <section id="why-us" className="py-20 lg:py-24 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Architectural Project Showcase */}
          <div className="lg:col-span-5 flex flex-col">
            <p className="text-sm font-semibold text-[#0284C7] mb-2">
              Why Choose {siteConfig.brand.name}
            </p>
            <h2
              className="font-display font-bold text-[#0B1F3A] tracking-tight mb-4"
              style={{ fontSize: "clamp(1.75rem, 2.8vw, 2.25rem)", textWrap: "balance" }}
            >
              {whyChooseUs.headline}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-8">
              {whyChooseUs.subheading}
            </p>

            <div className="flex-1 min-h-[280px] rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
              <ResilientImage
                src={whyChooseUs.showcaseImageUrl}
                alt={whyChooseUs.showcaseImageAlt}
                fallbackTitle="Residential & Commercial Roofing Showcase"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: 6 Core Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
            {whyChooseUs.pillars.map((pillar, index) => {
              const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length];
              return (
                <div
                  key={pillar.title}
                  className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-base font-bold text-[#0B1F3A] mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
