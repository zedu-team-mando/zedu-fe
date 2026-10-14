import { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import Image from "next/image";
import { ArrowBtn, OutlineBtn } from "../../_components/ui/Button";
import { BuzzPageHeroSVG } from "../../_components/svgs";
import { FAQSection } from "../../_components/home/FAQSection";
import type { HomeFAQ } from "../../_lib/faqData";
import { DynamicFooter } from "../../_components/footer/dynamic-footer";

export const metadata: Metadata = {
  title: "Buzz: Instant Voice Calls for Learning Teams",
  description:
    "Use Zedu Buzz to start instant voice conversations inside learning channels. Collaborate in real time, clarify lessons faster, and review AI-generated session summaries.",
  keywords: [
    "Zedu Buzz",
    "education voice chat",
    "classroom audio discussions",
    "live cohort collaboration",
    "AI meeting summaries for education",
    "real-time learning communication",
    "bootcamp voice collaboration",
    "university class discussions",
    "interactive communication for students",
  ],
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "Zedu Buzz - Instant Voice Conversations for Learning Teams",
    description:
      "Launch live voice discussions directly in channels and keep every session useful with AI-powered recap summaries.",
    url: siteUrl("/products/buzz"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu Buzz live voice collaboration for education",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu Buzz - Real-Time Voice Collaboration",
    description:
      "Start instant voice sessions in your learning channels and keep everyone aligned with AI-generated summaries.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/products/buzz"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

const featureCardData = [
  {
    title: "Talk in Real Time Inside Learning Channels",
    desc: "Start a Buzz instantly from any course or cohort channel without leaving the conversation. With just one click, students and instructors can jump into a live voice discussion to talk through ideas, ask questions, or collaborate",
    image: "/images/homepage/products/buzz/image-1.png",
  },
  {
    title: "Focus on Learning, Not Scheduling",
    desc: "Buzz makes it easy to start quick voice conversations whenever you need them. Instead of waiting for scheduled meetings, you can instantly open a discussion to ask for help, clarify concepts, or brainstorm ideas with your classmates or instructor.",
    image: "/images/homepage/products/buzz/image-2.png",
  },
  {
    title: "Let AI Capture the Conversation",
    desc: "After every Buzz session ends, the platform automatically generates a summary of the conversation. Key ideas, important points, and decisions are captured so students can easily review what was discussed.",
    image: "/images/homepage/products/buzz/image-3.png",
  },
  {
    title: "Clear Communication for Every Learner",
    desc: "Buzz is designed to support smooth and organized discussions, even in large classrooms, bootcamps, or active learning communities. Multiple participants can join the conversation without things becoming chaotic, allowing everyone to listen, contribute, and collaborate effectively.",
    image: "/images/homepage/products/buzz/image-4.png",
  },
];

const buzzFAQs: HomeFAQ[] = [
  {
    id: "buzz-item-1",
    question: "When should I use Buzz?",
    answer:
      "Use Buzz when your class or team needs a quick live voice discussion, especially for clarifying lessons, brainstorming ideas, or resolving blockers in real time.",
  },
  {
    id: "buzz-item-2",
    question: "What can I do in a Buzz session?",
    answer:
      "You can join instant voice conversations, discuss course topics, ask questions, collaborate with classmates, and align on next steps without leaving your channel.",
  },
  {
    id: "buzz-item-3",
    question: "How do I start a Buzz?",
    answer:
      "Open the relevant learning channel and start a Buzz with one click. Participants in that context can join quickly and continue the discussion live.",
  },
  {
    id: "buzz-item-4",
    question: "Are Buzz sessions summarized automatically?",
    answer:
      "Yes. After a Buzz session ends, Zedu can generate an AI summary so learners and educators can review key points and decisions later.",
  },
];

const BuzzProductsPage = () => {
  return (
    <>
      <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 w-screen -translate-x-1/2"
        >
          <BuzzPageHeroSVG />
        </div>
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 rounded-[28px] px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14 lg:px-12 lg:py-14 min-h-[85dvh]">
          <div className="flex flex-col items-center gap-5 text-center lg:max-w-[470px] lg:items-start lg:text-left">
            <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
              <span className="text-primary-500">Start a Buzz</span> Talk
              Instantly with Your Team .
            </h1>
            <p className="max-w-[46ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Buzz lets students, educators, and teams jump into quick voice
              conversations directly inside learning channels.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowBtn text="Start a buzz" linkToHome />
              {/* <OutlineBtn text="Watch a Demo" /> */}
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-3xl">
            <div className="relative aspect-[16/11] w-full sm:aspect-[4/3] lg:aspect-[16/10]">
              <Image
                src="/images/homepage/products/buzz-hero.png"
                alt="Zedu channels product screenshot"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 680px"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="relative isolate flex w-full flex-col items-center gap-4 overflow-hidden px-4 py-10 text-center sm:gap-6 sm:px-8 sm:py-16  lg:gap-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 sm:gap-12 lg:gap-16 mt-6">
          {featureCardData.map((card, index) => (
            <div
              key={card.title}
              className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-10"
            >
              <div
                className={`relative w-full ${index % 2 !== 0 ? "lg:order-2" : ""} p-6 py-8 rounded-3xl bg-blue-50/20`}
              >
                <div className="relative aspect-[16/11] w-full">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    preload
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain object-center"
                  />
                </div>
              </div>

              <div
                className={`flex flex-col items-start gap-5 text-left ${index % 2 !== 0 ? "lg:order-1" : ""}`}
              >
                <h2 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl lg:text-4xl">
                  {card.title}
                </h2>

                <p className="space-y-2 text-sm text-neutral-600 sm:text-base">
                  {card.desc}
                </p>

                <ArrowBtn text={"Start a Buzz"} linkToHome />
              </div>
            </div>
          ))}
        </div>
      </section>
      <FAQSection faqs={buzzFAQs} />
      <DynamicFooter
        text="Start a Buzz with Your Class Today"
        description="Quick voice discussions designed for learning communities."
      />
    </>
  );
};

export default BuzzProductsPage;
