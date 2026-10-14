"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import SectionWrapper from "./component/SectionWrapper";
import { siteUrl } from "~/lib/env-urls";

// Set document title for client component
const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
function Policy() {
  const [activeSection, setActiveSection] = useState<string>("");

  // Set document title
  useDocumentTitle("Privacy Policy - Zedu");

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const sections = document.querySelectorAll("li[id]");
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.25,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    sections.forEach((section) => {
      observer.observe(section);
      sectionRefs.current[section.id] = section as HTMLElement;
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <SectionWrapper container="wide" variant="small">
      <div className="w-full flex py-8 ">
        <div className="hidden w-[314px] md:block mt-28 top-16 sticky self-start">
          <p className="text-2xl font-semibold leading-8 text-stone-900">
            Contents
          </p>
          <ul className="list-decimal p-4 flex flex-col gap-5 text-zinc-800">
            <Link href="#info-collected">
              <li
                className={`hover:text-blue-500 ${
                  activeSection === "info-collected" ? "text-blue-500" : ""
                }`}
              >
                Information We Collect
              </li>
            </Link>
            <Link href="#how">
              <li
                className={`hover:text-blue-500 ${
                  activeSection === "how" ? "text-blue-500" : ""
                }`}
              >
                How We Use Your Information
              </li>
            </Link>
            <Link href="#disclosure">
              <li
                className={`hover:text-blue-500 ${
                  activeSection === "disclosure" ? "text-blue-500" : ""
                }`}
              >
                Disclosure of Your Information
              </li>
            </Link>
            <Link href="#security">
              <li
                className={`hover:text-blue-500 ${
                  activeSection === "security" ? "text-blue-500" : ""
                }`}
              >
                Security of Your Information
              </li>
            </Link>
            <Link href="#rights">
              <li
                className={`hover:text-blue-500 ${
                  activeSection === "rights" ? "text-blue-500" : ""
                }`}
              >
                Your Rights
              </li>
            </Link>
            <Link href="#policy">
              <li
                className={`hover:text-blue-500 ${
                  activeSection === "policy" ? "text-blue-500" : ""
                }`}
              >
                Changes to This Privacy Policy
              </li>
            </Link>

            <Link href="#cookie">
              <li
                className={`hover:text-blue-500 ${
                  activeSection === "cookie" ? "text-blue-500" : ""
                }`}
              >
                Cookies and Tracking Technologies
              </li>
            </Link>
            <Link href="#data-retention">
              <li
                className={`hover:text-blue-500 ${
                  activeSection === "data-retention" ? "text-blue-500" : ""
                }`}
              >
                Data Retention
              </li>
            </Link>
            <Link href="#contact-us">
              <li
                className={`hover:text-blue-500 ${
                  activeSection === "contact-us" ? "text-blue-500" : ""
                }`}
              >
                Contact Us
              </li>
            </Link>
          </ul>
        </div>

        <div className="mt-16 md:mt-10 w-[375px] md:w-[700px] lg:w-[815px] py-3 px-5 text-black">
          <p className="text-2xl md:text-4xl font-semibold leading-10 pb-5">
            Our Privacy Policy
          </p>
          <p className="text-base font-normal leading-6 text-neutral-800">
            Thank you for using Zedu. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you
            visit our website
            <span className="p-1">
              <Link
                href={siteUrl()}
                target="_blank"
                rel=""
                className="text-blue-500"
              >
                www.zedu.chat
              </Link>
            </span>
            including any other media form, media channel, mobile website, or
            mobile application related or connected thereto Zedu. Please read
            this privacy policy carefully. If you do not agree with the terms of
            this privacy policy, please do not access the site.
          </p>
          <br />
          <br />

          <ol className="list-decimal p-4 gap-[72px]">
            <li
              className="text-xl md:text-2xl font-semibold leading-6 pb-3"
              id="info-collected"
            >
              Information We Collect
            </li>
            <p>
              <b>Personal Information:</b> We may collect personal information
              that you voluntarily provide to us when you register on the site,
              express interest in obtaining information about us or our products
              and services, when you participate in activities on the site or
              otherwise when you contact us. <br />
              <br />
              <b>Non-Personal Information:</b> We may collect non-personal
              information about you whenever you interact with our site.
              Non-personal information may include the browser name, the type of
              computer and technical information about your means of connection
              to our site, such as the operating system and the internet service
              providers utilized and other similar information.
            </p>
            <br />
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5"
              id="how"
            >
              How We Use Your Information
            </li>

            <p>We may use the information we collect in the following way:</p>
            <ul className="list-disc">
              <li>To personalize user experience</li>
              <li>To improve our site To send periodic emails</li>
              <li>To send you service updates or promotional messages</li>
              <li>To respond to inquiries or support requests</li>
            </ul>

            <br />
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5"
              id="disclosure"
            >
              Disclosure of Your Information
            </li>
            <p>
              We may share information we have collected about you in certain
              situations. Your information may be disclosed as follows:
            </p>
            <ul className="list-disc">
              <li>
                <b>Third-Party Service Providers:</b> We may share your
                information with third-party service providers who perform
                services on our behalf to help us operate our business and the
                Site or administer activities on our behalf.
              </li>
              <li>
                <b>Business Transfers:</b> We may share or transfer your
                information in connection with, or during negotiations of, any
                merger, sale of company assets, financing, or acquisition of all
                or a portion of our business to another company.
              </li>
              <li>
                <b>With your Consent: </b>We may disclose your personal
                information for any other purpose with your consent.
              </li>
            </ul>

            <br />
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5"
              id="security"
            >
              Security of Your Information
            </li>
            <p>
              We use administrative, technical, and physical security measures
              to help protect your personal information. While we have taken
              reasonable steps to secure the personal information you provide to
              us, please be aware that despite our efforts, no security measures
              are perfect or impenetrable, and no method of data transmission
              can be guaranteed against any interception or other type of
              misuse.
            </p>
            <br />
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5"
              id="rights"
            >
              Your Rights
            </li>
            <p>
              If you are a resident of Nigeria, you may have certain rights
              regarding your personal information under the Nigerian Data
              Protection Regulation (NDPR). These rights may include the right
              to access, correct, or delete your personal information.
            </p>
            <br />
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5 whitespace-nowrap"
              id="policy"
            >
              Changes to This Privacy Policy
            </li>
            <p>
              We may update this Privacy Policy from time to time in order to
              reflect, for example, changes to our practices or for other
              operational, legal, or regulatory reasons.
            </p>
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5 whitespace-nowrap"
              id="cookie"
            >
              Cookies and Tracking Technologies
            </li>
            <p>
              We may use cookies, web beacons, tracking pixels, and other
              technologies to help customize the site and improve your
              experience. Most browsers are set to accept cookies by default.
              You can choose to remove or reject cookies, but doing so may
              affect the availability and functionality of the site.
            </p>
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5 whitespace-nowrap"
              id="data-retention"
            >
              Data Retention
            </li>
            <p>
              We retain personal information for as long as necessary to fulfill
              the purposes outlined in this Privacy Policy unless otherwise
              required by law.
            </p>
            <li
              className="text-xl md:text-2xl font-semibold leading-6 py-5 whitespace-nowrap"
              id="contact-us"
            >
              Contact Us
            </li>
            <p>
              If you have questions or comments about this Privacy Policy, you
              may contact us at{" "}
              <span className="p-1">
                <Link
                  href="mailto:support@zedu.chat"
                  target="_blank"
                  rel=""
                  className="text-blue-500"
                >
                  support@zedu.chat
                </Link>
              </span>
            </p>
          </ol>
        </div>
      </div>
    </SectionWrapper>
  );
}

export default Policy;
