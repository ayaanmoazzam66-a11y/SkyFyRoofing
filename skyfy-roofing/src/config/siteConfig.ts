export interface ServiceItem {
  id: string;
  number: string;
  slug: "roof-repair" | "roof-replacement" | "roof-inspection";
  title: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  imageAlt: string;
  highlights: string[];
  typicalTimeline: string;
  deliverables: string[];
}

export interface PaymentPlanConfig {
  key: "inspection" | "deposit" | "repair";
  title: string;
  priceDisplay: string;
  amountCents: number;
  billingLabel: string;
  summary: string;
  features: string[];
  envVarName: "WHOP_PLAN_INSPECTION_ID" | "WHOP_PLAN_DEPOSIT_ID" | "WHOP_PLAN_REPAIR_ID";
  isDeposit?: boolean;
}

export interface ServiceAreaLocation {
  city: string;
  state: string;
  regionLabel: string;
  dispatchNote: string;
}

export interface SampleReview {
  id: string;
  reviewerName: string;
  location: string;
  projectType: string;
  rating: number;
  quote: string;
  label: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface TrustPillar {
  title: string;
  description: string;
}

/**
 * Centralized, reusable configuration for SkyFy Roofing.
 * Swap company identity, service areas, payment plans, and copy here
 * to adapt this template for any US residential or commercial roofing business.
 */
export const siteConfig = {
  brand: {
    name: "SkyFy Roofing",
    legalEntity: "SkyFy Roofing LLC (Demonstration Template)",
    tagline: "Residential & Commercial Roofing Systems",
    regionDescriptor: "Serving Greater Houston & Surrounding Communities (Demo Locations)",
  },
  contact: {
    // Editable placeholder contact details — replace before live deployment
    phoneDisplay: "(713) 555-0194",
    phoneHref: "tel:+17135550194",
    email: "estimates@skyfyroofing-demo.example",
    address: "1200 Westheimer Rd, Suite 400, Houston, TX 77006",
    hours: "Mon–Sat · 7:00 AM – 6:30 PM CT",
    placeholderNotice:
      "Placeholder contact details shown for demonstration. Replace with verified company phone, email, and office address before launch.",
  },
  hero: {
    headline: "Protecting Your Home Starts at the Top.",
    subheading:
      "Reliable roofing solutions built to protect your property, enhance its value, and give you peace of mind.",
    primaryCta: "Request a Free Estimate",
    secondaryCta: "Explore Our Services",
    imageUrl: "/src/assets/images/hero_american_roof_1794660972326.jpg",
    imageAlt:
      "Upscale American residential home featuring a newly installed dark slate architectural shingle roof and crisp white trim.",
    trustIndicators: [
      "Professional Roofing Team",
      "Quality Materials",
      "Reliable Workmanship",
    ],
  },
  services: [
    {
      id: "roof-repair",
      number: "01",
      slug: "roof-repair",
      title: "Roof Repair",
      shortDescription:
        "Targeted diagnostics and durable structural repairs to stop active leaks, restore wind-lifted shingles, and prevent interior water damage.",
      fullDescription:
        "Our repair crews trace moisture paths to the source—flashing transitions, pipe boots, valleys, and wind-creased shingles—before executing code-compliant repairs matched to your existing roofing system.",
      imageUrl: "/src/assets/images/service_roof_repair_1794660972613.jpg",
      imageAlt:
        "SkyFy Roofing technician wearing a safety harness while replacing damaged architectural asphalt shingles on a pitched roof.",
      highlights: [
        "Leak detection and repair",
        "Storm and wind damage restoration",
        "Shingle replacement",
        "Emergency roof repairs",
      ],
      typicalTimeline: "Same-day emergency tarping · 1-day standard repair",
      deliverables: [
        "Moisture & flashing point check",
        "Color-matched architectural shingle or metal patch",
        "Before-and-after photo documentation",
      ],
    },
    {
      id: "roof-replacement",
      number: "02",
      slug: "roof-replacement",
      title: "Roof Replacement",
      shortDescription:
        "Full tear-off and engineered re-roofing systems using architectural asphalt shingles or standing-seam metal for homes and commercial buildings.",
      fullDescription:
        "When a roof reaches the end of its service life, SkyFy Roofing manages every phase from decking inspection and synthetic underlayment to ridge ventilation and magnetic jobsite cleanup.",
      imageUrl: "/src/assets/images/service_roof_replacement_1794660973435.jpg",
      imageAlt:
        "Newly completed residential roof replacement combining charcoal standing-seam metal accents with architectural shingles.",
      highlights: [
        "Complete roof replacement",
        "Asphalt shingle roofing",
        "Metal roofing",
        "Residential and commercial projects",
      ],
      typicalTimeline: "1–3 days for residential · Scheduled phasing for commercial",
      deliverables: [
        "Full tear-off & decking integrity verification",
        "Ice, water & synthetic moisture barrier",
        "Balanced ridge & soffit ventilation system",
      ],
    },
    {
      id: "roof-inspection",
      number: "03",
      slug: "roof-inspection",
      title: "Roof Inspection",
      shortDescription:
        "Comprehensive multi-point exterior and attic assessments with photographic documentation for homeowners, buyers, and property managers.",
      fullDescription:
        "Identify subtle hail bruising, lifted fasteners, or aging sealant lines before they turn into expensive structural repairs. Ideal for seasonal maintenance, real estate transactions, and commercial asset planning.",
      imageUrl: "/src/assets/images/service_roof_inspection_1794660974453.jpg",
      imageAlt:
        "Certified roofing inspectors examining ridge vents and shingle condition with a digital inspection tablet.",
      highlights: [
        "Detailed roof assessments",
        "Damage identification",
        "Preventive maintenance",
        "Professional inspection reports",
      ],
      typicalTimeline: "45–60 minute on-site evaluation · Same-day digital report",
      deliverables: [
        "High-resolution annotated roof & flashing report",
        "Remaining useful life & repair priority summary",
        "Written itemized estimate if remediation is needed",
      ],
    },
  ] satisfies ServiceItem[],
  whyChooseUs: {
    headline: "Built on Craftsmanship, Clear Scope, and Jobsite Discipline.",
    subheading:
      "High-ticket exterior work demands accountability before, during, and after installation. SkyFy Roofing structures every project around verifiable standards.",
    showcaseImageUrl: "/src/assets/images/commercial_project_showcase_1794660973756.jpg",
    showcaseImageAlt:
      "Aerial three-quarter view of residential and commercial buildings with newly installed dark navy-slate roofing systems.",
    pillars: [
      {
        title: "Experienced Roofing Professionals",
        description:
          "Trained installation and diagnostic crews experienced across pitched residential shingles, standing-seam metal, and low-slope commercial assemblies.",
      },
      {
        title: "Premium Roofing Materials",
        description:
          "Manufacturer-grade architectural shingles, corrosion-resistant flashing, and high-temp synthetic underlayments selected for heat and storm resilience.",
      },
      {
        title: "Transparent Pricing",
        description:
          "Written line-item proposals detailing tear-off, decking allowances, ventilation, and hardware with zero hidden post-contract surcharges.",
      },
      {
        title: "Customer-Focused Service",
        description:
          "Protected landscaping, daily magnetic nail sweeps, and respectful crew conduct designed around occupied homes and active commercial sites.",
      },
      {
        title: "Quality Workmanship",
        description:
          "Precision fastening patterns, clean valley metal work, and watertight penetration seals verified through a post-completion walkthrough.",
      },
      {
        title: "Reliable Project Communication",
        description:
          "Dedicated project scheduling updates from initial inspection and deposit confirmation through material delivery and final closeout.",
      },
    ] satisfies TrustPillar[],
  },
  process: [
    {
      step: "01",
      title: "Request an Estimate",
      description:
        "Submit your property address and roofing scope through our estimate form to open a project inquiry directly with our scheduling desk.",
    },
    {
      step: "02",
      title: "Schedule an Inspection",
      description:
        "A roofing specialist evaluates your roof surface, flashing, ventilation, and decking condition and documents findings on-site.",
    },
    {
      step: "03",
      title: "Receive Your Roofing Proposal",
      description:
        "Review clear material options, itemized pricing, timeline expectations, and flexible Whop checkout or deposit payment options.",
    },
    {
      step: "04",
      title: "Project Completion",
      description:
        "Our crew completes the repair or full installation, performs a final quality inspection, and closes out your remaining project invoice.",
    },
  ] satisfies ProcessStep[],
  financing: {
    headline: "Your New Roof, With Flexible Payment Options.",
    description:
      "Explore available financing options and find a payment solution that works for your budget.",
    cta: "Explore Payment Options",
    disclosure:
      "Available payment methods and installment or financing options are displayed dynamically inside Whop Checkout based on eligibility, order amount, and merchant configuration. Financing approval is not guaranteed.",
  },
  paymentPlans: [
    {
      key: "inspection",
      title: "Roof Inspection",
      priceDisplay: "$149",
      amountCents: 14900,
      billingLabel: "One-time inspection fee",
      summary:
        "Comprehensive 24-point roof, flashing, gutter, and attic moisture evaluation with a written photo report.",
      features: [
        "Full perimeter & ridge vent assessment",
        "Annotated photo documentation PDF",
        "Written repair or replacement scope",
      ],
      envVarName: "WHOP_PLAN_INSPECTION_ID",
    },
    {
      key: "deposit",
      title: "Roofing Project Deposit",
      priceDisplay: "$500",
      amountCents: 50000,
      billingLabel: "Customer's initial project deposit",
      summary:
        "Reserve your installation window and lock in material staging for residential or commercial roofing projects.",
      features: [
        "Secures crew & material delivery slot",
        "Credited in full toward final invoice",
        "Supports card-on-file & Whop checkout methods",
      ],
      envVarName: "WHOP_PLAN_DEPOSIT_ID",
      isDeposit: true,
    },
    {
      key: "repair",
      title: "Roofing Repair",
      priceDisplay: "$299",
      amountCents: 29900,
      billingLabel: "Flat-rate demonstration service",
      summary:
        "Standardized minor repair package covering localized shingle replacement, pipe boot resealing, or flashing stabilization.",
      features: [
        "Up to 1 bundle architectural shingle match",
        "Penetration & pipe-boot reseal included",
        "Post-repair photo confirmation",
      ],
      envVarName: "WHOP_PLAN_REPAIR_ID",
    },
  ] satisfies PaymentPlanConfig[],
  serviceAreas: {
    headline: "Service Areas",
    subheading:
      "Demonstration US coverage across Greater Houston. Edit these service areas in site configuration for your local market.",
    locations: [
      {
        city: "Houston",
        state: "Texas",
        regionLabel: "Central & Inner Loop",
        dispatchNote: "Residential & commercial dispatch hub · Same-day emergency tarping coverage",
      },
      {
        city: "Katy",
        state: "Texas",
        regionLabel: "West Corridor",
        dispatchNote: "Storm restoration, impact-resistant shingles, and HOA-compliant replacements",
      },
      {
        city: "Sugar Land",
        state: "Texas",
        regionLabel: "Southwest Metro",
        dispatchNote: "Full architectural re-roofing, standing-seam metal accents, and annual inspections",
      },
      {
        city: "Cypress",
        state: "Texas",
        regionLabel: "Northwest Corridor",
        dispatchNote: "Wind-damage diagnostics, ridge ventilation upgrades, and preventive maintenance",
      },
      {
        city: "The Woodlands",
        state: "Texas",
        regionLabel: "North Metro",
        dispatchNote: "Tree-canopy debris mitigation, valley flashing upgrades, and estate roofing",
      },
    ] satisfies ServiceAreaLocation[],
  },
  reviews: {
    headline: "Client Feedback & Project Impressions",
    subheading:
      "Sample demonstration testimonials shown to illustrate layout structure. Replace with verified homeowner and property-manager reviews once collected.",
    items: [
      {
        id: "sample-1",
        reviewerName: "Marcus H.",
        location: "Katy, TX",
        projectType: "Full Shingle Replacement",
        rating: 5,
        quote:
          "Sample testimonial: The crew arrived on schedule, protected our landscaping, and walked us through every flashing detail before final closeout.",
        label: "Sample Review",
      },
      {
        id: "sample-2",
        reviewerName: "Elena R.",
        location: "Sugar Land, TX",
        projectType: "Roof Inspection & Leak Repair",
        rating: 5,
        quote:
          "Sample testimonial: Their inspection report pinpointed a cracked pipe boot and valley gap with clear photos—no pushy upsell, just a clean repair.",
        label: "Sample Review",
      },
      {
        id: "sample-3",
        reviewerName: "David T.",
        location: "The Woodlands, TX",
        projectType: "Commercial Flat-to-Metal Transition",
        rating: 5,
        quote:
          "Sample testimonial: Transparent deposit billing, clear daily communication, and an itemized final invoice that matched the initial proposal.",
        label: "Sample Review",
      },
    ] satisfies SampleReview[],
  },
  socialLinks: [
    { label: "LinkedIn", href: "#footer" },
    { label: "Facebook", href: "#footer" },
    { label: "Instagram", href: "#footer" },
  ],
};
