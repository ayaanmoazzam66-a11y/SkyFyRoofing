declare global {
  interface Window {
    whop?: ((...args: unknown[]) => void) & {
      q?: unknown[];
      setScope?: (...companyIds: string[]) => void;
      track?: (eventName: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export type WhopTrackEventName =
  | "page"
  | "estimate_requested"
  | "service_viewed"
  | "deposit_started";

export interface WhopTrackResult {
  tracked: boolean;
  event: WhopTrackEventName;
  reason?: string;
}

let pixelInitializedForCompany: string | null = null;

/**
 * Loads the official Whop Pixel script (https://t.whop.tw/s.js),
 * sets the business scope (biz_...), and records the initial page view.
 * Does NOT fake tracking if WHOP_COMPANY_ID is unconfigured.
 */
export function initWhopPixel(companyId: string | null | undefined): boolean {
  if (typeof window === "undefined") return false;
  if (!companyId || !companyId.startsWith("biz_")) {
    return false;
  }
  if (pixelInitializedForCompany === companyId) {
    return true;
  }

  // Official Whop Pixel queue bootstrap
  if (!window.whop) {
    const w = window as unknown as Record<string, unknown>;
    const queueFn = function (...args: unknown[]) {
      const fn = w.whop as { q?: unknown[] };
      fn.q = fn.q || [];
      fn.q.push(args.concat([{ __scope: "whop" }]));
    } as NonNullable<Window["whop"]>;
    queueFn.setScope = (...ids: string[]) => {
      if (typeof window.whop === "function") {
        window.whop("setScope", ...ids);
      }
    };
    queueFn.track = (eventName: string, properties?: Record<string, unknown>) => {
      if (typeof window.whop === "function") {
        if (properties) {
          window.whop("track", eventName, properties);
        } else {
          window.whop("track", eventName);
        }
      }
    };
    window.whop = queueFn;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[data-whop-pixel="true"]',
  );
  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://t.whop.tw/s.js";
    script.dataset.whopPixel = "true";
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }

  if (typeof window.whop?.setScope === "function") {
    window.whop.setScope(companyId);
  }
  if (typeof window.whop?.track === "function") {
    window.whop.track("page");
  }

  pixelInitializedForCompany = companyId;
  return true;
}

/**
 * Dispatches custom Whop tracking events (estimate_requested, service_viewed, deposit_started).
 * Returns honest status indicating whether the Whop Pixel was scoped with a valid company ID.
 */
export function trackWhopEvent(
  eventName: WhopTrackEventName,
  properties?: Record<string, unknown>,
): WhopTrackResult {
  if (typeof window === "undefined") {
    return { tracked: false, event: eventName, reason: "Not running in browser context." };
  }
  if (!pixelInitializedForCompany || !window.whop?.track) {
    return {
      tracked: false,
      event: eventName,
      reason: "Whop Pixel requires WHOP_COMPANY_ID (biz_...) to send live tracking events.",
    };
  }

  window.whop.track(eventName, properties);
  return { tracked: true, event: eventName };
}
