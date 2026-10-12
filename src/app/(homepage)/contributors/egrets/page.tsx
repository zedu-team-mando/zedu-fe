import type { Metadata } from "next";

import { Github } from "lucide-react";
import { siteUrl } from "~/lib/env-urls";
import { contributorCount, contributors } from "./_lib/contributors";

export const metadata: Metadata = {
  title: "Zedu Egret Contributors",
  description:
    "Meet the contributors who have actively participated and contributed to Zedu chat during the HNG 15 internship in Team Egret.",
  alternates: {
    canonical: siteUrl("/contributors/egrets"),
  },
};

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ? parts[0].charAt(0) : "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase() || "?";
};

const EgretContributorsPage = () => {
  const githubCount = contributors.filter(
    (entry) => entry.githubUsername !== ""
  ).length;
  const stats = [
    { amount: String(contributorCount), text: "Contributors" },
    { amount: String(githubCount), text: "GitHub profiles" },
    { amount: "HNG 15", text: "Internship" },
  ];

  return (
    <section className="relative isolate flex w-full flex-col items-center gap-4 overflow-hidden px-4 py-10 text-center sm:gap-6 sm:px-8 sm:py-16 lg:gap-8 lg:px-12">
      <h1 className="text-center text-2xl font-semibold leading-tight text-neutral-900 sm:text-4xl md:text-5xl">
        Zedu <span className="text-primary-500">Egret</span> Contributors
      </h1>
      <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[65%] lg:max-w-[45%] lg:text-lg">
        Meet the contributors who have actively participated and contributed to
        Zedu chat during HNG 15 internship in Team Egret.
      </p>

      {/* Stats - mirrors the homepage HeroSection metrics grid */}
      <div className="grid w-full max-w-4xl grid-cols-3 place-items-center gap-1.5 sm:gap-6 md:gap-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex w-full max-w-[260px] flex-col items-center justify-center gap-1 px-1.5 py-1 sm:px-4 sm:py-3"
          >
            <p className="text-lg font-semibold text-neutral-900 sm:text-3xl">
              {stat.amount}
            </p>
            <p className="text-[10px] leading-tight text-neutral-500 sm:text-sm">
              {stat.text}
            </p>
          </div>
        ))}
      </div>

      {contributorCount === 0 ? (
        <div className="mt-4 w-full max-w-4xl rounded-2xl bg-primary-50 px-6 py-10 text-center">
          <p className="text-sm text-neutral-600">
            No contributors yet. Complete Stage 1 to be the first on this list.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid w-full max-w-7xl grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {contributors.map((entry, i) => {
            const base =
              "group flex h-full w-full flex-col gap-3 rounded-2xl bg-white px-5 py-5 drop-shadow-md transition duration-200 hover:-translate-y-0.5";
            return (
              <div key={i} className={base}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-500">
                  {initialsOf(entry.name)}
                </span>
                <span className="block truncate text-base font-semibold text-neutral-900">
                  {entry.name}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                  <Github aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {entry.githubUsername
                      ? `@${entry.githubUsername}`
                      : "Team Egret contributor"}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA - ArrowBtn from ui/Button.tsx, inlined (no component import) */}
      <a
        href="/"
        className="group mt-6 inline-flex items-center gap-3 rounded-full bg-primary-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-primary-400"
      >
        Explore Zedu
        <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>
    </section>
  );
};

export default EgretContributorsPage;
