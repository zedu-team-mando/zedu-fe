"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const DeletionFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How long does it take to delete my account?",
      answer:
        "Once you submit your deletion request and verify it via email, your account will be deactivated immediately. However, your data will be kept in our systems for 30 days as a grace period. After 30 days, all your data will be permanently deleted from our servers.",
    },
    {
      question: "Can I recover my account after deletion?",
      answer:
        "Yes, you have a 30-day grace period during which you can recover your account. Simply log in with your credentials within this period, and your account will be reactivated. After 30 days, permanent deletion occurs and recovery is not possible.",
    },
    {
      question: "What happens to my subscription after account deletion?",
      answer:
        "All active subscriptions will be cancelled immediately upon account deletion. If you're on a paid plan, you won't be charged for the next billing cycle. However, we don't provide refunds for the current billing period unless required by law.",
    },
    {
      question: "Will my messages be deleted from other users' conversations?",
      answer:
        "Your messages in shared conversations will remain visible to other participants but will be anonymized. Your name will be replaced with 'Deleted User' to maintain conversation context while removing your personal information.",
    },
    {
      question: "Do I need to delete my data before deleting my account?",
      answer:
        "No, you don't need to manually delete your data. When you request account deletion, all your personal data, files, messages, and content will be automatically deleted as part of the deletion process. However, you may want to download a copy of your data before deletion if you need it for your records.",
    },
    {
      question: "How do I download my data before deletion?",
      answer:
        "You can request a copy of your data by going to Settings > Privacy > Download Your Data. We'll prepare a comprehensive archive of your account data and send you a download link via email within 48 hours.",
    },
    {
      question: "What data is retained after account deletion?",
      answer:
        "For legal and regulatory compliance, we retain transaction records and billing information for up to 7 years. We also keep anonymized security logs for 90 days for fraud prevention. All other personal data, including profile information, messages, and files, is permanently deleted after the 30-day grace period.",
    },
    {
      question:
        "Can I delete specific data without deleting my entire account?",
      answer:
        "Yes! If you only want to delete certain data types, you can do so from your account settings without deleting your entire account. Go to Settings > Privacy to manage individual data categories like messages, files, or activity history.",
    },
    {
      question: "Is my account deletion GDPR compliant?",
      answer:
        "Yes, our account deletion process is fully compliant with GDPR, CCPA, and other major data protection regulations. We ensure your right to erasure is honored, and all data is deleted within the legally required timeframes.",
    },
    {
      question: "What if I don't receive the verification email?",
      answer:
        "If you don't receive the verification email within 10 minutes, please check your spam folder. If it's still not there, you can request a new verification email or contact our support team at support@zedu.chat for assistance.",
    },
    {
      question: "Will deleting my account affect my team or organisation?",
      answer:
        "If you're a member of an organisation, your departure will be notified to the organisation admins. If you're an organisation owner, you'll need to transfer ownership or delete the organisation before you can delete your personal account. We'll guide you through this process when you submit your deletion request.",
    },
    {
      question:
        "Can I create a new account with the same email after deletion?",
      answer:
        "Yes, after your account is permanently deleted (after the 30-day grace period), you can create a new account using the same email address. However, none of your previous data will be recoverable.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-100 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Common Questions
          </h2>
          <p className="text-lg text-gray-600">
            Find answers to common questions about account deletion
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-purple-600 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 text-center bg-white rounded-xl p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you with any concerns
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@zedu.chat"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Email Support
            </a>
            <a
              href="/contact-sales"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeletionFAQ;
