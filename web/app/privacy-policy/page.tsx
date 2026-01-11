"use client";

// Privacy Policy data from en.json (lines 300-330)
const privacyPolicyData = {
  title: "Privacy Policy",
  lastUpdated: "Last Updated",
  intro: "At Pookiey, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our dating application.",
  section1Title: "1. Information We Collect",
  section1Content: "We collect information that you provide directly to us, including:",
  section1Point1: "Profile information (name, age, photos, bio, interests, location)",
  section1Point2: "Account credentials (email address, password)",
  section1Point3: "Communication data (messages, voice notes, photos shared within the app)",
  section1Point4: "Usage data (how you interact with the app, features you use)",
  section2Title: "2. How We Use Your Information",
  section2Content: "We use the information we collect to provide, maintain, and improve our services, including matching you with potential partners, facilitating communication, and personalizing your experience. We also use your information to send you notifications, respond to your inquiries, and ensure the safety and security of our platform.",
  section3Title: "3. Information Sharing and Disclosure",
  section3Content: "We do not sell your personal information. We may share your information in the following circumstances:",
  section3Point1: "With other users as part of the matching and communication features",
  section3Point2: "With service providers who assist us in operating our platform (subject to confidentiality agreements)",
  section3Point3: "When required by law or to protect our rights and the safety of our users",
  section4Title: "4. Location Information",
  section4Content: "We collect location information to help you find matches nearby. You can control location sharing through your device settings. We use location data only to provide location-based matching and do not share your precise location with other users.",
  section5Title: "5. Data Security",
  section5Content: "Your data security is our top priority. All your personal information and data are stored securely on Indian servers, ensuring complete protection and compliance with Indian data protection regulations. We implement state-of-the-art technical and organizational measures including encryption, secure data transmission, and regular security audits to safeguard your information against unauthorized access, alteration, disclosure, or destruction. Your data is totally safe with us and we do not share your personal information with anyone, except as explicitly stated in this policy for the purpose of providing our matching and communication services within the app.",
  section6Title: "6. Your Rights and Choices",
  section6Content: "You have the right to access, update, or delete your personal information at any time through your account settings. You can also opt out of certain communications and control your privacy settings within the app.",
  section7Title: "7. Children's Privacy",
  section7Content: "Our services are intended for users who are 18 years of age or older. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.",
  section8Title: "8. Changes to This Privacy Policy",
  section8Content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date. You are advised to review this Privacy Policy periodically for any changes.",
  contactTitle: "Contact Us",
  contactContent: "If you have any questions about this Privacy Policy or our privacy practices, please contact us at:",
  email: "Email",
  footer: "By using Pookiey, you acknowledge that you have read and understood this Privacy Policy.",
};

