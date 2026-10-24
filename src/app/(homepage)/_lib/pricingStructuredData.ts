import { siteUrl } from "~/lib/env-urls";

const SCHEMA_CONTEXT = ["https:", "schema.org"].join("//");

/**
 * Structured data for the public Zedu pricing page.
 * Only includes prices explicitly advertised on the page.
 */
export function getPricingStructuredData() {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "SoftwareApplication",
    "@id": siteUrl("/pricing#software"),
    name: "Zedu",
    url: siteUrl("/"),
    description:
      "Zedu is an AI-powered education platform for schools, bootcamps, and cohort-based learning teams.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    publisher: {
      "@id": siteUrl("/#organization"),
    },
    offers: {
      "@type": "OfferCatalog",
      name: "Zedu Pricing Plans",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Starter",
          description:
            "Best for small classes and educators starting with Zedu.",
          price: "0",
          priceCurrency: "NGN",
          url: siteUrl("/pricing"),
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "0",
            priceCurrency: "NGN",
            unitText: "MONTH",
          },
        },
        {
          "@type": "Offer",
          name: "Pro",
          description: "Best for bootcamps and structured programs.",
          price: "20000",
          priceCurrency: "NGN",
          url: siteUrl("/pricing"),
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "20000",
            priceCurrency: "NGN",
            unitText: "MONTH",
          },
        },
      ],
    },
  };
}
