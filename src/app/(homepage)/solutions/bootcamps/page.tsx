import type { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import Image from "next/image";
import { Star } from "lucide-react";
import { ArrowBtn, OutlineBtn } from "~/app/(homepage)/_components/ui/Button";
import { WhyCard } from "~/app/(homepage)/_components/ui/WhyCard";
import { FeaturedCard } from "~/app/(homepage)/_components/ui/FeaturedCard";
import { ComparisonShowcase } from "~/app/(homepage)/_components/ui/ComparisonShowcase";
import { DynamicFooter } from "../../_components/footer/dynamic-footer";

export const metadata: Metadata = {
  title: "Bootcamps Solutions",
  description:
    "Streamline bootcamp management with Zedu. Give instructors, mentors, and students one cohort management platform for structured learning, collaboration, and community building.",
  keywords: [
    "bootcamp platform",
    "cohort management software",
    "bootcamp communication platform",
    "learning community platform",
    "mentorship software",
    "bootcamp collaboration tool",
    "hands-on learning platform",
    "Zedu bootcamps",
  ],
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "Zedu for Bootcamps - Structured Cohort Management",
    description:
      "Manage cohorts, support hands-on learning, and build strong bootcamp communities with organized channels and real-time collaboration.",
    url: siteUrl("/solutions/bootcamps"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu bootcamps solution page preview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu for Bootcamps - Cohort Management Platform",
    description:
      "Build and manage bootcamp cohorts where mentors, instructors, and students collaborate easily with organized channels and real-time feedback.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/solutions/bootcamps"),
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "education",
  applicationName: "Zedu",
  creator: "Zedu",
  publisher: "Zedu",
};

const higherEducationCards = [
  {
    title: "Cohort-Based Learning",
    desc: "Organize every cohort with dedicated channels for lessons, projects, and discussions.",
  },
  {
    title: "Real-Time Collaboration",
    desc: "Students, mentors, and instructors communicate instantly during the learning process.",
  },
  {
    title: "Structured Community",
    desc: "Build an active learning community where students collaborate and support each other.",
  },
];

const structuredCommunicationCards = [
  {
    title: "Manage Cohorts with Structure",
    desc: "Organize each cohort with dedicated channels, allowing teams to stay aligned on schedules, resources, and progress.",
    image:
      "/images/homepage/solutions/bootcamps/manage-cohorts-with-structure.png",
  },
  {
    title: "Collaboration and Project Learning",
    desc: "Enable hands-on learning through collaborative spaces where students work on real projects and get instant feedback.",
    image:
      "/images/homepage/solutions/bootcamps/collaboration-and-project-learning.png",
  },
];

const comparisonData = {
  withoutTitle: "Without Zedu",
  withoutItems: [
    "Bootcamps use multiple tools for communication and collaboration",
    "Important updates and resources are often lost in crowded channels or long messages and chats",
    "Students often don't know where to ask questions about lectures, and finding resources becomes difficult",
    "Mentors struggle to keep track of student progress and manage group programs across different platforms",
    "Feedback on assignments and discussions happen in scattered places, making it hard to follow progress.",
  ],
  withTitle: "With Zedu",
  withItems: [
    "Bootcamp communities, mentorship, and projects live in one organized platform",
    "Each cohort has focused channels for lessons, resources, and updates",
    "Students receive real-time help through organized discussion channels",
    "Mentors and instructors can track progress and collaboration in one central workspace",
    "All feedback and collaboration happen in structured threads that are easy to follow.",
  ],
};

const featureMetrics = [
  {
    title: "50%",
    description: "Faster mentor responses",
  },
  {
    title: "2x",
    description: "Higher student engagement",
  },
  {
    title: "40%",
    description: "Less admin overhead",
  },
];

const BootCampsSolutionsPage = () => {
  return (
    <>
      <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[30%] w-screen -translate-x-1/2 bg-gradient-to-t from-blue-50/30 to-white"
        />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 rounded-[28px] px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14 lg:px-12 lg:py-14 min-h-[85dvh]">
          <div className="flex flex-col items-center gap-5 text-center lg:max-w-[470px] lg:items-start lg:text-left">
            <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
              <span className="text-primary-500">Run faster cohorts </span>{" "}
              Build Stronger Communities
            </h1>
            <p className="max-w-[46ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
              An all-in-one platform for bootcamps to manage cohorts, run live
              classes, support students, and build active learning communities.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[#5a6170] lg:justify-start">
              <div className="flex items-center gap-0.5" aria-hidden="true">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <Star key={index} color="gold" fill="gold" size={14} />
                  ))}
              </div>
              <span className="font-semibold text-[#1f2530]">4.9</span>
              <span className="text-[#8a90a0]">|</span>
              <span>Users love us</span>
            </div>{" "}
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowBtn text="Book a Demo" href="/contact-sales" />
              <OutlineBtn text="Start for Free" href="/auth/sign-up" />
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-3xl">
            <div className="relative aspect-[16/11] w-full sm:aspect-[4/3] lg:aspect-[16/10]">
              <Image
                src="/images/homepage/solutions/bootcamps-hero.png"
                alt="Students seated together while collaborating in the Zedu school workspace"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 680px"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="relative isolate overflow-hidden space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16 mt-5">
        <div>
          <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] text-center lg:leading-[1.12]">
            Why Bootcamps Choose Zedu
          </h1>
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {higherEducationCards.map((card) => (
            <WhyCard
              key={card.title}
              title={card.title}
              desc={card.desc}
              showBadge
              showArrow
              className="h-full"
            />
          ))}
        </div>
      </section>
      <section className="relative isolate overflow-hidden space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] text-center lg:leading-[1.12]">
            Run Structured and Collaborative Bootcamps
          </h1>
          <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[65%] lg:max-w-[45%] lg:text-lg">
            Manage cohorts efficiently and support hands-on learning through
            collaboration and real projects
          </p>
          <div>
            <ArrowBtn text="Get Started" linkToHome />
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 sm:gap-6 sm:grid-cols-2 ">
          {structuredCommunicationCards.map((card) => (
            <FeaturedCard
              key={card.title}
              title={card.title}
              desc={card.desc}
              image={card.image}
            />
          ))}
        </div>
      </section>
      <section className="relative isolate overflow-hidden space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
            How Zedu Transforms Bootcamps
          </h1>
        </div>

        <ComparisonShowcase
          withoutTitle={comparisonData.withoutTitle}
          withoutItems={comparisonData.withoutItems}
          withTitle={comparisonData.withTitle}
          withItems={comparisonData.withItems}
          ctaText="Book a Demo"
          ctaHref="/contact-sales"
        />
      </section>

      <section className="relative isolate overflow-hidden space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
            Run Leaner. Move Faster. Launch Better Cohorts.
          </h1>
          <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[65%] lg:max-w-[45%] lg:text-lg">
            Bootcamps move quickly. Zedu simplifies communication,
            collaboration, and cohort management so instructors can focus on
            teaching.
          </p>
        </div>

        <div className="w-full mx-auto">
          <div className="grid grid-cols-3 sm:items-center">
            {featureMetrics.map((metric, index) => (
              <div
                key={metric.title}
                className={`flex flex-col items-center justify-center gap-1 px-1.5 py-2 text-center sm:flex-col sm:gap-2 sm:px-4 sm:py-3 ${
                  index > 0 ? "border-neutral-300 border-l" : ""
                }`}
              >
                <h2 className="text-2xl font-bold text-neutral-900 sm:text-5xl">
                  {metric.title}
                </h2>
                <p className="text-[12px] leading-tight text-neutral-600 sm:text-sm">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="flex flex-col items-center text-center gap-8 max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12] mb-4">
              Build a Thriving Learning Community
            </h2>
            <p className="text-sm leading-relaxed text-[#5a6170] sm:text-base">
              The best bootcamps succeed because of strong communities. Zedu
              helps students collaborate, support each other, and stay motivated
              throughout the program.
            </p>
          </div>
        </div>

        <div className="relative w-full overflow-hidden rounded-3xl">
          <div className="relative aspect-[16/9] h-[400px] w-full">
            <Image
              src="/images/homepage/solutions/bootcamp-example.png"
              alt="Students collaborating together while working on group projects"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      <DynamicFooter
        text="Power Your Next Bootcamp Cohort"
        description="Give mentors, instructors, and students one organized platform for cohort management and collaboration."
      />
    </>
  );
};

export default BootCampsSolutionsPage;
