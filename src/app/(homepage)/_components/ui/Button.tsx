"use client";

import Link from "next/link";
import { JSX, useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { GooglePlayStoreOutlineIcon, AppleStoreOutlineIcon } from "../svgs";

export const OutlineBtn = ({
  text,
  className,
  onClick,
  href,
}: {
  text: string;
  onClick?: () => void;
  className?: string;
  href?: string;
}) => {
  const button = (
    <button
      onClick={onClick}
      className={cn(
        "border border-primary-500 text-blue-100 ease-in px-4 py-2.5 sm:px-6 sm:py-3 font-medium rounded-full transition-colors duration-100 hover:bg-primary-500 hover:text-white",
        className
      )}
    >
      {text}
    </button>
  );

  if (href) {
    return <Link href={href}>{button}</Link>;
  }

  return button;
};

export const ArrowBtn = ({
  text,
  className,
  onClick,
  href,
  linkToHome,
  inverted,
  loggedInText,
  hideArrow = false,
}: {
  text: string;
  onClick?: () => void;
  className?: string;
  href?: string;
  hideArrow?: boolean;
  linkToHome?: boolean;
  loggedInText?: string;
  inverted?: boolean;
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [orgSlug, setOrgSlug] = useState<string | null>(null);

  useEffect(() => {
    setToken(window.localStorage.getItem("token"));
    setOrgSlug(window.localStorage.getItem("orgSlug"));
  }, []);

  if (linkToHome) href = token ? `/${orgSlug}` : "/auth/sign-up";

  return (
    <Link href={href || "#"}>
      <button
        onClick={onClick}
        className={cn(
          "group bg-primary-500 text-white px-4 py-2.5 sm:px-6 sm:py-3 font-medium rounded-full flex items-center gap-3 transition-colors duration-200 hover:bg-primary-400",
          className
        )}
      >
        {token && loggedInText ? loggedInText : text}
        {!hideArrow && (
          <div
            className={cn(
              "transition-transform duration-300 ease-out group-hover:translate-x-1",
              inverted && "order-first"
            )}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 0C10.4288 0 7.91543 0.762437 5.77759 2.1909C3.63975 3.61935 1.97351 5.64968 0.989572 8.02512C0.0056327 10.4006 -0.251811 13.0144 0.249797 15.5362C0.751405 18.0579 1.98953 20.3743 3.80762 22.1924C5.6257 24.0105 7.94208 25.2486 10.4638 25.7502C12.9856 26.2518 15.5995 25.9944 17.9749 25.0104C20.3503 24.0265 22.3807 22.3603 23.8091 20.2224C25.2376 18.0846 26 15.5712 26 13C25.9964 9.5533 24.6256 6.24882 22.1884 3.81163C19.7512 1.37445 16.4467 0.00363977 13 0ZM18.7075 13.7075L14.7075 17.7075C14.5199 17.8951 14.2654 18.0006 14 18.0006C13.7346 18.0006 13.4801 17.8951 13.2925 17.7075C13.1049 17.5199 12.9994 17.2654 12.9994 17C12.9994 16.7346 13.1049 16.4801 13.2925 16.2925L15.5863 14H8.00001C7.73479 14 7.48044 13.8946 7.2929 13.7071C7.10536 13.5196 7.00001 13.2652 7.00001 13C7.00001 12.7348 7.10536 12.4804 7.2929 12.2929C7.48044 12.1054 7.73479 12 8.00001 12H15.5863L13.2925 9.7075C13.1049 9.51986 12.9994 9.26536 12.9994 9C12.9994 8.73464 13.1049 8.48014 13.2925 8.2925C13.4801 8.10486 13.7346 7.99944 14 7.99944C14.2654 7.99944 14.5199 8.10486 14.7075 8.2925L18.7075 12.2925C18.8005 12.3854 18.8742 12.4957 18.9246 12.6171C18.9749 12.7385 19.0008 12.8686 19.0008 13C19.0008 13.1314 18.9749 13.2615 18.9246 13.3829C18.8742 13.5043 18.8005 13.6146 18.7075 13.7075Z"
                fill="white"
              />
            </svg>
          </div>
        )}
      </button>
    </Link>
  );
};

export const DownloadAppBtn = ({
  text,
  description,
  className,
  onClick,
  href,
  inverted,
  hideArrow = false,
  leftIcon,
  dark,
  iconColor,
}: {
  text: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  href?: string;
  hideArrow?: boolean;
  inverted?: boolean;
  dark?: boolean;
  leftIcon?: "google" | "apple" | string;
  iconColor?: string;
}) => {
  const iconMap: Record<string, (props?: { color?: string }) => JSX.Element> = {
    google: GooglePlayStoreOutlineIcon,
    apple: AppleStoreOutlineIcon,
  };

  const LeftIcon = iconMap[leftIcon as string] || GooglePlayStoreOutlineIcon;
  const resolvedIconColor = iconColor ?? (dark ? "#FFFFFF" : "#343330");

  return (
    <Link href={href || "#"} target="_blank" rel="noopener noreferrer">
      <button
        onClick={onClick}
        className={cn(
          "group text-white px-4 py-2.5 sm:px-6 sm:py-3 font-medium rounded-full flex items-center gap-3 transition-colors duration-200 ",
          dark
            ? "bg-primary-500 hover:bg-primary-400 text-white"
            : "bg-white hover:bg-white/90 text-black",
          className
        )}
      >
        <LeftIcon color={resolvedIconColor} />
        <div
          className={
            "flex text-left flex-col gap-0.5" +
            (dark ? "text-white" : "text-black")
          }
        >
          <span className="text-xs font-medium">{text}</span>
          {description && (
            <span className="text-sm font-semibold">{description}</span>
          )}
        </div>
        {!hideArrow && (
          <div
            className={cn(
              "transition-transform duration-300 ease-out group-hover:translate-x-1",
              inverted && "order-first"
            )}
          >
            {dark ? (
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 0C10.4288 0 7.91543 0.762437 5.77759 2.1909C3.63975 3.61935 1.97351 5.64968 0.989572 8.02512C0.0056327 10.4006 -0.251811 13.0144 0.249797 15.5362C0.751405 18.0579 1.98953 20.3743 3.80762 22.1924C5.6257 24.0105 7.94208 25.2486 10.4638 25.7502C12.9856 26.2518 15.5995 25.9944 17.9749 25.0104C20.3503 24.0265 22.3807 22.3603 23.8091 20.2224C25.2376 18.0846 26 15.5712 26 13C25.9964 9.5533 24.6256 6.24882 22.1884 3.81163C19.7512 1.37445 16.4467 0.00363977 13 0ZM18.7075 13.7075L14.7075 17.7075C14.5199 17.8951 14.2654 18.0006 14 18.0006C13.7346 18.0006 13.4801 17.8951 13.2925 17.7075C13.1049 17.5199 12.9994 17.2654 12.9994 17C12.9994 16.7346 13.1049 16.4801 13.2925 16.2925L15.5863 14H8.00001C7.73479 14 7.48044 13.8946 7.2929 13.7071C7.10536 13.5196 7.00001 13.2652 7.00001 13C7.00001 12.7348 7.10536 12.4804 7.2929 12.2929C7.48044 12.1054 7.73479 12 8.00001 12H15.5863L13.2925 9.7075C13.1049 9.51986 12.9994 9.26536 12.9994 9C12.9994 8.73464 13.1049 8.48014 13.2925 8.2925C13.4801 8.10486 13.7346 7.99944 14 7.99944C14.2654 7.99944 14.5199 8.10486 14.7075 8.2925L18.7075 12.2925C18.8005 12.3854 18.8742 12.4957 18.9246 12.6171C18.9749 12.7385 19.0008 12.8686 19.0008 13C19.0008 13.1314 18.9749 13.2615 18.9246 13.3829C18.8742 13.5043 18.8005 13.6146 18.7075 13.7075Z"
                  fill="white"
                />
              </svg>
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 3C13.4288 3 10.9154 3.76244 8.77759 5.1909C6.63975 6.61935 4.97351 8.64968 3.98957 11.0251C3.00563 13.4006 2.74819 16.0144 3.2498 18.5362C3.75141 21.0579 4.98953 23.3743 6.80762 25.1924C8.6257 27.0105 10.9421 28.2486 13.4638 28.7502C15.9856 29.2518 18.5995 28.9944 20.9749 28.0104C23.3503 27.0265 25.3807 25.3603 26.8091 23.2224C28.2376 21.0846 29 18.5712 29 16C28.9964 12.5533 27.6256 9.24882 25.1884 6.81163C22.7512 4.37445 19.4467 3.00364 16 3ZM21.7075 16.7075L17.7075 20.7075C17.5199 20.8951 17.2654 21.0006 17 21.0006C16.7346 21.0006 16.4801 20.8951 16.2925 20.7075C16.1049 20.5199 15.9994 20.2654 15.9994 20C15.9994 19.7346 16.1049 19.4801 16.2925 19.2925L18.5863 17H11C10.7348 17 10.4804 16.8946 10.2929 16.7071C10.1054 16.5196 10 16.2652 10 16C10 15.7348 10.1054 15.4804 10.2929 15.2929C10.4804 15.1054 10.7348 15 11 15H18.5863L16.2925 12.7075C16.1049 12.5199 15.9994 12.2654 15.9994 12C15.9994 11.7346 16.1049 11.4801 16.2925 11.2925C16.4801 11.1049 16.7346 10.9994 17 10.9994C17.2654 10.9994 17.5199 11.1049 17.7075 11.2925L21.7075 15.2925C21.8005 15.3854 21.8742 15.4957 21.9246 15.6171C21.9749 15.7385 22.0008 15.8686 22.0008 16C22.0008 16.1314 21.9749 16.2615 21.9246 16.3829C21.8742 16.5043 21.8005 16.6146 21.7075 16.7075Z"
                  fill="#7141F8"
                />
              </svg>
            )}
          </div>
        )}
      </button>
    </Link>
  );
};
