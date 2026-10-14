import type { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import Image from "next/image";
import { Star, Settings, Shield, Lock } from "lucide-react";
import { ArrowBtn, OutlineBtn } from "~/app/(homepage)/_components/ui/Button";
import { WhyCard } from "~/app/(homepage)/_components/ui/WhyCard";
import { FeaturedCard } from "~/app/(homepage)/_components/ui/FeaturedCard";
import { ComparisonShowcase } from "~/app/(homepage)/_components/ui/ComparisonShowcase";
import { DynamicFooter } from "../../_components/footer/dynamic-footer";

export const metadata: Metadata = {
  title: "Universities Solutions",
  description:
    "Power higher education communication with Zedu. Connect departments, professors, and students with structured channels, searchable discussions, and AI-assisted learning workflows.",
  keywords: [
    "university communication platform",
    "higher education collaboration software",
    "campus communication tool",
    "course discussion platform",
    "student engagement software",
    "AI learning platform for universities",
    "department communication software",
    "Zedu universities",
  ],
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "Zedu for Universities - Structured Communication at Scale",
    description:
      "Unify academic communication across faculties and courses with dedicated channels, collaborative learning spaces, and AI-powered assistance.",
    url: siteUrl("/solutions/universities"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu universities solution page preview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu for Universities - Academic Collaboration Platform",
    description:
      "Help departments and students communicate clearly, coordinate courses faster, and keep academic discussions organized in one workspace.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/solutions/universities"),
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
    title: "Large Cohorts",
    desc: "Support hundreds of students across programs and courses with structured communication.",
  },
  {
    title: "Organized Courses",
    desc: "Create dedicated channels so conversations, announcements, and resources stay structured and accessible.",
  },
  {
    title: "AI Assisted Learning",
    desc: "Built-in AI tools help summarize discussions, answer common questions, and support both educators and students.",
  },
];

const structuredCommunicationCards = [
  {
    title: "Organized Communication",
    desc: "Keep conversations structured across courses, faculties, and programs.",
    image:
      "/images/homepage/solutions/universities/organised-communication.png",
  },
  {
    title: "Collaboration at Scale",
    desc: "Support large student communities with clear and accessible discussions.",
    image: "/images/homepage/solutions/universities/collaboration-at-scale.png",
  },
  {
    title: "AI-Powered Learning",
    desc: "Fast insights and educator tools with summaries, answers, and recommendations.",
    image: "/images/homepage/solutions/universities/AI-powered-learning.png",
  },
];

const institutionSecurityCards = [
  {
    title: "Role-Based Permissions",
    desc: "Control who can manage channels, announcements, and classes.",
    icon: Settings,
  },
  {
    title: "Department Workspaces",
    desc: "Separate academic orgs while keeping everything connected.",
    icon: Lock,
  },
  {
    title: "Secure Communication",
    desc: "Protected environments designed for education.",
    icon: Shield,
  },
];

const comparisonData = {
  withoutTitle: "Without Zedu",
  withoutItems: [
    "Universities only get email, messaging apps, and LMS tools, making communication scattered",
    "Important updates from professors or departments are often lost in crowded inboxes or long discussion threads",
    "Students often don't know where to ask questions about lectures, and finding resources becomes difficult",
    "Professors and teaching assistants juggle multiple tools just to manage communication and collaboration",
    "Discussions and course materials disappear at the end of each semester instead of remaining accessible",
  ],
  withTitle: "With Zedu",
  withItems: [
    "All academic communication lives in one platform structured by departments and courses",
    "Professors and departments share updates in dedicated channels that students can easily follow",
    "Students participate in focused discussions where questions, answers, and resources stay easy to follow",
    "Professors, assistants, and staff collaborate in shared workspaces designed for academic coordination",
    "Course discussions, resources, and insights remain searchable and accessible for future reference",
  ],
};

const featureMetrics = [
  {
    title: "40%",
    description: "Less communication overhead",
  },
  {
    title: "2x",
    description: "Faster course coordination",
  },
  {
    title: "60%",
    description: "Higher student participation",
  },
];

const UniversitiesSolutionsPage = () => {
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
              <span className="text-primary-500">Modern</span> Communication for
              Universities
            </h1>
            <p className="max-w-[46ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Bring departments, courses, and student communities together in
              one structured learning workspace designed for higher education.
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
                src="/images/homepage/solutions/univerisities-hero.png"
                alt="Students seated together while collaborating in the Zedu university workspace"
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
            Built for Higher Education Environments
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
            Structured Communication Across the University
          </h1>
          <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[65%] lg:max-w-[45%] lg:text-lg">
            Connect departments, support large student communities, and enhance
            learning with intelligent tools
          </p>
          <div>
            <ArrowBtn text="Get Started" linkToHome />
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            Institution Control and Security
          </h1>
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {institutionSecurityCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.title}
                className="flex flex-col items-center gap-4 rounded-xl border border-neutral-200 p-6 text-center"
              >
                <IconComponent
                  className="text-primary-500"
                  size={32}
                  strokeWidth={1.5}
                />
                <h3 className="text-lg font-semibold text-[#1f2530]">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="relative isolate overflow-hidden space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
            How Zedu transforms Universities
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
            Run Leaner. Move Faster. Teach Better.
          </h1>
          <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[65%] lg:max-w-[45%] lg:text-lg">
            Zedu bring  communication, collaboration, and course
            management. into one structured workspace reducing complexity,
            improving communication, and helping institutions move faster.
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

      <DynamicFooter
        text="Bring Structured Communication to Your University"
        description="Give educators and students a platform designed specifically for academic collaboration."
      />
    </>
  );
};

export default UniversitiesSolutionsPage;
