import { useState } from "react";
import { ArrowRight, Check, Clock, X } from "lucide-react";
import { siteConfig, type ServiceItem } from "../config/siteConfig";
import { trackWhopEvent } from "../lib/whopTracking";
import { ResilientImage } from "./ResilientImage";

interface ServicesSectionProps {
  onSelectServiceForEstimate: (serviceTitle: string) => void;
  onTrackingEventLogged: (message: string) => void;
}

export function ServicesSection({
  onSelectServiceForEstimate,
  onTrackingEventLogged,
}: ServicesSectionProps) {
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);

  const handleLearnMore = (service: ServiceItem) => {
    setActiveService(service);
    const result = trackWhopEvent("service_viewed", {
      service_slug: service.slug,
      service_title: service.title,
    });
    if (result.tracked) {
      onTrackingEventLogged(`whop.track("service_viewed", { service_slug: "${service.slug}" }) dispatched`);
    } else {
      onTrackingEventLogged(`service_viewed triggered for ${service.title} (${result.reason})`);
    }
  };

  return (
    <section id="services" className="py-20 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-semibold text-[#0284C7] mb-2">
            Core Roofing Capabilities
          </p>
          <h2
            className="font-display font-bold text-[#0B1F3A] tracking-tight mb-4"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", textWrap: "balance" }}
          >
            Engineered Roofing Services for Homes and Commercial Properties
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Whether stopping an active storm leak or replacing an aging roof assembly, every project follows documented inspection and installation standards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {siteConfig.services.map((service) => (
            <article
              key={service.id}
              className="group flex flex-col bg-[#F8FAFC] rounded-xl border border-slate-200 overflow-hidden transition-shadow duration-200 hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200">
                <ResilientImage
                  src={service.imageUrl}
                  alt={service.imageAlt}
                  fallbackTitle={service.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>

              <div className="flex-1 p-6 sm:p-7 flex flex-col">
                <p className="text-xs font-mono font-medium text-[#0284C7] mb-2">
                  {service.number} · {service.typicalTimeline}
                </p>
                <h3 className="font-display text-xl font-bold text-[#0B1F3A] mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  {service.shortDescription}
                </p>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {service.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleLearnMore(service)}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] bg-white hover:bg-[#0B1F3A] hover:text-white border border-slate-300 hover:border-[#0B1F3A] rounded-lg transition-colors duration-150 whitespace-nowrap"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {activeService && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs"
          onClick={() => setActiveService(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 relative">
              <ResilientImage
                src={activeService.imageUrl}
                alt={activeService.imageAlt}
                fallbackTitle={activeService.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveService(null)}
                aria-label="Close service details"
                className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-white/90 hover:bg-white text-[#0B1F3A] flex items-center justify-center shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-mono text-[#0284C7] font-semibold">{activeService.number}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {activeService.typicalTimeline}
                </span>
              </div>

              <h3 id="service-modal-title" className="font-display text-2xl font-bold text-[#0B1F3A] mb-3">
                {activeService.title}
              </h3>
              <p className="text-base text-slate-600 leading-relaxed mb-6">
                {activeService.fullDescription}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pt-5 border-t border-slate-200">
                <div>
                  <h4 className="font-display text-sm font-bold text-[#0B1F3A] mb-3">
                    Scope Included
                  </h4>
                  <ul className="space-y-2">
                    {activeService.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-[#0B1F3A] mb-3">
                    Standard Deliverables
                  </h4>
                  <ul className="space-y-2">
                    {activeService.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveService(null)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Close
                </button>
                <a
                  href="#estimate-form"
                  onClick={() => {
                    onSelectServiceForEstimate(activeService.title);
                    setActiveService(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors"
                >
                  <span>Request Estimate for {activeService.title}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
