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
  title: "Schools Solutions",
  description:
    "Improve classroom communication with Zedu. Give teachers and students structured channels for lessons, assignments, discussions, and school-wide updates in one platform.",
  keywords: [
    "school communication platform",
    "classroom communication software",
    "teacher student collaboration",
    "school announcements tool",
    "assignment communication platform",
    "K-12 communication software",
    "education collaboration platform",
    "Zedu schools",
  ],
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "Zedu for Schools - Structured Communication for Classrooms",
    description:
      "Bring teachers, students, and school staff into one organized workspace for announcements, assignments, and focused classroom discussions.",
    url: siteUrl("/solutions/schools"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu schools solution page preview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu for Schools - Structured Classroom Communication",
    description:
      "Create organized school communication where class discussions, updates, and assignments stay easy to follow for everyone.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/solutions/schools"),
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
    title: "Organised Classrooms",
    desc: "Teachers manage discussions, homework, and announcements in structured channels.",
  },
  {
    title: "Engaged Students",
    desc: "Students participate in discussions and collaborate easily.",
  },
  {
    title: "Less Administrative Overhead",
    desc: "Teachers spend less time managing communication.",
  },
];

const structuredCommunicationCards = [
  {
    title: "Organised Classroom Communication",
    desc: "Structure lessons, announcements, and discussions for easy access of information",
    image:
      "/images/homepage/solutions/schools/organised-classroom-communication.png",
  },
  {
    title: "Encourage Student Participation",
    desc: "Create spaces where students can ask questions, join discussions, and stay engaged",
    image:
      "/images/homepage/solutions/schools/encourage-student-participation.png",
  },
];

const comparisonData = {
  withoutTitle: "Without Zedu",
  withoutItems: [
    "Teachers rely on multiple tools like messaging apps, email, and school portals to communicate with students",
    "Important updates about homework, tests, or schedule changes can easily get lost in long messages or chats",
    "Students often don't know where to ask questions or get help about class topics.",
    "Assignments and feedback are shared across different tools, making it harder for students to stay organized.",
    "Many students hesitate to participate when classroom discussions are unstructured or difficult to follow.",
  ],
  withTitle: "With Zedu",
  withItems: [
    "Every class has its own structured space where teachers and students communicate clearly.",
    "Important updates are posted in visible channels where students can easily stay informed.",
    "Students ask questions in focused discussion threads for each subject or lesson.",
    "Assignments, feedback, and clarifications stay in one place for easy access.",
    "Students participate in discussions and collaborative learning activities throughout the class.",
  ],
};

const featureMetrics = [
  {
    title: "50%",
    description: "Less communication clutter",
  },
  {
    title: "2x",
    description: "Faster homework coordination",
  },
  {
    title: "65%",
    description: "Higher student engagement",
  },
];

const SchoolsSolutionsPage = () => {
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
              <span className="text-primary-500">A Smarter </span> Communication
              for Schools
            </h1>
            <p className="max-w-[46ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Connect teachers, students, and school staff in one organized
              workspace designed for modern classrooms.
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
                src="/images/homepage/solutions/schools-hero.png"
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
            Built for Modern School Communication
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
            Better Communication for Every Classroom
          </h1>
          <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[65%] lg:max-w-[45%] lg:text-lg">
            Keep lessons organized and create an environment where students can
            actively participate
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
            How Zedu transforms Schools
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
            Schools often rely on multiple tools for communication and
            collaboration. Zedu brings everything together into one organized
            workspace so teachers and students can focus on learning.
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
        text="Transform Communication in Your School"
        description="Give teachers and students a structured platform designed for modern classrooms."
      />
    </>
  );
};

export default SchoolsSolutionsPage;
