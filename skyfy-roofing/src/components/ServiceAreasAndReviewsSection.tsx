import { useState } from "react";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

interface ServiceAreasAndReviewsSectionProps {
  onSelectCityForEstimate: (cityState: string) => void;
}

export function ServiceAreasAndReviewsSection({
  onSelectCityForEstimate,
}: ServiceAreasAndReviewsSectionProps) {
  const { serviceAreas, reviews } = siteConfig;
  const [selectedCity, setSelectedCity] = useState(serviceAreas.locations[0].city);

  const activeLocation =
    serviceAreas.locations.find((loc) => loc.city === selectedCity) ||
    serviceAreas.locations[0];

  return (
    <>
      {/* Service Areas */}
      <section id="service-areas" className="py-20 lg:py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold text-[#0284C7] mb-2">
                Service Areas · Demonstration Locations
              </p>
              <h2
                className="font-display font-bold text-[#0B1F3A] tracking-tight mb-4"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)", textWrap: "balance" }}
              >
                {serviceAreas.headline}
              </h2>
              <p className="text-base text-slate-600 leading-relaxed mb-6">
                {serviceAreas.subheading}
              </p>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-[#0284C7] mb-2">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span>{activeLocation.regionLabel} · Demo Territory</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#0B1F3A] mb-2">
                  {activeLocation.city}, {activeLocation.state}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  {activeLocation.dispatchNote}
                </p>
                <a
                  href="#estimate-form"
                  onClick={() =>
                    onSelectCityForEstimate(`${activeLocation.city}, ${activeLocation.state}`)
                  }
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#0284C7] hover:text-[#0369A1]"
                >
                  <span>Request Free Estimate in {activeLocation.city}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {serviceAreas.locations.map((loc) => {
                const isSelected = loc.city === selectedCity;
                return (
                  <button
                    key={loc.city}
                    type="button"
                    onClick={() => setSelectedCity(loc.city)}
                    className={`text-left p-5 rounded-xl border transition-colors duration-150 ${
                      isSelected
                        ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                        : "bg-white text-[#0B1F3A] border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium mb-1 ${
                        isSelected ? "text-[#7DD3FC]" : "text-slate-500"
                      }`}
                    >
                      {loc.regionLabel}
                    </p>
                    <p className="font-display text-lg font-bold">
                      {loc.city}, {loc.state}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews & Testimonials (Clearly Identified Sample/Demo Content) */}
      <section id="reviews" className="py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold text-[#0284C7] mb-2">
              Sample Demonstration Reviews
            </p>
            <h2
              className="font-display font-bold text-[#0B1F3A] tracking-tight mb-3"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)", textWrap: "balance" }}
            >
              {reviews.headline}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              {reviews.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reviews.items.map((review) => (
              <article
                key={review.id}
                className="bg-[#F8FAFC] rounded-xl border border-slate-200 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: review.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {review.label}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed mb-6">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="font-display text-sm font-bold text-[#0B1F3A]">
                    {review.reviewerName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {review.location} · {review.projectType}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
