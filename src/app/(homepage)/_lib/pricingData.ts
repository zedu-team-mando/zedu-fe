type BillingCycle = "monthly" | "yearly";
type CtaVariant = "outline" | "filled";
type PricingVariant = "starter" | "popular" | "enterprise";

type PricingFeature = {
  text: string;
  enabled: boolean;
};

export type PricingCardData = {
  key: string;
  title: string;
  description: string;
  amount: string;
  periodLabel?: string;
  footnote?: string;
  features: PricingFeature[];
  ctaText: string;
  ctaHref?: string;
  ctaVariant: CtaVariant;
  variant: PricingVariant;
  badgeText?: string;
};

const staticPricingCards: PricingCardData[] = [
  {
    key: "starter",
    title: "Starter",
    description: "Best for small classes and educators starting with Zedu.",
    amount: "₦0",
    periodLabel: "/month",
    footnote: "No credit card needed",
    features: [
      { text: "Up to 3 cohorts", enabled: true },
      { text: "Organized learning channels", enabled: true },
      { text: "Basic messaging and threads", enabled: true },
      { text: "File sharing", enabled: true },
      { text: "Basic notifications", enabled: true },
      { text: "Limited AI assistance", enabled: true },
    ],
    ctaText: "Get Started Free",
    ctaHref: "/auth/sign-up",
    ctaVariant: "outline",
    variant: "starter",
  },
  {
    key: "pro",
    title: "Pro",
    description: "Best for bootcamps and structured programs.",
    amount: "₦20K",
    periodLabel: "/month",
    footnote: "",
    features: [
      { text: "Everything in Starter, and", enabled: true },
      { text: "Unlimited cohorts", enabled: true },
      { text: "Live classes and collaboration tools", enabled: true },
      { text: "AI study assistants", enabled: true },
      { text: "Assignment and cohort management", enabled: true },
      { text: "Admin moderation tools", enabled: true },
    ],
    ctaText: "Start Pro Plan",
    ctaHref: "/client/settings/organisation/billing/all-plans",
    ctaVariant: "filled",
    variant: "popular",
    badgeText: "Most Popular",
  },
  {
    key: "enterprise",
    title: "Enterprise",
    description:
      "Flexible pricing for Universities, large programs, and institutions.",
    amount: "Let's Talk",
    features: [
      { text: "Everything in Pro, and", enabled: true },
      { text: "Advanced AI agents and automation", enabled: true },
      { text: "Institution-level workspace control", enabled: true },
      { text: "Security and compliance tools", enabled: true },
      { text: "Custom integrations", enabled: true },
      { text: "Dedicated onboarding", enabled: true },
      { text: "Priority support", enabled: true },
    ],
    ctaText: "Contact Sales",
    ctaHref: "/contact-sales",
    ctaVariant: "outline",
    variant: "enterprise",
  },
];

export const pricingCardsByCycle: Record<BillingCycle, PricingCardData[]> = {
  monthly: staticPricingCards,
  yearly: staticPricingCards,
};
