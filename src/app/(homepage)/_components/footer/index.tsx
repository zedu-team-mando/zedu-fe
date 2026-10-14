"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { PostRequest } from "~/utils/request";
import { useToast } from "~/components/ui/use-toast";
import {
  appStoreUrl,
  facebookUrl,
  instagramUrl,
  playStoreUrl,
  tiktokUrl,
  xUrl,
} from "~/lib/env-urls";
import { Loader2, Star } from "lucide-react";
import { ZeduRoundedWhiteLogo, ZeduWhiteLogo } from "../svgs";

type FooterLink = {
  id: number;
  label: string;
  href: string;
};

const productLinks: FooterLink[] = [
  { id: 0, label: "Buzz", href: "/products/buzz" },
  { id: 1, label: "Channels", href: "/products/channels" },
  { id: 2, label: "File Management", href: "/products/file-management" },
];

const solutionLinks: FooterLink[] = [
  { id: 0, label: "Bootcamps", href: "/solutions/bootcamps" },
  { id: 1, label: "Schools", href: "/solutions/schools" },
  { id: 2, label: "Universities", href: "/solutions/universities" },
];

const supportLinks: FooterLink[] = [
  { id: 0, label: "Pricing", href: "/pricing" },
  { id: 3, label: "Contact Us", href: "/contact-sales" },
];

const resourcesLinks: FooterLink[] = [
  { id: 0, label: "Blogs", href: "/resources" },
  { id: 2, label: "Privacy Policy", href: "/policy" },
  { id: 3, label: "Terms of Service", href: "/terms-of-service" },
];

const footerSections = [
  { title: "Products", links: productLinks, twoColumns: true },
  { title: "Solutions", links: solutionLinks, twoColumns: true },
  { title: "Zedu", links: supportLinks, twoColumns: false },
  { title: "Resources", links: resourcesLinks, twoColumns: false },
];

const socialLinks = [
  {
    id: 0,
    href: instagramUrl(),
    icon: "/instagram-fill.svg",
    alt: "instagram icon",
  },
  {
    id: 1,
    href: tiktokUrl(),
    icon: "/tiktok-fill.svg",
    alt: "tiktok icon",
  },
  {
    id: 2,
    href: facebookUrl(),
    icon: "/facebook-fill.svg",
    alt: "facebook icon",
  },
  {
    id: 3,
    href: xUrl(),
    icon: "/images/twitter-white.svg",
    alt: "twitter icon",
  },
];

const appStoreLinks = [
  {
    id: 0,
    href: appStoreUrl(),
    icon: "/images/app-download/app-store-badge-2.png",
    label: "App store",
    rating: "4.9",
    starKey: "app",
  },
  {
    id: 1,
    href: playStoreUrl(),
    icon: "/images/app-download/google-play-badge-2.png",
    label: "Play store",
    rating: "4.7",
    starKey: "play",
  },
];

const inter = Inter({ subsets: ["latin"] });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

const Footer = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token") || "";

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const req = await PostRequest("/newsletter", { email: email }, token);
    setLoading(false);
    if (req?.data?.status_code === 201) {
      setEmail("");
      setError("");
      toast({
        description: "Email sent successfully!",
      });
    } else {
      setError(req?.data?.message);
      return;
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <footer className="flex flex-col bg-[#303073] text-[#fafafa] px-6">
      <div className="mx-auto w-full max-w-[1300px] py-8 sm:py-12">
        <div className="flex flex-col gap-12 xl:flex-row xl:items-start xl:justify-between xl:gap-16">
          <div className="w-full max-w-[420px] space-y-8">
            <div className="flex items-center gap-3">
              <Link href="/" className="[&>svg]:h-[39px] [&>svg]:w-[39px]">
                <ZeduRoundedWhiteLogo />
              </Link>
              <h3 className="text-2xl font-semibold leading-none text-white">
                Get Zedu today
              </h3>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`${inter.className} flex w-full flex-col gap-3 text-slate-100 antialiased`}
            >
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="newsletter-email"
                  className="text-base font-bold tracking-tight text-white"
                >
                  Sign up to our Newsletter
                </label>
                <p className="text-xs font-normal text-white/80 leading-relaxed">
                  Fresh ideas, useful insights, delivered to your inbox.
                </p>
              </div>

              <div className="flex h-12 w-full items-center justify-between gap-2 rounded-2xl bg-white p-1.5 shadow-md focus-within:ring-2 focus-within:ring-[#6042EC] focus-within:ring-offset-2 focus-within:ring-offset-[#303073]">
                <div className="flex items-center gap-2.5 pl-3 flex-1 min-w-0">
                  <svg
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    id="newsletter-email"
                    type="email"
                    name="newsletter"
                    aria-invalid={!!error}
                    aria-describedby={error ? "newsletter-error" : undefined}
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Clear a previous validation error as soon as the user
                      // edits the field again, so a stale message never lingers
                      // while they are correcting the address. React skips the
                      // state update when the value is unchanged.
                      if (error) setError("");
                    }}
                    className="h-full min-w-0 flex-1 bg-transparent border-none text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  disabled={loading}
                  className="flex h-full items-center justify-center gap-1.5 px-4 text-xs font-semibold text-white bg-[#6042EC] hover:bg-[#7254FC] disabled:opacity-70 transition-all duration-200 rounded-xl shrink-0 shadow-sm"
                >
                  {loading ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <span className="text-sm font-semibold">→</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <p
                  id="newsletter-error"
                  className="text-xs font-medium text-red-300"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <p className="text-[11px] font-normal text-white/70">
                Unsubscribe anytime.
              </p>
            </form>

            <div className="space-y-4">
              <p className="text-white/90">
                Mobile App is available on Google PlayStore and AppStore
              </p>
              <div className="mt-5 flex flex-wrap items-start gap-8 text-white">
                {appStoreLinks.map((store) => (
                  <Link key={store.id} href={store.href} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Image
                        src={store.icon}
                        width={24}
                        height={24}
                        alt={store.label}
                        className="h-6 w-6 rounded-md object-cover"
                      />
                      <span className="font-medium">{store.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={`${store.starKey}-star-${i}`}
                            color="gold"
                            fill="gold"
                            size={12}
                          />
                        ))}
                      <span className="ml-1 text-sm text-white/85">
                        {store.rating}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-14 xl:grid-cols-4 xl:gap-16 lg:border-l lg:border-neutral-50/25 lg:pl-14">
            {footerSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-8">
                <h2 className="text-xl font-semibold text-white">
                  {section.title}
                </h2>
                <div
                  className={`text-neutral-200 ${
                    section.twoColumns
                      ? "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-1"
                      : "flex flex-col gap-5"
                  }`}
                >
                  {section.links.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="transition-all hover:underline"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-50/25">
        <div className="mx-auto flex w-full max-w-[1300px] flex-col items-start justify-between gap-6 py-6 sm:py-8 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4 text-left">
            <div className="flex-shrink-0">
              <ZeduWhiteLogo />
            </div>
            <div className="flex flex-col gap-1 text-white/95">
              <span className="font-semibold leading-none tracking-[-0.02em]">
                © 2026 Zedu. All Rights Reserved
              </span>
              <Link
                href="mailto:contact@zedu.chat"
                className="text-[14px] leading-none font-normal text-white/85 transition-all hover:underline sm:text-[16px]"
              >
                contact@zedu.chat
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {socialLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:underline"
              >
                <Image src={item.icon} width={24} height={24} alt={item.alt} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
