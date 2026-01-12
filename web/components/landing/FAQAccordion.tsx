"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  icon?: string;
}

const faqs: FAQItem[] = [
  {
    question: "Is Pookiey a safe dating app in India?",
    answer:
      "Yes, Pookiey is designed with user safety and privacy in mind. It offers secure login, profile control, and protected communication so users can feel comfortable while using the platform.",
    icon: "🔒",
  },
  {
    question: "Who can use the Pookiey dating app?",
    answer:
      "Any adult aged 18 and above can use Pookiey. It is suitable for students, working professionals, single adults, and people returning to dating. Users from different cities across India can use the platform easily.",
    icon: "👥",
  },
  {
    question: "Is Pookiey good for serious relationships?",
    answer:
      "Yes, Pookiey supports users who are looking for serious and long-term relationships. It encourages honest profiles and meaningful conversations, which help users build genuine connections.",
    icon: "💍",
  },
  {
    question: "Can Pookiey be used for casual dating?",
    answer:
      "Yes, Pookiey also supports casual dating. Users can explore connections at their own pace while keeping interactions respectful and clear.",
    icon: "💕",
  },
  {
    question: "Is Pookiey free to use?",
    answer:
      "Pookiey offers free access to help users get started. Free users can create profiles and explore matches. Premium features are available for users who want additional tools and better visibility.",
    icon: "💰",
  },
  {
    question: "Are there fake profiles on Pookiey?",
    answer:
      "Pookiey focuses on maintaining a genuine user environment. While no dating platform can guarantee zero fake profiles, strong controls and responsible user practices help reduce such issues.",
    icon: "✅",
  },
  {
    question: "Can I control who contacts me on Pookiey?",
    answer:
      "Yes, users have control over their interactions. You can manage conversations and choose how and when to engage with matches.",
    icon: "🎛️",
  },
  {
    question: "Does Pookiey work in all Indian cities?",
    answer:
      "Yes, Pookiey supports users across India. Whether you are using dating apps in Bangalore, dating apps in Hyderabad, dating apps in Chennai, dating apps in Delhi, dating apps in Kolkata, or smaller cities, the experience remains consistent.",
    icon: "🗺️",
  },
  {
    question: "How is Pookiey different from other dating sites in India?",
    answer:
      "Pookiey focuses on simplicity, transparency, and user trust. It avoids unnecessary features and keeps the dating experience clear and respectful for all users.",
    icon: "✨",
  },
  {
    question: "Is my personal information safe on Pookiey?",
    answer:
      "Yes, user privacy is a priority. Personal information and conversations are protected, and users have control over their profile visibility.",
    icon: "🛡️",
  },
  {
    question: "Can I delete my account anytime?",
    answer:
      "Yes, users can manage or delete their accounts if they choose. Pookiey gives full control to users over their profiles and subscriptions.",
    icon: "🗑️",
  },
  {
    question: "Which type of users prefer Pookiey?",
    answer:
      "Pookiey is used by people who want a calm, safe, and honest dating experience. It is preferred by users who value trust more than random matches.",
    icon: "🌟",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 ${
              isOpen
                ? "border-[#E94057]/60 bg-gradient-to-br from-white via-[#FCF3FA] to-white shadow-2xl shadow-[#E94057]/20"
                : "border-white/60 bg-gradient-to-br from-white/90 via-white/80 to-white/70 shadow-lg hover:border-[#E94057]/40 hover:shadow-xl hover:shadow-[#E94057]/10"
            }`}
          >
            {/* Decorative gradient overlay when open */}
            {isOpen && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#E94057]/5 via-transparent to-[#FF7EB3]/5" />
            )}

            <button
              onClick={() => toggleFAQ(index)}
              className={`relative flex w-full items-center gap-4 p-6 text-left transition-all duration-300 md:p-8 ${
                isOpen
                  ? "bg-gradient-to-r from-[#E94057]/10 via-[#FF7EB3]/5 to-transparent"
                  : "hover:bg-gradient-to-r hover:from-[#E94057]/5 hover:to-[#FF7EB3]/5"
              }`}
              aria-expanded={isOpen}
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 transition-all duration-300 ${
                  isOpen
                    ? "scale-110 rotate-6"
                    : "group-hover:scale-105 group-hover:rotate-3"
                }`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-lg transition-all duration-300 ${
                    isOpen
                      ? "bg-gradient-to-br from-[#E94057] to-[#FF7EB3] scale-110 shadow-[#E94057]/40"
                      : "bg-gradient-to-br from-[#E94057]/20 to-[#FF7EB3]/20 group-hover:from-[#E94057]/30 group-hover:to-[#FF7EB3]/30"
                  }`}
                >
                  {faq.icon}
                </div>
              </div>

              {/* Question */}
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold transition-all duration-300 md:text-xl ${
                    isOpen
                      ? "text-[#E94057] scale-[1.02]"
                      : "text-[#2A1F2D] group-hover:text-[#E94057]"
                  }`}
                >
                  {faq.question}
                </h3>
              </div>

              {/* Collapsible Button */}
              <div className="flex-shrink-0">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 ${
                    isOpen
                      ? "bg-gradient-to-br from-[#E94057] to-[#FF7EB3] rotate-180 shadow-lg shadow-[#E94057]/40 scale-110"
                      : "bg-gradient-to-br from-[#E94057]/20 to-[#FF7EB3]/20 group-hover:from-[#E94057]/40 group-hover:to-[#FF7EB3]/40 group-hover:scale-105"
                  }`}
                >
                  <svg
                    className={`h-6 w-6 transition-colors duration-300 ${
                      isOpen ? "text-white" : "text-[#E94057]"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Answer Section */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="relative border-t border-gradient-to-r from-[#E94057]/20 via-[#FF7EB3]/20 to-transparent">
                <div className="bg-gradient-to-br from-[#FCF3FA]/80 via-white/90 to-white/80 px-6 pb-6 pt-5 md:px-8 md:pb-8 md:pt-6">
                  {/* Decorative line */}
                  <div className="mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-[#E94057] to-[#FF7EB3]" />
                  
                  {/* Answer with engaging styling */}
                  <div className="space-y-3">
                    <p className="text-base leading-relaxed text-[#6F6077] md:text-lg">
                      {faq.answer}
                    </p>
                    
                    {/* Optional decorative element */}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E94057]/30 to-transparent" />
                      <div className="flex h-2 w-2 rounded-full bg-gradient-to-br from-[#E94057] to-[#FF7EB3]" />
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF7EB3]/30 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
