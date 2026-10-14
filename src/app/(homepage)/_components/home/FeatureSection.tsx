"use client";
import Image from "next/image";
import { ArrowBtn, OutlineBtn } from "../ui/Button";
import { FeatureCard } from "../ui/FeatureCard";
import {
  featureMetrics,
  features,
  otherFeatures,
} from "../../_lib/featureSectionData";
import { useRouter } from "next/navigation";

export const FeatureSection = () => {
  const router = useRouter();
  return (
    <>
      <section className="relative isolate flex w-full flex-col items-center gap-5 overflow-hidden px-4 py-12 text-center sm:gap-6 sm:px-8 sm:py-16 lg:gap-8 lg:px-12">
        <div className="flex flex-col gap-3 items-center">
          <h1 className=" text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl text-center">
            Everything you need for{" "}
            <span className="text-primary-500">Modern</span> Learning
          </h1>
          <p className="max-w-[95%] text-sm text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[85%] lg:max-w-[65%] lg:text-lg">
            From organized channels to AI-powered agents, Zedu brings
            communication, collaboration, and automation into one seamless
            workspace.
          </p>
          <div>
            <ArrowBtn text="Get started for free" inverted linkToHome />
          </div>
        </div>

        <div className="grid w-full max-w-6xl grid-cols-1 place-items-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              imageSrc={feature.imageSrc}
              imageAlt={feature.imageAlt}
            />
          ))}
        </div>
        <div className="w-full max-w-6xl rounded-2xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
            <div className="flex w-full flex-col gap-3 text-left lg:w-5/12">
              <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl">
                Fewer Tools, Smarter Learning
              </h1>
              <p className="text-sm leading-relaxed text-neutral-600 sm:text-base max-w-xl">
                Replace scattered apps with one structured platform for
                communication, collaboration, and AI-powered education.
              </p>
              <div>
                <OutlineBtn
                  text="Start Your Cohort"
                  onClick={() => router.push("/auth/login")}
                />
              </div>
            </div>

            <div className="w-full lg:w-7/12">
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
          </div>
        </div>
      </section>
      <section className="relative isolate flex w-full flex-col items-center gap-5 overflow-hidden px-4 py-10 sm:gap-6 sm:px-12 sm:py-14 ll lg:gap-8 lg:px-20 bg-blue-50/30">
        <div className="w-full max-w-7xl space-y-16 px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="flex w-full flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-2xl flex-col gap-3 text-left md:w-7/12">
              <h2 className="text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl lg:text-4xl">
                All Your Learning Tools.
                <span className="block text-primary-500">
                  One Simple Subscription
                </span>
              </h2>
              <p className="text-sm text-[#344054] sm:text-base">
                Replace disconnected learning tools with one seamless platform
              </p>
              <div>
                <Image
                  src={"/images/homepage/socials-row.png"}
                  alt="Icons of common chat and video apps, such as WhatsApp, Slack, Telegram and Discord"
                  height={35}
                  width={225}
                  priority
                  className="h-auto w-[190px] sm:w-[225px]"
                />
              </div>
              <div className="mt-1">
                <ArrowBtn text="Get started for free" inverted linkToHome />
              </div>
            </div>

            <div className="mx-auto w-full max-w-[220px] md:mx-0 md:mt-0 md:w-5/12 md:max-w-[306px]">
              <Image
                src={"/images/homepage/zedu-illustration.png"}
                alt="Illustration of Zedu connected to other social apps"
                height={306}
                width={306}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
          {/* other features cards */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6 ">
            {otherFeatures.map((feature) => (
              <div
                key={feature.title}
                className="flex h-full flex-col justify-center gap-3 rounded-2xl bg-white p-4 sm:gap-4 sm:rounded-3xl sm:p-6"
              >
                <Image
                  src={feature.icon}
                  alt={`${feature.title} icon`}
                  height={40}
                  width={40}
                  preload
                  className="h-8 w-8 sm:h-10 sm:w-10"
                />
                <h3 className="text-base font-semibold text-neutral-900 sm:text-lg">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-neutral-600 sm:text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
