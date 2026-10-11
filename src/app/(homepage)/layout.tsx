import type { Metadata } from "next";
import React from "react";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { Toaster } from "~/components/ui/toaster";
import { DataProvider } from "~/store/GlobalState";
import Footer from "./_components/footer";
import Header from "./_components/header";
import { ForceLightTheme } from "~/components/theme/force-light-theme";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_CLIENT_URL
    ? new URL(siteUrl())
    : undefined,
  title: {
    default: "Zedu - Learning Platform for Bootcamps, Schools, and Cohorts",
    template: "%s | Zedu",
  },
  description:
    "Zedu is an AI-powered education platform built for bootcamps and learning communities. Organize cohorts, run classes, manage communication, and scale modern learning in one workspace.",
  keywords: [
    "Zedu",
    "learning platform",
    "bootcamp platform",
    "cohort management",
    "education communication platform",
    "AI learning platform",
    "classroom communication",
    "learning workspace",
  ],
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "Zedu - Learning Platform for Bootcamps, Schools, and Cohorts",
    description:
      "Built for modern learning: structured channels, AI-powered support, flexible education pricing, and tools that help educators run better cohorts.",
    // "./" resolves to the current page's path, so a page that doesn't set
    // its own og:url or canonical points at itself, not at the homepage.
    url: "./",
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu learning platform for educators and cohorts",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu - Learning Platform for Bootcamps, Schools, and Cohorts",
    description:
      "Run modern learning programs with one AI-powered workspace for communication, collaboration, pricing flexibility, and cohort success.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ForceLightTheme>
      <DataProvider>
        <div className="zedu-marketing w-full">
          <Header />
          <div className="pt-12 min-w-screen overflow-x-hidden">{children}</div>
          <Footer />
        </div>

        <Toaster />
      </DataProvider>
    </ForceLightTheme>
  );
}
