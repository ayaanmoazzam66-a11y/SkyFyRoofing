import { useState } from "react";
import {
  Checkout,
  CheckoutElement,
  ExpressCheckoutElement,
  useCheckout,
} from "@whop/elements-react";
import { AlertCircle, Check, CheckCircle2, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { siteConfig, type PaymentPlanConfig } from "../config/siteConfig";
import { trackWhopEvent } from "../lib/whopTracking";
import type { PublicWhopConfig } from "../types/whop";

interface WhopPaymentsSectionProps {
  whopConfig: PublicWhopConfig | null;
  onDepositCompleted: (paymentId: string, sessionId: string) => void;
  onTrackingEventLogged: (message: string) => void;
}

function CheckoutMountObserver() {
  useCheckout();
  return null;
}

export function WhopPaymentsSection({
  whopConfig,
  onDepositCompleted,
  onTrackingEventLogged,
}: WhopPaymentsSectionProps) {
  const [selectedKey, setSelectedKey] = useState<PaymentPlanConfig["key"]>("deposit");
  const [checkoutSurface, setCheckoutSurface] = useState<"full" | "express">("full");
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [lastCompletion, setLastCompletion] = useState<{
    planTitle: string;
    result: string;
    id: string;
  } | null>(null);

  const selectedPlan =
    siteConfig.paymentPlans.find((p) => p.key === selectedKey) || siteConfig.paymentPlans[1];

  const resolvedPlanId = whopConfig?.plans[selectedPlan.key] || null;
  const hasValidPlanId = Boolean(resolvedPlanId && resolvedPlanId.startsWith("plan_"));

  const handleSelectPlan = (plan: PaymentPlanConfig) => {
    setSelectedKey(plan.key);
    setCheckoutActive(false);
    setLastCompletion(null);
  };

  const handleBeginCheckout = () => {
    setCheckoutActive(true);
    if (selectedPlan.isDeposit) {
      const res = trackWhopEvent("deposit_started", {
        plan_key: selectedPlan.key,
        plan_id: resolvedPlanId || "unconfigured",
        amount_usd: 500,
      });
      if (res.tracked) {
        onTrackingEventLogged(`whop.track("deposit_started", { amount_usd: 500 }) dispatched`);
      } else {
        onTrackingEventLogged(`deposit_started triggered (${res.reason})`);
      }
    }
  };

  return (
    <section id="payments" className="py-20 lg:py-24 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold text-[#0284C7] mb-2">
            Whop Payments &amp; Checkout
          </p>
          <h2
            className="font-display font-bold text-[#0B1F3A] tracking-tight mb-4"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", textWrap: "balance" }}
          >
            Transparent Upfront Pricing &amp; Official Whop Checkout
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Book an inspection, reserve your installation window with a project deposit, or pay for a standardized repair using Whop Payment Elements—supporting cards, wallets, and eligible financing options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Three Real Payment Plan Cards */}
          <div className="lg:col-span-6 space-y-4">
            {siteConfig.paymentPlans.map((plan) => {
              const planId = whopConfig?.plans[plan.key] || null;
              const isSelected = selectedKey === plan.key;

              return (
                <div
                  key={plan.key}
                  className={`rounded-xl border transition-colors duration-150 p-6 bg-white ${
                    isSelected
                      ? "border-[#0284C7] ring-2 ring-[#0284C7]/15"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        {plan.billingLabel}
                      </p>
                      <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
                        {plan.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-2xl font-bold text-[#0B1F3A] tabular-nums">
                        {plan.priceDisplay}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {plan.summary}
                  </p>

                  <ul className="space-y-1.5 mb-5">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-[#0284C7] shrink-0" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <span className="text-xs font-mono text-slate-500 truncate max-w-[240px]">
                      {planId ? `Plan: ${planId}` : `Requires ${plan.envVarName}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectPlan(plan);
                        setCheckoutActive(true);
                        if (plan.isDeposit) {
                          const res = trackWhopEvent("deposit_started", {
                            plan_key: plan.key,
                            plan_id: planId || "unconfigured",
                            amount_usd: 500,
                          });
                          onTrackingEventLogged(
                            res.tracked
                              ? `whop.track("deposit_started", { amount_usd: 500 }) dispatched`
                              : `deposit_started triggered (${res.reason})`,
                          );
                        }
                      }}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        isSelected && checkoutActive
                          ? "bg-[#0B1F3A] text-white"
                          : "bg-[#0284C7] hover:bg-[#0369A1] text-white"
                      }`}
                    >
                      {isSelected && checkoutActive
                        ? "Selected in Checkout"
                        : `Select ${plan.priceDisplay} Plan`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Live Whop CheckoutElement / ExpressCheckoutElement Panel */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-[#0284C7] mb-1">
                  Whop Hosted Checkout Surface
                </p>
                <h3 className="font-display text-xl font-bold text-[#0B1F3A]">
                  {selectedPlan.title} · {selectedPlan.priceDisplay}
                </h3>
              </div>

              {/* Interactive Checkout Element Switcher */}
              <div
                role="group"
                aria-label="Checkout element mode"
                className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => setCheckoutSurface("full")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    checkoutSurface === "full"
                      ? "bg-white text-[#0B1F3A] shadow-xs"
                      : "text-slate-600 hover:text-[#0B1F3A]"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Full Checkout</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutSurface("express")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    checkoutSurface === "express"
                      ? "bg-white text-[#0B1F3A] shadow-xs"
                      : "text-slate-600 hover:text-[#0B1F3A]"
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Express Wallets</span>
                </button>
              </div>
            </div>

            {!checkoutActive ? (
              <div className="py-8 text-center">
                <ShieldCheck className="w-10 h-10 text-[#0284C7] mx-auto mb-3" aria-hidden="true" />
                <h4 className="font-display text-lg font-bold text-[#0B1F3A] mb-2">
                  Ready to Launch Whop Checkout
                </h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Click below to mount the official Whop{" "}
                  <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                    {checkoutSurface === "full" ? "CheckoutElement" : "ExpressCheckoutElement"}
                  </code>{" "}
                  for <strong>{selectedPlan.title}</strong> ({selectedPlan.priceDisplay}).
                </p>
                <button
                  type="button"
                  onClick={handleBeginCheckout}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors"
                >
                  Open {selectedPlan.priceDisplay} Whop Checkout
                </button>
              </div>
            ) : hasValidPlanId && resolvedPlanId ? (
              <div>
                <p className="text-xs text-slate-500 mb-4">
                  Environment: <span className="font-mono font-medium">{whopConfig?.environment}</span> · Plan ID:{" "}
                  <span className="font-mono font-medium">{resolvedPlanId}</span>
                </p>

                <Checkout
                  key={`${resolvedPlanId}-${checkoutSurface}`}
                  plan={resolvedPlanId}
                  returnUrl={typeof window !== "undefined" ? window.location.href : undefined}
                  onComplete={(payload) => {
                    const completionId =
                      payload.result === "payment"
                        ? payload.paymentId
                        : payload.result === "setup"
                          ? payload.setupIntentId
                          : payload.entryId;
                    setLastCompletion({
                      planTitle: selectedPlan.title,
                      result: payload.result,
                      id: completionId,
                    });
                    if (selectedPlan.isDeposit && payload.result === "payment") {
                      onDepositCompleted(payload.paymentId, payload.sessionId);
                    }
                  }}
                >
                  <CheckoutMountObserver />
                  {checkoutSurface === "full" ? (
                    <CheckoutElement />
                  ) : (
                    <div className="space-y-4">
                      <ExpressCheckoutElement layout="auto" />
                      <p className="text-xs text-slate-500 leading-relaxed">
                        ExpressCheckoutElement renders Apple Pay, Google Pay, and PayPal buttons when supported by your device, domain verification, and Whop merchant configuration.
                      </p>
                    </div>
                  )}
                </Checkout>

                {lastCompletion && (
                  <div className="mt-5 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-sm text-emerald-950">
                      <p className="font-semibold">
                        Whop Checkout Completed ({lastCompletion.planTitle})
                      </p>
                      <p className="font-mono text-xs mt-1">
                        Result: {lastCompletion.result} · Reference ID: {lastCompletion.id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-amber-950">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h4 className="font-display text-sm font-bold mb-1.5">
                      Whop Merchant Plan Configuration Required
                    </h4>
                    <p className="text-sm leading-relaxed mb-3">
                      To protect payment integrity, live Whop checkout will not simulate or fake a transaction. Configure the Whop plan ID for{" "}
                      <strong>{selectedPlan.title} ({selectedPlan.priceDisplay})</strong> in your server environment:
                    </p>
                    <div className="bg-white/80 border border-amber-200 rounded-lg p-3 font-mono text-xs space-y-1">
                      <div>{selectedPlan.envVarName}=plan_xxxxxxxxxxxxx</div>
                      {!whopConfig?.companyId && <div>WHOP_COMPANY_ID=biz_xxxxxxxxxxxxx</div>}
                    </div>
                    <p className="text-xs text-amber-800 mt-3 leading-relaxed">
                      Once set, this container mounts Whop&apos;s official{" "}
                      <code className="font-mono">
                        {checkoutSurface === "full" ? "<CheckoutElement />" : "<ExpressCheckoutElement />"}
                      </code>{" "}
                      with Whop-supported payment methods and eligible financing options.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