// Section icons mapping
const sectionIcons = {
  1: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  2: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  3: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  4: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  5: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  6: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  7: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  8: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function PrivacyPolicyPage() {
  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-[#fdf5f7] to-white">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#E94057]/10 blur-3xl md:h-[380px] md:w-[380px]" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#4B164C]/10 blur-3xl md:h-[320px] md:w-[320px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#FF7EB3]/10 blur-3xl md:h-[420px] md:w-[420px]" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-6 py-12 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#E94057] to-[#FF7EB3] mb-6 shadow-lg shadow-[#E94057]/25">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold leading-tight text-[#2A1F2D] md:text-6xl mb-4">
            {privacyPolicyData.title}
          </h1>
          
        </div>

        {/* Introduction Card */}
        <div className="mb-12 rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 to-white/70 p-8 shadow-xl shadow-[#E94057]/10 backdrop-blur md:p-10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E94057] to-[#FF7EB3] flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg leading-relaxed text-[#2A1F2D] md:text-xl">
              {privacyPolicyData.intro}
            </p>
          </div>
        </div>

        {/* Privacy Policy Sections */}
        <div className="space-y-8 mb-12">
          {/* Section 1 */}
          <div className="group rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lg shadow-[#4B164C]/5 backdrop-blur transition-all hover:shadow-xl hover:shadow-[#4B164C]/10 md:p-10">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E94057]/10 to-[#FF7EB3]/10 flex items-center justify-center text-[#E94057] group-hover:scale-110 transition-transform">
                {sectionIcons[1]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#2A1F2D] mb-4 md:text-3xl">
                  {privacyPolicyData.section1Title}
                </h2>
                <p className="text-base text-[#6F6077] mb-6 leading-relaxed">
                  {privacyPolicyData.section1Content}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    privacyPolicyData.section1Point1,
                    privacyPolicyData.section1Point2,
                    privacyPolicyData.section1Point3,
                    privacyPolicyData.section1Point4,
                  ].map((point, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-white/60 border border-white/60">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E94057]/10 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#E94057]" />
                      </div>
                      <p className="text-sm text-[#2A1F2D] leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="group rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lg shadow-[#4B164C]/5 backdrop-blur transition-all hover:shadow-xl hover:shadow-[#4B164C]/10 md:p-10">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4B164C]/10 to-[#E94057]/10 flex items-center justify-center text-[#4B164C] group-hover:scale-110 transition-transform">
                {sectionIcons[2]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#2A1F2D] mb-4 md:text-3xl">
                  {privacyPolicyData.section2Title}
                </h2>
                <p className="text-base leading-relaxed text-[#2A1F2D]">
                  {privacyPolicyData.section2Content}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="group rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lg shadow-[#4B164C]/5 backdrop-blur transition-all hover:shadow-xl hover:shadow-[#4B164C]/10 md:p-10">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF7EB3]/10 to-[#E94057]/10 flex items-center justify-center text-[#FF7EB3] group-hover:scale-110 transition-transform">
                {sectionIcons[3]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#2A1F2D] mb-4 md:text-3xl">
                  {privacyPolicyData.section3Title}
                </h2>
                <p className="text-base text-[#6F6077] mb-6 leading-relaxed">
                  {privacyPolicyData.section3Content}
                </p>
                <div className="space-y-3">
                  {[
                    privacyPolicyData.section3Point1,
                    privacyPolicyData.section3Point2,
                    privacyPolicyData.section3Point3,
                  ].map((point, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-white/60 border border-white/60">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4B164C]/10 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#4B164C]" />
                      </div>
                      <p className="text-sm text-[#2A1F2D] leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="group rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lg shadow-[#4B164C]/5 backdrop-blur transition-all hover:shadow-xl hover:shadow-[#4B164C]/10 md:p-10">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E94057]/10 to-[#4B164C]/10 flex items-center justify-center text-[#E94057] group-hover:scale-110 transition-transform">
                {sectionIcons[4]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#2A1F2D] mb-4 md:text-3xl">
                  {privacyPolicyData.section4Title}
                </h2>
                <p className="text-base leading-relaxed text-[#2A1F2D]">
                  {privacyPolicyData.section4Content}
                </p>
              </div>
            </div>
          </div>

          {/* Section 5 - Highlighted for Data Security */}
          <div className="group rounded-3xl border-2 border-[#E94057]/20 bg-gradient-to-br from-white/90 to-[#E94057]/5 p-8 shadow-xl shadow-[#E94057]/15 backdrop-blur transition-all hover:shadow-2xl hover:shadow-[#E94057]/20 md:p-10">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E94057] to-[#FF7EB3] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                {sectionIcons[5]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#2A1F2D] mb-4 md:text-3xl">
                  {privacyPolicyData.section5Title}
                </h2>
                <p className="text-base leading-relaxed text-[#2A1F2D]">
                  {privacyPolicyData.section5Content}
                </p>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="group rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lg shadow-[#4B164C]/5 backdrop-blur transition-all hover:shadow-xl hover:shadow-[#4B164C]/10 md:p-10">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4B164C]/10 to-[#FF7EB3]/10 flex items-center justify-center text-[#4B164C] group-hover:scale-110 transition-transform">
                {sectionIcons[6]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#2A1F2D] mb-4 md:text-3xl">
                  {privacyPolicyData.section6Title}
                </h2>
                <p className="text-base leading-relaxed text-[#2A1F2D]">
                  {privacyPolicyData.section6Content}
                </p>
              </div>
            </div>
          </div>

          {/* Section 7 */}
          <div className="group rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lg shadow-[#4B164C]/5 backdrop-blur transition-all hover:shadow-xl hover:shadow-[#4B164C]/10 md:p-10">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF7EB3]/10 to-[#E94057]/10 flex items-center justify-center text-[#FF7EB3] group-hover:scale-110 transition-transform">
                {sectionIcons[7]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#2A1F2D] mb-4 md:text-3xl">
                  {privacyPolicyData.section7Title}
                </h2>
                <p className="text-base leading-relaxed text-[#2A1F2D]">
                  {privacyPolicyData.section7Content}
                </p>
              </div>
            </div>
          </div>

          {/* Section 8 */}
          <div className="group rounded-3xl border border-white/60 bg-white/70 p-8 shadow-lg shadow-[#4B164C]/5 backdrop-blur transition-all hover:shadow-xl hover:shadow-[#4B164C]/10 md:p-10">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E94057]/10 to-[#4B164C]/10 flex items-center justify-center text-[#E94057] group-hover:scale-110 transition-transform">
                {sectionIcons[8]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#2A1F2D] mb-4 md:text-3xl">
                  {privacyPolicyData.section8Title}
                </h2>
                <p className="text-base leading-relaxed text-[#2A1F2D]">
                  {privacyPolicyData.section8Content}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 to-white/70 p-8 shadow-xl shadow-[#E94057]/10 backdrop-blur md:p-10 mb-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E94057] to-[#FF7EB3] flex items-center justify-center text-white shadow-lg">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#2A1F2D] mb-4 md:text-3xl">
                {privacyPolicyData.contactTitle}
              </h2>
              <p className="text-base text-[#6F6077] mb-6 leading-relaxed">
                {privacyPolicyData.contactContent}
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/80 border border-white/60 shadow-sm hover:shadow-md transition-all">
                <svg className="h-5 w-5 text-[#E94057]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-[#2A1F2D]">{privacyPolicyData.email}:</span>
                <a href="mailto:privacy@pookiey.com" className="text-[#E94057] hover:text-[#C3344C] font-medium transition-colors">
                  privacy@pookiey.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-md backdrop-blur md:p-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E94057] to-[#FF7EB3] flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-base text-[#6F6077] md:text-lg leading-relaxed max-w-2xl mx-auto">
            {privacyPolicyData.footer}
          </p>
        </div>
      </div>
    </div>
  );
}
