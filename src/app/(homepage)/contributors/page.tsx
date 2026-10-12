import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "~/lib/env-urls";

export const metadata: Metadata = {
  title: "Contributors",
  description: "Meet the teams who built Zedu during the HNG 15 internship.",
  alternates: {
    canonical: siteUrl("/contributors"),
  },
};

const teams = [
  { slug: "egrets", name: "Egret" },
  { slug: "heron", name: "Heron" },
  { slug: "ibis", name: "Ibis" },
  { slug: "lark", name: "Lark" },
  { slug: "macaw", name: "Macaw" },
  { slug: "sparrow", name: "Sparrow" },
  { slug: "zedu-condor", name: "Zedu Condor" },
  { slug: "zedu-drongo", name: "Zedu Drongo" },
  { slug: "zedu-flamingo", name: "Zedu Flamingo" },
  { slug: "zedu-gannet", name: "Zedu Gannet" },
  { slug: "zedu-jacana", name: "Zedu Jacana" },
  { slug: "zedu-kestrel", name: "Zedu Kestrel" },
  { slug: "zedu-osprey", name: "Zedu Osprey" },
  { slug: "zedu-quetzal", name: "Zedu Quetzal" },
  { slug: "zedu-toucan", name: "Zedu Toucan" },
  { slug: "zedu-weaver", name: "Zedu Weaver" },
];

const ContributorsPage = () => {
  return (
    <section className="mx-auto mt-10 flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center sm:gap-6 sm:px-8 sm:py-16">
      <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-4xl md:text-5xl">
        Zedu <span className="text-primary-500">Contributors</span>
      </h1>
      <p className="max-w-xl text-sm text-neutral-600 sm:text-base">
        The teams who set up, ran, and improved Zedu during HNG 15.
      </p>
      <ul className="mt-4 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <li key={team.slug}>
            <Link
              href={`/contributors/${team.slug}`}
              className="block rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-500"
            >
              {team.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ContributorsPage;
