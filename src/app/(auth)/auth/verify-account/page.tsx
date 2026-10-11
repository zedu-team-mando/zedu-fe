"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster } from "~/components/ui/toaster";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { formatTime, maskEmail } from "~/utils";
import Loading from "~/components/ui/loading";
import { PostRequest } from "~/utils/request";
import { showError, showSuccess } from "~/components/toast/sonner";

function VerifyAccount() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(1 * 60);
  const [value, setValue] = useState("");
  const [buttonloading, setButtonloading] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleSubmit = async () => {
    if (value === "" || value?.length < 6) {
      showError("OTP inputs cannot be empty");
      return;
    }

    setButtonloading(true);

    const res = await PostRequest("/auth/email-request/verify", {
      token: value,
    });

    if (res?.status === 200 || res?.status === 201) {
      showSuccess(res?.data?.message);
      router.push("/auth/login");
    }
    setButtonloading(false);
  };

  // resend otp
  const handleResend = async () => {
    const payload = {
      email,
    };

    const res = await PostRequest("/auth/email-request", payload);

    if (res?.status === 200 || res?.status === 201) {
      setTimeLeft(1 * 60);
      showSuccess(res?.data.message);
    }
    setLoading(false);
  };
  //

  return (
    <>
      <Toaster />
      <main className="w-full min-h-screen flex flex-col md:flex-row">
        <section className="w-full md:w-[45%] bg-[#F9FAFB] px-[20px] md:px-[40px] py-[20px] hidden lg:block">
          <Link href="/">
            <Image src="/login_logo.svg" alt="" width={86} height={31} />
          </Link>
          <div>
            <div className="w-full flex flex-col gap-[12px] mb-[40px] md:mb-[71px]">
              <h1 className="w-full text-center mt-[40px] md:mt-[70px] text-[24px] md:text-[28px] font-[600] leading-[30px] md:leading-[35px]">
                One Platform{" "}
                <span className="text-[24px] md:text-[28px] font-[600] leading-[30px] md:leading-[35px] bg-gradient-to-t from-[#8860F8] to-[#7141F8] bg-clip-text text-transparent">
                  Infinite Workflows
                </span>{" "}
              </h1>
              <p className="w-full text-center text-[12px] md:text-[14px] text-[#344054] font-[400] leading-[18px] md:leading-[21px] px-[20px] md:px-[90px]">
                Your central hub for AI-powered workflows. Streamline content
                creation, manage documents, build customer relationships,
                process invoices, and more. One platform, endless possibilities.
              </p>
            </div>
            <Image
              src="/login_img.png"
              alt="loginImg"
              width={320}
              height={320}
              className="flex justify-center items-center mx-auto md:w-[420px] md:h-[420px]"
            />
          </div>
        </section>

        <section className="w-full md:w-[55%] flex flex-col max-w-xs md:max-w-lg mx-auto items-start justify-start pt-[20px] md:pt-0">
          <Link href="/">
            <Image
              src="/logomobile.svg"
              alt="logo_mobile"
              width={86}
              height={31}
              className="sm:block md:block lg:hidden flex"
            />
          </Link>

          <div
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            className="flex w-full flex-col items-center gap-5 sm:max-w-[425px] mx-auto mt-[60px] md:mt-[130px]"
          >
            <h4 className="w-full text-center text-xl font-bold text-[#0F172A]">
              Verify your Zedu Account
            </h4>

            <div className="flex flex-col items-center text-[#0F172A]">
              <p className="text-sm font-medium text-[#0F172A] mb-2">
                We have sent a code to your email{" "}
                {maskEmail(email || "") || "address"}
              </p>
              <div className="flex flex-col items-center text-base">
                <span className="text-xs">
                  check your spam if you do not recive the email
                </span>
              </div>
            </div>

            <InputOTP
              maxLength={6}
              className="flex w-full"
              // onComplete={onOtpSubmit}
              value={value}
              onChange={setValue}
              disabled={loading}
            >
              {...[0, 1, 2, 3, 4, 5].map((number_) => (
                <InputOTPGroup key={number_}>
                  <InputOTPSlot index={number_} />
                </InputOTPGroup>
              ))}
            </InputOTP>

            <Button
              type="submit"
              variant="default"
              className="w-full sm:w-[300px] py-6 bg-[#7141F8] hover:bg-[#8760f8] text-white"
              onClick={handleSubmit}
            >
              {buttonloading ? (
                <span className="flex items-center gap-x-2">
                  <span className="animate-pulse">Verifying...</span>{" "}
                  <Loading width="20" height="20" />
                </span>
              ) : (
                "Verify Account"
              )}
            </Button>

            <div className="flex flex-col items-center">
              <p className="text-xs text-gray-500">
                Didn&apos;t receive the code?{" "}
                {timeLeft <= 0 ? (
                  <span
                    className="cursor-pointer text-[#7141F8]"
                    onClick={handleResend}
                  >
                    resend
                  </span>
                ) : (
                  <span className="cursor-pointer text-[#7141F8]">
                    {formatTime(timeLeft)}
                  </span>
                )}
              </p>
            </div>
            <p className="text-center text-xs text-gray-500">
              We would process your data as set forth in our Terms of Use,
              Privacy Policy and Data Processing Agreement
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default VerifyAccount;
