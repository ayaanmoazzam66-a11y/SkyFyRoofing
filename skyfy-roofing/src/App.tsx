import { useEffect, useMemo, useState } from "react";
import { loadWhop } from "@whop/elements";
import { WhopElements } from "@whop/elements-react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { ServicesSection } from "./components/ServicesSection";
import { WhyChooseSection } from "./components/WhyChooseSection";
import { ProcessAndFinancingSection } from "./components/ProcessAndFinancingSection";
import { WhopPaymentsSection } from "./components/WhopPaymentsSection";
import { DepositInvoiceWorkflowSection } from "./components/DepositInvoiceWorkflowSection";
import { ServiceAreasAndReviewsSection } from "./components/ServiceAreasAndReviewsSection";
import { EstimateFormSection } from "./components/EstimateFormSection";
import { Footer } from "./components/Footer";
import { initWhopPixel } from "./lib/whopTracking";
import type { PublicWhopConfig } from "./types/whop";

export default function App() {
  const [whopConfig, setWhopConfig] = useState<PublicWhopConfig | null>(null);
  const [preselectedService, setPreselectedService] = useState("");
  const [preselectedCity, setPreselectedCity] = useState("");
  const [depositPaymentId, setDepositPaymentId] = useState<string | null>(null);

  const whopLoader = useMemo(() => loadWhop(), []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PublicWhopConfig | null) => {
        if (!mounted || !data) return;
        setWhopConfig(data);
        if (data.companyId) {
          initWhopPixel(data.companyId);
        }
      })
      .catch(() => {
        // Configuration endpoint failed; UI surfaces explicit unconfigured states cleanly
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleTrackingEventLogged = (message: string) => {
    if (import.meta.env.DEV) {
      console.info("[Whop Tracking]", message);
    }
  };

  return (
    <WhopElements
      elements={whopLoader}
      environment={whopConfig?.environment || "production"}
      appearance={{
        theme: {
          appearance: "light",
          accentColor: "sky",
          grayColor: "slate",
        },
      }}
      onLoadError={(err) => {
        console.warn("Whop Elements script load notice:", err.message);
      }}
    >
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <ServicesSection
            onSelectServiceForEstimate={(serviceTitle) => {
              setPreselectedService(serviceTitle);
            }}
            onTrackingEventLogged={handleTrackingEventLogged}
          />
          <WhyChooseSection />
          <ProcessAndFinancingSection />
          <WhopPaymentsSection
            whopConfig={whopConfig}
            onDepositCompleted={(paymentId) => setDepositPaymentId(paymentId)}
            onTrackingEventLogged={handleTrackingEventLogged}
          />
          <DepositInvoiceWorkflowSection
            whopConfig={whopConfig}
            depositPaymentId={depositPaymentId}
            onDepositCompleted={(paymentId) => setDepositPaymentId(paymentId)}
            onTrackingEventLogged={handleTrackingEventLogged}
          />
          <ServiceAreasAndReviewsSection
            onSelectCityForEstimate={(cityState) => setPreselectedCity(cityState)}
          />
          <EstimateFormSection
            whopConfig={whopConfig}
            preselectedService={preselectedService}
            preselectedCity={preselectedCity}
            onTrackingEventLogged={handleTrackingEventLogged}
          />
        </main>
        <Footer />
      </div>
    </WhopElements>
  );
}
