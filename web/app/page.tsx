import type { Metadata } from "next";
import Link from "next/link";
import AuthRedirect from "../components/landing/AuthRedirect";
import FAQAccordion from "../components/landing/FAQAccordion";

export const metadata: Metadata = {
  title: "Best Dating App in India | Pookiey - Real Connections",
  description:
    "Pookiey is India's trusted dating app for meaningful connections. Safe platform for casual dating and serious relationships across major Indian cities.",
  keywords: [
    "dating app in India",
    "best dating app in India",
    "dating apps in Bangalore",
    "dating apps in Hyderabad",
    "dating apps in Chennai",
    "dating apps in Delhi",
    "dating apps in Mumbai",
    "dating apps in Pune",
    "dating apps in Kolkata",
    "India dating site",
    "online dating India",
    "casual dating",
    "serious relationships",
  ],
  openGraph: {
    title: "Best Dating App in India | Pookiey - Real Connections",
    description:
      "Pookiey is India's trusted dating app for meaningful connections. Safe platform for casual dating and serious relationships.",
    type: "website",
    locale: "en_IN",
    url: "https://pookiey.com",
    siteName: "Pookiey",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Dating App in India | Pookiey",
    description:
      "Pookiey is India's trusted dating app for meaningful connections.",
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "https://pookiey.com",
      "en-IN": "https://pookiey.com",
    },
  },
};

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pookiey",
    applicationCategory: "DatingApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description:
      "Best dating app in India for real and meaningful connections. Trusted dating platform for casual dating and serious relationships.",
    url: "https://pookiey.com",
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pookiey",
    url: "https://pookiey.com",
    logo: "https://pookiey.com/favicon.ico",
    description:
      "Pookiey is India's trusted dating app for meaningful connections. Safe platform for casual dating and serious relationships.",
    sameAs: [
      "https://www.facebook.com/profile.php?id=61586065021476",
      "https://www.instagram.com/pookiey111/",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["English", "Hindi"],
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Pookiey a safe dating app in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Pookiey is designed with user safety and privacy in mind. It offers secure login, profile control, and protected communication so users can feel comfortable while using the platform.",
        },
      },
      {
        "@type": "Question",
        name: "Who can use the Pookiey dating app?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Any adult aged 18 and above can use Pookiey. It is suitable for students, working professionals, single adults, and people returning to dating. Users from different cities across India can use the platform easily.",
        },
      },
      {
        "@type": "Question",
        name: "Is Pookiey good for serious relationships?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Pookiey supports users who are looking for serious and long-term relationships. It encourages honest profiles and meaningful conversations, which help users build genuine connections.",
        },
      },
      {
        "@type": "Question",
        name: "Can Pookiey be used for casual dating?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Pookiey also supports casual dating. Users can explore connections at their own pace while keeping interactions respectful and clear.",
        },
      },
      {
        "@type": "Question",
        name: "Is Pookiey free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pookiey offers free access to help users get started. Free users can create profiles and explore matches. Premium features are available for users who want additional tools and better visibility.",
        },
      },
      {
        "@type": "Question",
        name: "Does Pookiey work in all Indian cities?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Pookiey supports users across India. Whether you are using dating apps in Bangalore, dating apps in Hyderabad, dating apps in Chennai, dating apps in Delhi, dating apps in Kolkata, or smaller cities, the experience remains consistent.",
        },
      },
    ],
  };

    return (
    <>
      <AuthRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <div className="relative min-h-screen overflow-hidden">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#E94057]/25 blur-3xl md:h-[380px] md:w-[380px]" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#4B164C]/25 blur-3xl md:h-[320px] md:w-[320px]" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#FF7EB3]/20 blur-3xl md:h-[420px] md:w-[420px]" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <span className="pill inline-flex bg-white/60 text-[#E94057] shadow-sm shadow-[#E94057]/10">
              Pookiey
            </span>
            </div>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-5 py-2 text-sm font-semibold text-[#2A1F2D] transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E94057]"
            >
              Sign In
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-12 md:px-8 md:pt-20 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-semibold leading-[1.1] text-[#2A1F2D] md:text-5xl lg:text-6xl">
              Best Dating App in India for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E94057] via-[#FF7EB3] to-[#4B164C]">
                Real & Meaningful Connections
              </span>
            </h1>
            <p className="mt-6 text-base text-[#6F6077] md:text-lg lg:text-xl">
              Finding the best dating app in India is not just about swiping profiles. It is about trust, safety, and real people who are serious about connecting. Pookiey is built to help users find genuine matches simply and securely. Whether you are looking for casual dating or a serious relationship, Pookiey supports both with clarity and honesty.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#E94057] via-[#FF7EB3] to-[#4B164C] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#E94057]/20 transition hover:scale-[1.02] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E94057]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section id="features" className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <span className="pill inline-flex bg-white/60 text-[#E94057] shadow-sm shadow-[#E94057]/10">
                Why Pookiey
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-[#2A1F2D] md:text-4xl">
                Why Choose Pookiey Among Popular Dating Apps in India
              </h2>
              <p className="mt-4 text-base text-[#6F6077] md:text-lg">
                With so many dating apps available today, choosing the right one can be confusing. Every platform promises matches, but not every platform offers trust, safety, and real people. Pookiey is created to solve these common problems and provide a reliable experience for users who are serious about online dating.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Built for Trust */}
              <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#E94057]/40 hover:shadow-2xl hover:shadow-[#E94057]/20 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E94057]/0 to-[#FF7EB3]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E94057] to-[#FF7EB3] text-3xl shadow-lg shadow-[#E94057]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    🔒
                  </div>
                  <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#E94057]">
                    Built for Trust
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#6F6077] md:text-base">
                    Trust is one of the biggest concerns while using any dating site. Pookiey is designed with strong safety and privacy principles so users feel confident from the first step. Secure login system, user privacy protection, clear and honest communication, and transparent subscription handling.
                  </p>
                  {/* Decorative element */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#E94057] to-[#FF7EB3] opacity-30" />
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#E94057] to-[#FF7EB3]" />
                  </div>
                </div>
              </article>

              {/* Simple & Clear */}
              <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#4B164C]/40 hover:shadow-2xl hover:shadow-[#4B164C]/20 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4B164C]/0 to-[#7B1E7A]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4B164C] to-[#7B1E7A] text-3xl shadow-lg shadow-[#4B164C]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    ✨
                  </div>
                  <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#4B164C]">
                    Simple & Clear
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#6F6077] md:text-base">
                    Many top dating apps in India feel complicated, especially for first-time users. Pookiey keeps the experience simple so anyone can use it without technical knowledge. Easy account access, simple profile setup, clear match flow, and smooth navigation.
                  </p>
                  {/* Decorative element */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#4B164C] to-[#7B1E7A] opacity-30" />
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#4B164C] to-[#7B1E7A]" />
                  </div>
                </div>
              </article>

              {/* Quality Matches */}
              <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#FF7EB3]/40 hover:shadow-2xl hover:shadow-[#FF7EB3]/20 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF7EB3]/0 to-[#E94057]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7EB3] to-[#E94057] text-3xl shadow-lg shadow-[#FF7EB3]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    💎
                  </div>
                  <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#FF7EB3]">
                    Quality Matches
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#6F6077] md:text-base">
                    The goal of dating is not just meeting people, but meeting the right people. Pookiey focuses on meaningful connections instead of random swipes. Better conversations, higher match quality, less time wasted, and more genuine connections.
                  </p>
                  {/* Decorative element */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#FF7EB3] to-[#E94057] opacity-30" />
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#FF7EB3] to-[#E94057]" />
                  </div>
                </div>
              </article>

              {/* Flexible Dating */}
              <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#E94057]/40 hover:shadow-2xl hover:shadow-[#E94057]/20 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E94057]/0 to-[#FF7EB3]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E94057] to-[#FF7EB3] text-3xl shadow-lg shadow-[#E94057]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    💑
                  </div>
                  <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#E94057]">
                    Flexible Dating
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#6F6077] md:text-base">
                    Some people use dating apps casually, while others look for long-term relationships. Pookiey supports both without judgment or pressure. Works well for casual dating with respect, serious relationship seekers, honest and open communication, and users who value clarity.
                  </p>
                  {/* Decorative element */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#E94057] to-[#FF7EB3] opacity-30" />
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#E94057] to-[#FF7EB3]" />
                  </div>
                </div>
              </article>

              {/* Transparent Pricing */}
              <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#4B164C]/40 hover:shadow-2xl hover:shadow-[#4B164C]/20 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4B164C]/0 to-[#7B1E7A]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4B164C] to-[#7B1E7A] text-3xl shadow-lg shadow-[#4B164C]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    💰
                  </div>
                  <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#4B164C]">
                    Transparent Pricing
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#6F6077] md:text-base">
                    Many users leave dating apps in India because of confusing payments or unclear plans. Pookiey keeps everything open and easy to understand. Clear subscription information, no hidden charges, easy account control, and simple upgrade or renewal process.
                  </p>
                  {/* Decorative element */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#4B164C] to-[#7B1E7A] opacity-30" />
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#4B164C] to-[#7B1E7A]" />
                  </div>
                </div>
              </article>

              {/* All Indian Cities */}
              <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#FF7EB3]/40 hover:shadow-2xl hover:shadow-[#FF7EB3]/20 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF7EB3]/0 to-[#E94057]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7EB3] to-[#E94057] text-3xl shadow-lg shadow-[#FF7EB3]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    🗺️
                  </div>
                  <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#FF7EB3]">
                    All Indian Cities
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#6F6077] md:text-base">
                    Whether someone is using dating apps in Bangalore, dating apps in Hyderabad, dating app Chennai, or dating apps in Kolkata, the experience remains consistent. Safety standards, usability, and communication quality stay the same everywhere.
                  </p>
                  {/* Decorative element */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#FF7EB3] to-[#E94057] opacity-30" />
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#FF7EB3] to-[#E94057]" />
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <span className="pill inline-flex bg-white/60 text-[#E94057] shadow-sm shadow-[#E94057]/10">
                How It Works
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-[#2A1F2D] md:text-4xl">
                Simple, Safe & Easy to Use
              </h2>
              <p className="mt-4 text-base text-[#6F6077] md:text-lg">
                Many people hesitate to use dating apps in India because they think the process is complicated. Pookiey is designed to be simple, clear, and easy for everyone. From the first login to starting conversations, every step is smooth and user-friendly.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <article className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#E94057] to-[#FF7EB3] text-2xl font-bold text-white shadow-lg">
                  1
                </div>
                <h3 className="text-lg font-semibold text-[#2A1F2D]">
                  Create Account
                </h3>
                <p className="mt-2 text-sm text-[#6F6077]">
                  Users can sign up quickly using a secure login method. The process is safe and protects user privacy from the beginning. Fast account creation, secure access, and no unnecessary information.
                </p>
              </article>

              <article className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7EB3] to-[#4B164C] text-2xl font-bold text-white shadow-lg">
                  2
                </div>
                <h3 className="text-lg font-semibold text-[#2A1F2D]">
                  Set Up Profile
                </h3>
                <p className="mt-2 text-sm text-[#6F6077]">
                  Creating a profile on Pookiey is simple and does not take much time. Users can share basic details that help find better matches. Profile setup includes basic personal details, interests and preferences, and clear profile visibility controls.
                </p>
              </article>

              <article className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#4B164C] to-[#E94057] text-2xl font-bold text-white shadow-lg">
                  3
              </div>
                <h3 className="text-lg font-semibold text-[#2A1F2D]">
                  Discover Matches
                </h3>
                <p className="mt-2 text-sm text-[#6F6077]">
                  Once the profile is ready, users can start exploring matches. Pookiey focuses on meaningful connections instead of random suggestions. Matches based on preferences, better relevance, and less unnecessary scrolling.
                </p>
              </article>

              <article className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#E94057] via-[#FF7EB3] to-[#4B164C] text-2xl font-bold text-white shadow-lg">
                  4
              </div>
                <h3 className="text-lg font-semibold text-[#2A1F2D]">
                  Start Conversations
                </h3>
                <p className="mt-2 text-sm text-[#6F6077]">
                  Communication is an important part of any Indian dating site. Pookiey offers a safe and controlled environment for users to talk comfortably. Secure messaging, user control over conversations, and respectful interaction environment.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="pill inline-flex bg-white/60 text-[#E94057] shadow-sm shadow-[#E94057]/10">
                About Us
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-[#2A1F2D] md:text-4xl">
                About Pookiey
              </h2>
              <p className="mt-4 text-base text-[#6F6077] md:text-lg">
                Discover what makes Pookiey the trusted choice for meaningful connections in India
              </p>
            </div>

            <div className="mt-12 space-y-6">
              {/* Grid Layout for All Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Introduction Card */}
                <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#E94057]/40 hover:shadow-2xl hover:shadow-[#E94057]/20 md:p-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E94057]/0 to-[#FF7EB3]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#E94057] to-[#FF7EB3] text-2xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        💕
                      </div>
                      <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#E94057]">
                        About Pookiey
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-[#6F6077] md:text-base">
                      Pookiey is a modern online dating platform created for people who want real, safe, and meaningful connections. We understand that online dating is not just about matching profiles. It is about trust, comfort, and feeling confident while meeting new people. That is why Pookiey is built with a strong focus on safety, simplicity, and honesty.
                    </p>
                    {/* Decorative element */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#E94057] to-[#FF7EB3] opacity-30" />
                      <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#E94057] to-[#FF7EB3]" />
                    </div>
                  </div>
                </article>

                {/* Goal Card */}
                <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#4B164C]/40 hover:shadow-2xl hover:shadow-[#4B164C]/20 md:p-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4B164C]/0 to-[#7B1E7A]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4B164C] to-[#7B1E7A] text-2xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        🎯
                      </div>
                      <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#4B164C]">
                        Our Goal
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-[#6F6077] md:text-base">
                      In today's time, many dating apps in India feel confusing or unreliable. Our goal is to offer a clean and dependable experience where users can focus on conversations and connections instead of worrying about privacy or fake interactions. Pookiey is designed for both casual dating and serious relationships, giving users the freedom to choose their own path.
                    </p>
                    {/* Decorative element */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#4B164C] to-[#7B1E7A] opacity-30" />
                      <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#4B164C] to-[#7B1E7A]" />
                    </div>
                  </div>
                </article>

                {/* Values Card */}
                <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#FF7EB3]/40 hover:shadow-2xl hover:shadow-[#FF7EB3]/20 md:p-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF7EB3]/0 to-[#E94057]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7EB3] to-[#E94057] text-2xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        ✨
                      </div>
                      <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#FF7EB3]">
                        Our Values
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-[#6F6077] md:text-base">
                      We believe that every user deserves respect and control. From profile creation to communication, Pookiey allows users to manage their experience in a way that feels comfortable. We avoid unnecessary features and focus on what truly matters—helping people connect genuinely.
                    </p>
                    {/* Decorative element */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#FF7EB3] to-[#E94057] opacity-30" />
                      <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#FF7EB3] to-[#E94057]" />
                    </div>
                  </div>
                </article>

                {/* Built for Indian Users */}
                <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#E94057]/40 hover:shadow-2xl hover:shadow-[#E94057]/20 md:p-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E94057]/0 to-[#FF7EB3]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#E94057] to-[#FF7EB3] text-2xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        🏙️
                      </div>
                      <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#E94057]">
                        Built for Indian Users
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-[#6F6077] md:text-base">
                      Pookiey is built for Indian users from all cities and backgrounds. Whether someone is exploring dating apps in Bangalore, dating apps in Hyderabad, dating apps in Chennai, dating apps in Delhi, or smaller cities, the experience remains simple and consistent. Our platform supports local connections while maintaining the same safety and quality standards everywhere.
                    </p>
                    {/* Decorative element */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#E94057] to-[#FF7EB3] opacity-30" />
                      <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#E94057] to-[#FF7EB3]" />
                    </div>
                  </div>
                </article>

                {/* Transparency & Trust */}
                <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-[#FCF3FA]/80 to-white/90 p-6 shadow-lg backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#4B164C]/40 hover:shadow-2xl hover:shadow-[#4B164C]/20 md:p-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4B164C]/0 to-[#7B1E7A]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4B164C] to-[#7B1E7A] text-2xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        🔐
                      </div>
                      <h3 className="text-xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#4B164C]">
                        Transparency & Trust
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-[#6F6077] md:text-base">
                      Transparency is an important part of who we are. We keep our processes clear, our communication honest, and our platform easy to understand. Users always know how things work, what they are signing up for, and how to manage their accounts. This approach helps us build long-term trust with our community.
                    </p>
                    {/* Decorative element */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#4B164C] to-[#7B1E7A] opacity-30" />
                      <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#4B164C] to-[#7B1E7A]" />
                    </div>
                  </div>
                </article>
              </div>

              {/* Mission Card - Full Width */}
              <article className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-[#E94057]/10 via-[#FF7EB3]/10 to-[#4B164C]/10 p-6 shadow-xl backdrop-blur-lg transition-all duration-500 hover:-translate-y-1 hover:border-[#E94057]/60 hover:shadow-2xl hover:shadow-[#E94057]/30 md:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E94057]/5 via-[#FF7EB3]/5 to-[#4B164C]/5 opacity-50" />
                <div className="relative">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E94057] via-[#FF7EB3] to-[#4B164C] text-4xl shadow-xl shadow-[#E94057]/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                      🚀
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-[#2A1F2D] transition-colors group-hover:text-[#E94057] md:text-3xl">
                        Our Mission
                      </h3>
                      <div className="mt-1 h-1 w-16 rounded-full bg-gradient-to-r from-[#E94057] to-[#FF7EB3]" />
                    </div>
                  </div>
                  <p className="text-base leading-relaxed text-[#6F6077] md:text-lg">
                    At Pookiey, we are focused on creating a respectful and reliable India dating site where people can take their time, be themselves, and build connections naturally. We are committed to improving the online dating experience by listening to users and putting their comfort first. Our mission is simple: to provide a trusted dating platform where real people can meet, talk, and build connections with confidence.
                  </p>
                  {/* Decorative elements */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#E94057] via-[#FF7EB3] to-[#4B164C] opacity-40" />
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#E94057] to-[#FF7EB3]" />
                      <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#FF7EB3] to-[#4B164C]" />
                      <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#4B164C] to-[#E94057]" />
                    </div>
                    <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#E94057] via-[#FF7EB3] to-[#4B164C] opacity-40" />
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Cities Section */}
        <section id="cities" className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <span className="pill inline-flex bg-white/60 text-[#E94057] shadow-sm shadow-[#E94057]/10">
                Available Cities
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-[#2A1F2D] md:text-4xl">
                Best Dating App Across Major Indian Cities
              </h2>
              <p className="mt-4 text-base text-[#6F6077] md:text-lg">
                Online dating in India is growing fast, and people from different cities have different dating needs. Pookiey is built to support users across metro cities, IT hubs, education centers, and culturally rich regions. No matter where you live, the platform helps you connect with nearby people safely and simply.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <article className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-[#2A1F2D]">
                  Best Dating App in Bangalore
                </h3>
                <p className="mt-2 text-sm text-[#6F6077]">
                  Suitable for professionals and students. Supports casual dating and serious relationships. Easy to use after long workdays.
                </p>
              </article>

              <article className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-[#2A1F2D]">
                  Best Dating App in Hyderabad
                </h3>
                <p className="mt-2 text-sm text-[#6F6077]">
                  Simple and quick profile setup. Focus on genuine user interactions. Clear communication features.
                </p>
              </article>

              <article className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-[#2A1F2D]">
                  Best Dating App in Chennai
                </h3>
                <p className="mt-2 text-sm text-[#6F6077]">
                  Strong privacy controls. Safe and respectful messaging. Support for long-term dating goals.
                </p>
              </article>

              <article className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-[#2A1F2D]">
                  Best Dating App in Delhi
                </h3>
                <p className="mt-2 text-sm text-[#6F6077]">
                  Supports different dating intentions. Helps users connect with nearby people. Keeps personal data protected.
                </p>
              </article>

              <article className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-[#2A1F2D]">
                  Best Dating App in Mumbai
                </h3>
                <p className="mt-2 text-sm text-[#6F6077]">
                  Supports flexible dating styles. Helps users meet nearby people. Offers a smooth and simple interface.
                </p>
              </article>

              <article className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-[#2A1F2D]">
                  Best Dating App in Pune
                </h3>
                <p className="mt-2 text-sm text-[#6F6077]">
                  Easy profile creation. Location-based matches. Smooth and secure chatting.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <span className="pill inline-flex bg-white/60 text-[#E94057] shadow-sm shadow-[#E94057]/10">
                FAQs
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-[#2A1F2D] md:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-base text-[#6F6077] md:text-lg">
                Got questions? We've got answers. Everything you need to know about Pookiey.
              </p>
            </div>

            <div className="mt-12">
              <FAQAccordion />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="glass-card rounded-3xl p-8 text-center md:p-12">
              <h2 className="text-3xl font-semibold text-[#2A1F2D] md:text-4xl">
                Start Your Dating Journey with Confidence
              </h2>
              <p className="mt-4 text-base text-[#6F6077] md:text-lg">
                If you are tired of unreliable dating apps in India and want a platform that values trust, clarity, and genuine connections, Pookiey is the right place to start. It is built for real people, real conversations, and real relationships.
              </p>
              <div className="mt-8">
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#E94057] via-[#FF7EB3] to-[#4B164C] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#E94057]/20 transition hover:scale-[1.02] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E94057]"
                >
                  Get Started Now
                </Link>
        </div>
      </div>
    </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/40 bg-white/40 backdrop-blur">
          <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8 lg:px-12">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-2">
                <span className="pill inline-flex bg-[#E94057]/10 text-[#E94057]">
                  Pookiey
                </span>
              </div>
              <nav className="flex flex-wrap items-center gap-6 text-sm text-[#6F6077]">
                <Link
                  href="/privacy-policy"
                  className="transition hover:text-[#E94057]"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/support"
                  className="transition hover:text-[#E94057]"
                >
                  Support
                </Link>
                <Link
                  href="#about"
                  className="transition hover:text-[#E94057]"
                >
                  About Us
                </Link>
                <Link
                  href="#faq"
                  className="transition hover:text-[#E94057]"
                >
                  FAQ
                </Link>
              </nav>
            </div>
            <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <div className="flex items-center gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61586065021476"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-[#6F6077] transition hover:bg-white/80 hover:text-[#E94057]"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/pookiey111/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-[#6F6077] transition hover:bg-white/80 hover:text-[#E94057]"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
              <p className="text-center text-xs text-[#B49CC4] md:text-sm">
                © {new Date().getFullYear()} Pookiey. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
