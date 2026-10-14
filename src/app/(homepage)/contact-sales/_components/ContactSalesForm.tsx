"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/use-toast";
import { cn } from "~/lib/utils";
import { contactSalesUrl } from "~/lib/env-urls";

const contactSalesSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine(
      (value) => /^\d{10,15}$/.test(value.replace(/\D/g, "")),
      "Please enter a valid phone number"
    ),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message is too long"),
});

type ContactSalesFormData = z.infer<typeof contactSalesSchema>;
type FormField = keyof ContactSalesFormData;
type FormErrors = Partial<Record<FormField, string>>;

const initialFormData: ContactSalesFormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const getFieldError = (field: FormField, value: string) => {
  const result = contactSalesSchema.shape[field].safeParse(value);
  return result.success
    ? ""
    : result.error.issues[0]?.message || "Invalid value";
};

const getFormErrors = (data: ContactSalesFormData): FormErrors => {
  const parsed = contactSalesSchema.safeParse(data);

  if (parsed.success) {
    return {};
  }

  const nextErrors: FormErrors = {};
  parsed.error.issues.forEach((issue) => {
    const path = issue.path[0] as FormField | undefined;
    if (!path || nextErrors[path]) {
      return;
    }
    nextErrors[path] = issue.message;
  });

  return nextErrors;
};

export const ContactSalesForm = () => {
  const [formData, setFormData] =
    useState<ContactSalesFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState<boolean>(false);
  const { toast } = useToast();

  const updateField = (field: FormField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: getFieldError(field, value),
      }));
    }
  };

  const validateField = (field: FormField) => {
    setErrors((prev) => ({
      ...prev,
      [field]: getFieldError(field, formData[field]),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formErrors = getFormErrors(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSending(true);

    const normalizedPhone = formData.phone.replace(/\D/g, "");
    const contactData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone_number: normalizedPhone,
      message: formData.message.trim(),
    };

    try {
      const response = await fetch(contactSalesUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast({
        title: "Message Sent!",
        description: `Thank you, ${formData.name}! We've received your message.`,
      });

      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      console.error("Error sending data:", error);
      toast({
        title: "Oops! Something Went Wrong.",
        description: `We're sorry, ${formData.name}. There was an issue sending your message. Please try again later.`,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] sm:p-6"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-[#222]">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            onBlur={() => validateField("name")}
            placeholder="Enter your full name"
            aria-invalid={Boolean(errors.name)}
            className={cn(
              "h-10 border-[#d9d9df] p-3 text-sm text-[#222] focus:ring-1 focus:ring-primary-500",
              errors.name && "border-red-500"
            )}
          />
          {errors.name ? (
            <p className="text-xs text-red-500">{errors.name}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-[#222]">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
            onBlur={() => validateField("email")}
            placeholder="Enter your email"
            aria-invalid={Boolean(errors.email)}
            className={cn(
              "h-10 border-[#d9d9df] p-3 text-sm text-[#222] focus:ring-1 focus:ring-primary-500",
              errors.email && "border-red-500"
            )}
          />
          {errors.email ? (
            <p className="text-xs text-red-500">{errors.email}</p>
          ) : null}
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="phone" className="text-sm font-medium text-[#222]">
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            onBlur={() => validateField("phone")}
            placeholder="Enter your phone number"
            aria-invalid={Boolean(errors.phone)}
            className={cn(
              "h-10 border-[#d9d9df] p-3 text-sm text-[#222] focus:ring-1 focus:ring-primary-500",
              errors.phone && "border-red-500"
            )}
          />
          {errors.phone ? (
            <p className="text-xs text-red-500">{errors.phone}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 sm:mt-4">
        <Label htmlFor="message" className="text-sm font-medium text-[#222]">
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={(event) => updateField("message", event.target.value)}
          onBlur={() => validateField("message")}
          rows={8}
          aria-invalid={Boolean(errors.message)}
          className={cn(
            "min-h-[140px] border-[#d9d9df] px-3 py-2 text-sm text-[#222] focus:ring-1 focus:ring-primary-500",
            errors.message && "border-red-500"
          )}
        />
        {errors.message ? (
          <p className="text-xs text-red-500 sm:text-sm">{errors.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={sending}
        className="mt-4 h-11 w-full rounded-full bg-[#6f4ef6] text-sm font-medium text-white hover:bg-[#6f4ef6] flex items-center gap-2"
      >
        {!sending ? (
          <Mail className="h-4 w-4" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {!sending ? "Send" : "Sending"}
      </Button>

      <p className="mt-3 text-[10px] leading-relaxed text-[#7a7a7a] sm:text-[11px]">
        By continuing, I authorize Zedu to contact me about Zedu&apos;s
        offerings. I understand I can opt out by contacting Zedu.
      </p>
    </form>
  );
};
