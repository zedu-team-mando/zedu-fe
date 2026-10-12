"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { PostRequest, ResetPasswordRequest } from "~/utils/request";
import Loading from "~/components/ui/loading";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { formatTime, maskEmail } from "~/utils";
import { showSuccess } from "~/components/toast/sonner";
import { Eye, EyeOff } from "lucide-react";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    code: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();
  const [buttonloading, setButtonloading] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [timeLeft, setTimeLeft] = useState<number>(1 * 60);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  //

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = { code: "", password: "", confirmPassword: "" };
    if (value.length < 6) {
      newErrors.code = "Enter the 6-digit code from your email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !newErrors.code && !newErrors.password && !newErrors.confirmPassword;
  };

  const handleCodeChange = (code: string) => {
    setValue(code);
    if (errors.code) {
      setErrors((prevErrors) => ({ ...prevErrors, code: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setButtonloading(true);

      const payload = {
        token: value,
        new_password: password,
      };

      const res = await ResetPasswordRequest(
        "/auth/password-reset/verify",
        payload
      );

      if (res?.status === 200 || res?.status === 201) {
        showSuccess(res?.data.message);

        router.push("/auth/reset-password-success");
      } else {
        setButtonloading(false);
      }
    }
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

  //

  return (
    <>
      <main className="w-full min-h-screen flex flex-col">
        <div className="flex items-center justify-between w-full py-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Image src="/Zedu.png" alt="" width={86} height={31} />
          </Link>
          <div>
            Go back to Login?{" "}
            <Link href={"/auth/login"} className="text-[#7141F8]">
              Sign In
            </Link>
          </div>
        </div>

        <section className="w-full md:w-[55%] flex flex-col max-w-xs md:max-w-lg mx-auto items-start justify-center pt-[20px] md:pt-[30px]">
          <div className="w-full flex flex-col mt-[60px] gap-[8px] mb-[32px]">
            <h1 className="w-full text-center text-[24px] md:text-[28px] font-[600] leading-[30px] md:leading-[35px]">
              Reset Password
            </h1>
            <p className="w-full text-center text-[14px] md:text-[16px] text-[#344054] font-[400] leading-[21px] md:leading-[27px]">
              Choose a new password for your account
            </p>
            <p className="w-full text-center text-xs text-[#344054] font-[400] leading-[21px] md:leading-[27px]">
              We have sent a code to your email {maskEmail(email || "")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-[16px] mb-[32px]">
              <div className="w-full flex flex-col gap-[8px] relative">
                <label
                  htmlFor="password"
                  className="text-[14px] font-[400] leading-[21px]"
                >
                  Enter code from email
                </label>

                <InputOTP
                  maxLength={6}
                  className="flex w-full"
                  // onComplete={onOtpSubmit}
                  value={value}
                  onChange={handleCodeChange}
                  disabled={loading}
                >
                  {...[0, 1, 2, 3, 4, 5].map((number_) => (
                    <InputOTPGroup key={number_}>
                      <InputOTPSlot index={number_} />
                    </InputOTPGroup>
                  ))}
                </InputOTP>
                {errors.code && (
                  <small className="text-[12px] text-[#F81404]">
                    {errors.code}
                  </small>
                )}
              </div>

              <div className="w-full flex flex-col gap-[8px] relative">
                <label
                  htmlFor="password"
                  className="text-[14px] font-[400] leading-[21px]"
                >
                  Enter new password
                </label>
                <div className="w-full flex flex-col gap-[2px]">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Password"
                      className={`w-full text-[12px] text-[#667085] leading-[15.12px] font-[500] h-[48px] border ${
                        errors.password
                          ? "border-[#F81404]"
                          : "border-[#D0D0FD]"
                      } outline-none rounded-md py-[13px] pl-[13px] pr-[40px]`}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#667085] focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <small className="text-[12px] text-[#F81404]">
                      {errors.password}
                    </small>
                  )}
                </div>
              </div>

              <div className="w-full flex flex-col gap-[8px] relative">
                <label
                  htmlFor="confirmPassword"
                  className="text-[14px] font-[400] leading-[21px]"
                >
                  Confirm new password
                </label>
                <div className="w-full flex flex-col gap-[2px]">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder="Confirm New Password"
                      className={`w-full text-[12px] text-[#667085] leading-[15.12px] font-[500] h-[48px] border ${
                        errors.confirmPassword
                          ? "border-[#F81404]"
                          : "border-[#D0D0FD]"
                      } outline-none rounded-md py-[13px] pl-[13px] pr-[40px]`}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#667085] focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <small className="text-[12px] text-[#F81404]">
                      {errors.confirmPassword}
                    </small>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[16px]">
                <Button
                  type="submit"
                  variant="default"
                  className="py-6 bg-[#7141F8] hover:bg-[#8760f8] text-white"
                >
                  {buttonloading ? (
                    <span className="flex items-center gap-x-2">
                      <span className="animate-pulse">Loading...</span>{" "}
                      <Loading width="20" height="20" />
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <Link href="/auth/login">
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full py-6 border border-[#8760f8] text-[#8760f8] bg-white hover:bg-[#7141F8] hover:text-white"
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center mt-3">
              <p className="text-xs text-gray-500">
                {timeLeft <= 0 ? (
                  <span
                    className="cursor-pointer text-underline"
                    onClick={handleResend}
                  >
                    Resend code
                  </span>
                ) : (
                  <span className="cursor-disabled">Resend code after</span>
                )}{" "}
                <span className="text-[#7141F8]">
                  {formatTime(timeLeft)} secs
                </span>
              </p>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default ResetPassword;
