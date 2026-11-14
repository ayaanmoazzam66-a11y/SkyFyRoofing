export interface PublicWhopConfig {
  environment: "production" | "sandbox";
  companyId: string | null;
  productId: string | null;
  plans: {
    inspection: string | null;
    deposit: string | null;
    repair: string | null;
    finalInvoice: string | null;
  };
  capabilities: {
    trackingPixel: boolean;
    leadsApi: boolean;
    checkoutElements: boolean;
    setupIntents: boolean;
    invoicesApi: boolean;
  };
  missingEnvVars: {
    leads: string[];
    checkout: string[];
    workflow: string[];
  };
}

export interface WhopSetupIntentSummary {
  id: string;
  status: string;
  client_secret?: string | null;
  payment_method_id?: string | null;
  checkout_session_id?: string | null;
}

export interface WhopInvoiceSummary {
  id: string;
  number?: string;
  status: string;
  checkout_link?: string | null;
  payment_method_id?: string | null;
  total?: {
    amount?: number;
    currency?: string;
  };
  due_at?: string | null;
  paid_at?: string | null;
}
