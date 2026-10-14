"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { PostRequest } from "~/utils/new-request";
import { useRouter } from "next/navigation";

const DeletionRequestForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    reason: "",
    additional_info: "",
  });

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const isFormValid =
    formData.fullname.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.reason !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("Please fill in all required fields with valid information");
      return;
    }

    setLoading(true);

    const res = await PostRequest("/account/delete-account", formData);
    if (res.status === 200 || res.status === 201) {
      setSubmitted(true);
      router.push("/");
      setFormData({
        fullname: "",
        email: "",
        reason: "",
        additional_info: "",
      });
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Request Submitted Successfully
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Thank you for submitting your account deletion request. We've sent
              a confirmation email to verify your identity. Please check your
              inbox and follow the instructions to proceed.
            </p>
            <p className="text-sm text-gray-600 mb-8">
              If you don't receive an email within 10 minutes, please check your
              spam folder or contact our support team.
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Submit Another Request
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-full mb-6">
            <Mail className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-900">
              Deletion Request
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Request Account Deletion
          </h2>
          <p className="text-lg text-gray-600">
            Fill out the form below to submit your account deletion request. All
            fields marked with * are required.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200"
        >
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div className="mb-6">
            <label
              htmlFor="fullname"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              required
            />
            <p className="mt-2 text-xs text-gray-600">
              Use the email address associated with your Zedu account
            </p>
          </div>

          {/* Reason Field */}
          <div className="mb-6">
            <label
              htmlFor="reason"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Reason for Deletion <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Select a reason</option>
              <option value="privacy_concerns">Privacy Concerns</option>
              <option value="not_using">No Longer Using the Service</option>
              <option value="found_alternative">Found an Alternative</option>
              <option value="too_expensive">Too Expensive</option>
              <option value="technical_issues">Technical Issues</option>
              <option value="security_concerns">Security Concerns</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Additional Info Field */}
          <div className="mb-8">
            <label
              htmlFor="additionalInfo"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Additional Information (Optional)
            </label>
            <Textarea
              id="additionalInfo"
              name="additional_info"
              value={formData.additional_info}
              onChange={handleChange}
              placeholder="Please provide any additional details about your deletion request..."
              className="min-h-[120px] border-gray-300 focus:border-purple-500 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Important Notice */}
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Before You Continue
            </h4>
            <ul className="space-y-1 text-sm text-amber-800 ml-7">
              <li>
                • This action is permanent and cannot be undone after 30 days
              </li>
              <li>• You will lose access to all your data and content</li>
              <li>• Any active subscriptions will be cancelled</li>
              <li>
                • You will receive a confirmation email to verify this request
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Deletion Request
              </>
            )}
          </Button>

          <p className="mt-4 text-xs text-center text-gray-600">
            By submitting this form, you confirm that you want to permanently
            delete your Zedu account
          </p>
        </form>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help or have questions?{" "}
            <a
              href="mailto:support@zedu.chat"
              className="text-purple-600 font-semibold hover:text-purple-700 underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default DeletionRequestForm;
