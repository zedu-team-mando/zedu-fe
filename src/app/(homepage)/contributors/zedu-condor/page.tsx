import { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { contributors } from "./_lib/contributors";

export const metadata: Metadata = {
  title: "Contributors",
  description:
    "Meet the developers, designers, product managers and QA engineers behind Zedu, built by the Zedu-Condor team.",
  openGraph: {
    title: "Contributors - The Team Behind Zedu",
    description:
      "Zedu is built by a community of developers, designers, product managers, and testers. Meet the team.",
    url: siteUrl("/contributors/zedu-condor"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "The people behind Zedu",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: siteUrl("/contributors/zedu-condor"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const ContributorsPage = () => {
  return (
    <div className="space-y-16 pb-16">
      <section className="flex w-full flex-col items-center gap-4 px-4 pt-16 text-center sm:gap-6 sm:px-8 sm:pt-24 lg:px-12">
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-4xl md:text-5xl">
          The Team Behind <span className="text-primary-500">Zedu</span>
        </h1>
        <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[80%] sm:text-base md:max-w-[60%] lg:max-w-[45%] lg:text-lg">
          Zedu is built by a community of developers, designers, product
          managers, and testers.
        </p>
        <p className="text-sm font-medium text-neutral-900 sm:text-base">
          {contributors.length} Contributors and counting
        </p>
      </section>

      <section className="w-full px-4 sm:px-8 lg:px-12">
        <ul className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {contributors.map((member) => (
            <li
              key={member.name}
              className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-6 text-center"
            >
              <div
                aria-hidden="true"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-lg font-semibold text-white"
              >
                {getInitials(member.name)}
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-neutral-900">
                  {member.name}
                </h2>
                <p className="text-sm text-neutral-600">{member.handle}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-primary-500">
                  {member.role}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex w-full flex-col items-center gap-4 px-4 text-center sm:px-8 lg:px-12">
        <h2 className="text-xl font-semibold text-neutral-900 sm:text-3xl">
          Your Name Belongs on Our Team Page
        </h2>
        <p className="max-w-xl text-sm text-neutral-600 sm:text-base">
          Zedu is built by people like you. Join the platform and be part of
          what we build next.
        </p>
        <Link
          href="/auth/login"
          className="group flex items-center gap-3 rounded-full bg-primary-500 px-4 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-primary-400 sm:px-6 sm:py-3"
        >
          Get Started
          <ArrowRight
            aria-hidden="true"
            className="h-5 w-5 transition-transform duration-300 ease-out group-hover:translate-x-1"
          />
        </Link>
      </section>
    </div>
  );
};

export default ContributorsPage;
