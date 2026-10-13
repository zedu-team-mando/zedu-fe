import { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { DynamicFooter } from "../_components/footer/dynamic-footer";
import { FAQSection } from "../_components/home/FAQSection";
import { PricingSection } from "../_components/home/PricingSection";
import { PricingComparisonTable } from "../_components/pricing/PricingComparisonTable";
import { Table, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import {
  pricingComparisonDemoSections,
  pricingComparisonPlans,
} from "../_lib/pricingComparisonData";
import { CircleHelp } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Explore Zedu pricing plans for schools, bootcamps, and cohort-based learning teams. Compare features, choose the right plan, and scale structured learning with AI-powered collaboration.",
  keywords: [
    "Zedu pricing",
    "education platform pricing",
    "bootcamp pricing",
    "cohort management pricing",
    "AI learning platform plans",
    "school collaboration software",
    "learning management pricing",
    "classroom communication plans",
  ],
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "Zedu Pricing - Flexible Plans for Modern Learning Teams",
    description:
      "Compare Zedu plans and features to run structured cohorts, manage learning communication, and scale AI-powered education workflows.",
    url: siteUrl("/pricing"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu pricing plans and feature comparison",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu Pricing - Flexible Plans for Modern Learning Teams",
    description:
      "Choose a Zedu plan that fits your school, bootcamp, or cohort and unlock AI-powered communication and learning workflows.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/pricing"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

const PricingPage = () => {
  return (
    <div className="space-y-10">
      <PricingSection showSubtitle />

      <div
        id="compare-plans"
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 sm:px-8 lg:px-12 space-y-6 relative"
      >
        <div className="no-scrollbar">
          <Table className="min-w-[680px] table-fixed sm:min-w-[760px] no-scrollbar">
            <colgroup>
              <col className="w-[40%]" />
              {pricingComparisonPlans.map((plan) => (
                <col
                  key={plan.key}
                  style={{ width: `${60 / pricingComparisonPlans.length}%` }}
                />
              ))}
            </colgroup>

            <TableHeader>
              <TableRow className="border-b border-neutral-200 hover:bg-transparent no-scrollbar">
                <TableHead className="border-r border-neutral-200 px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                  Plan Features
                </TableHead>
                {pricingComparisonPlans.map((plan) => (
                  <TableHead
                    key={plan.key}
                    className="border-r border-neutral-200 px-4 py-3 text-center text-sm font-semibold text-neutral-900 last:border-r-0"
                  >
                    {plan.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {pricingComparisonDemoSections.map((section) => (
          <PricingComparisonTable
            key={section.key}
            plans={pricingComparisonPlans}
            section={section}
            rowInfoIcon={
              <CircleHelp className="h-3.5 w-3.5 text-neutral-400" />
            }
            className="mb-8 last:mb-0"
          />
        ))}
      </div>
      <FAQSection />
      <DynamicFooter
        text="Start Building Structured Learning Today"
        description="Create organized channels, manage cohorts, and bring AI into your learning environment.
"
      />
    </div>
  );
};

export default PricingPage;
