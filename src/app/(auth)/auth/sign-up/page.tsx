"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "~/components/ui/checkbox";
import Loading from "~/components/ui/loading";
import { PostRequest } from "~/utils/request";
import { useGoogleLogin } from "@react-oauth/google";
import { RegisterWebhookRequest } from "~/utils/webhook-request";
import { Separator } from "~/components/ui/separator";
import AppleSignin from "react-apple-signin-auth";
import { Eye, EyeOff } from "lucide-react";

// The backend auto-creates a workspace at signup, so `is_onboarded` being
// true does not mean the user ever chose one. A missing type is never default.
const isAutoCreatedOrg = (type?: string) =>
  (type ?? "").trim().toLowerCase() === "user default org";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMinLength, setIsMinLength] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleloading, setGoogleloading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  // Apple Login handler
  const handleAppleSuccess = async (response: any) => {
    setAppleLoading(true);
    try {
      const id_token = response?.authorization?.id_token;
      if (!id_token) throw new Error("No id_token from Apple");
      const res = await PostRequest("/auth/apple", { id_token });
      if (res?.status === 200 || res?.status === 201) {
        const user = res?.data?.data?.user;
        const redirectUrl = searchParams.get("redirect") || "";
        localStorage.setItem("token", res?.data?.data?.access_token);
        localStorage.setItem("useremail", user?.email);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("orgId", user?.current_org);
        const orgSlug = res.data.data.user.current_organisation_slug;
        if (orgSlug) {
          localStorage.setItem("orgSlug", orgSlug);
        }
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          if (
            user?.is_onboarded &&
            !isAutoCreatedOrg(user?.organisation?.type)
          ) {
            router.push(`/${orgSlug}`);
          } else {
            router.push(`/${orgSlug}/welcome`);
          }
        }
        const message = `\nName: ${user?.username}\\nEmail: ${user?.email}`;
        RegisterWebhookRequest(
          user?.username,
          "User Registration (Apple)",
          message.trim(),
          "success"
        );
      }
    } catch (err) {
      console.error("Apple Signup Error:", err);
    } finally {
      setAppleLoading(false);
    }
  };

  useEffect(() => {
    const fromInvite = new URLSearchParams(window.location.search).get(
      "invite"
    );

    if (fromInvite) {
      const fullUrl = window.location.href;
      localStorage.setItem("postInviteRedirect", fullUrl);
    }
  }, []);

  useEffect(() => {
    const inviteEmail = searchParams.get("email");
    if (inviteEmail) {
      setEmail(inviteEmail.trim());
    }
  }, [searchParams]);

  useEffect(() => {
    const minLength = password.length >= 6;
    setIsMinLength(minLength);
    setIsValidPassword(minLength);
    setFormSubmitted(false);
  }, [password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = () => {
    setPasswordFocused(true);
  };

  const handleBlur = () => {
    setPasswordFocused(false);
  };

  // validate form
  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      newErrors.email = "Invalid email address";
    }

    if (!password || password.trim() === "") {
      newErrors.password = "Password is required";
    } else if (!isValidPassword) {
      newErrors.password = "Password is not valid";
    } else if (!isMinLength) {
      newErrors.password = "Password must have a minimum of 6 characters";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  // email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
    }
  };

  const handleEmailBlur = () => {
    setEmail((current) => current.trim());
  };

  // password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
    }
  };

  // handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (trimmedEmail !== email) {
      setEmail(trimmedEmail);
    }

    if (validateForm() && isValidPassword) {
      setLoading(true);
      const payload = {
        email: trimmedEmail,
        password,
      };

      const redirectUrl = searchParams.get("redirect") || "";
      const res = await PostRequest("/auth/register", payload);

      if (res?.status === 200 || res?.status === 201) {
        localStorage.setItem("token", res?.data?.data?.access_token);
        localStorage.setItem("useremail", res?.data?.data?.user?.email);
        localStorage.setItem("user", JSON.stringify(res?.data?.data?.user));
        localStorage.setItem("orgId", res?.data?.data?.user?.current_org);
        const orgSlug = res.data.data.user.current_organisation_slug;
        if (orgSlug) {
          localStorage.setItem("orgSlug", orgSlug);
        }

        if (redirectUrl) {
          setTimeout(() => {
            router.push(redirectUrl);
          }, 100);
        } else {
          setTimeout(() => {
            if (
              res?.data?.data?.user?.is_onboarded &&
              !isAutoCreatedOrg(res?.data?.data?.user?.organisation?.type)
            ) {
              router.push(`/${orgSlug}`);
            } else {
              router.push(`/${orgSlug}/welcome`);
            }
          }, 100);
        }

        const user = res?.data?.data?.user;

        const message = `
          Name: ${user?.username}\\n
          Email: ${user?.email}
          `;

        RegisterWebhookRequest(
          user?.username,
          "User Registration",
          message.trim(),
          "success"
        );
      } else {
        setLoading(false);
      }
    }
  };

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      setGoogleloading(true);

      const { code } = tokenResponse;

      try {
        const res = await PostRequest("/auth/google", {
          grant_code: code,
        });

        if (res?.status === 200 || res?.status === 201) {
          const user = res?.data?.data?.user;
          const redirectUrl = searchParams.get("redirect") || "";

          localStorage.setItem("token", res?.data?.data?.access_token);
          localStorage.setItem("useremail", user?.email);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("orgId", user?.current_org);
          const orgSlug = res.data.data.user.current_organisation_slug;
          if (orgSlug) {
            localStorage.setItem("orgSlug", orgSlug);
          }

          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            if (
              user?.is_onboarded &&
              !isAutoCreatedOrg(user?.organisation?.type)
            ) {
              router.push(`/${orgSlug}`);
            } else {
              router.push(`/${orgSlug}/welcome`);
            }
          }

          const message = `
          Name: ${user?.username}\\n
          Email: ${user?.email}
          `;

          RegisterWebhookRequest(
            user?.username,
            "User Registration",
            message.trim(),
            "success"
          );
        }
      } catch (err) {
        console.error("Google Login Error:", err);
      } finally {
        setGoogleloading(false);
      }
    },
    onError: () => {
      console.error("Login Failed");
    },
  });

  //

  return (
    <main className="w-full min-h-screen flex flex-col items-center">
      <div className="flex items-center justify-between w-full py-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Image src="/Zedu.png" alt="" width={86} height={31} />
        </Link>
        <div>
          Already have an account?{" "}
          <Link href={"/auth/login"} className="text-[#7141F8]">
            Sign In
          </Link>
        </div>
      </div>
      <section className="w-full md:w-[55%] flex flex-col max-w-xs md:max-w-lg mx-auto items-start justify-start pt-[20px] md:pt-0 ">
        <div className="w-full flex flex-col justify-center mt-10 items-center gap-[8px] mb-[32px]">
          <h1 className="w-full text-center mt-8 text-[24px] md:text-[28px] font-[600] leading-[30px] md:leading-[35px]">
            Stay Focused While{" "}
            <span className="text-[24px] md:text-[28px] font-[600] leading-[30px] md:leading-[35px] bg-gradient-to-t from-[#8860F8] to-[#7141F8] bg-clip-text text-transparent">
              Zedu Handles The Hustle
            </span>{" "}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full pb-[40px]">
          <div className="flex flex-col gap-[16px] mb-[16px]">
            <div className="w-full flex flex-col gap-[8px] relative">
              <label
                htmlFor="email"
                className="text-[14px] font-[400] leading-[21px]"
              >
                Email address
              </label>
              <div className="w-full flex flex-col gap-[2px]">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="Enter your email"
                  className={`w-full text-[14px] text-[#667085] leading-[15.12px] font-[500] h-[48px] border ${
                    errors.email ? "border-[#F81404]" : "border-[#D0D0FD]"
                  } outline-none rounded-md py-[13px] pl-[13px]`}
                />
                {errors.email && (
                  <small className="text-[12px] text-[#F81404]">
                    {errors.email}
                  </small>
                )}
              </div>
            </div>
            <div className="w-full flex flex-col gap-[8px] relative">
              <label
                htmlFor="password"
                className="text-[14px] font-[400] leading-[21px]"
              >
                Password
              </label>
              <div className="w-full flex flex-col gap-[2px]">
                <div className="relative ">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`w-full text-[14px] text-[#667085] leading-[15.12px] font-[500] h-[48px] border ${
                      formSubmitted
                        ? errors.password
                          ? "border-[#F81404]"
                          : "border-[#D0D0FD]"
                        : passwordFocused
                          ? errors.password
                            ? "border-[#F81404]"
                            : "border-[#D0D0FD]"
                          : "border-[#D0D0FD]"
                    } outline-none rounded-md py-[13px] pl-[13px] pr-[10px]`}
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
          </div>
          <div className="flex flex-col gap-[12px] mb-3">
            <div className="flex flex-row gap-[6px] items-center">
              <Checkbox className="mt-[2px]" />
              <p className="text-[14px] font-[400] leading-[17.64px]">
                Stay Signed In
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[16px]">
              <Button
                type="submit"
                variant="default"
                className="py-6 bg-[#7141F8] hover:bg-[#8760f8] text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-x-2">
                    <span className="animate-pulse">Creating...</span>{" "}
                    <Loading width="20" height="20" />
                  </span>
                ) : (
                  <span>Create Account</span>
                )}
              </Button>
            </div>
            <div className="w-full flex justify-center items-center">
              <div className="flex items-center justify-center gap-3 max-w-xl w-1/5">
                <Separator />
                <p>OR</p>
                <Separator />
              </div>
            </div>

            {/* Google Login */}
            <div className="border border-[#D0D0FD] rounded-md mb-2">
              <div
                onClick={() => login()}
                className="cursor-pointer flex flex-row gap-[10px] border border-[#D0D0FD] rounded-md justify-center py-[11px]"
              >
                <Image
                  src="/dashboard/google.svg"
                  width={24}
                  height={24}
                  alt="google"
                />
                <div className="text-[16px] font-[600] leading-[20.16px]">
                  {googleloading ? (
                    <span className="flex items-center gap-x-2">
                      <span className="animate-pulse">Logging in...</span>
                      <Loading width="20" height="20" color="#7141F8" />
                    </span>
                  ) : (
                    "Sign up with Google"
                  )}
                </div>
              </div>
            </div>
            {/* Apple Login */}
            <div className="border border-[#D0D0FD] py-[11px] rounded-md">
              <AppleSignin
                authOptions={{
                  clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "",
                  scope: "email name",
                  redirectURI:
                    typeof window !== "undefined"
                      ? window.location.origin + "/auth/sign-up"
                      : "",
                  usePopup: true,
                }}
                uiType="dark"
                className="cursor-pointer flex flex-row gap-[10px] border border-[#D0D0FD] rounded-md justify-center py-[11px] w-full"
                noDefaultStyle={true}
                render={(props: any) => (
                  <div
                    onClick={props.onClick}
                    className="flex flex-row gap-[10px] items-center justify-center w-full"
                  >
                    <Image
                      src="/dashboard/apple.png"
                      width={24}
                      height={24}
                      alt="apple"
                    />
                    <div className="text-[16px] font-[600] leading-[20.16px]">
                      {appleLoading ? (
                        <span className="flex items-center gap-x-2">
                          <span className="animate-pulse">Logging in...</span>
                          <Loading width="20" height="20" color="#000" />
                        </span>
                      ) : (
                        "Sign up with Apple"
                      )}
                    </div>
                  </div>
                )}
                onSuccess={handleAppleSuccess}
                onError={(err: any) => {
                  setAppleLoading(false);
                  console.error("Apple Signup Error:", err);
                }}
              />
            </div>
          </div>

          <p className="text-[14px] font-[400] leading-[17.64px] text-center m-2">
            By Signing up, you agree to our
            <Link
              href="/terms-of-service"
              target="_blank"
              className="px-1 font-[500] leading-[21px] text-[#7141F8] hover:text-[#9678e8]"
            >
              terms of service
            </Link>
            and
            <Link
              href="/policy"
              target="_blank"
              className="px-1 font-[500] leading-[21px] text-[#7141F8] hover:text-[#9678e8]"
            >
              privacy policy
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default SignUp;
