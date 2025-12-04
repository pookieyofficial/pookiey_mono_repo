"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function LoginForm() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    const message = errorDescription || errorParam;

    if (message) {
      setError(message);
      if (errorParam) {
        url.searchParams.delete("error");
      }
      if (errorDescription) {
        url.searchParams.delete("error_description");
      }
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (authError) {
        throw authError;
      }
    } catch (authError) {
      if (authError instanceof Error) {
        setError(authError.message);
      } else {
        setError("Google sign-in failed.");
      }
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }

    setOtpLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: trimmed,
      });

      if (authError) {
        throw authError;
      }

      setOtpSent(true);
    } catch (authError) {
      if (authError instanceof Error) {
        setError(authError.message);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail || !trimmedOtp) {
      setError("Enter both email and OTP.");
      return;
    }

    setOtpLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedOtp,
        type: "email",
      });

      if (verifyError) {
        throw verifyError;
      }

      // Session will be set by Supabase; page will re-render with logged-in state.
    } catch (verifyError) {
      if (verifyError instanceof Error) {
        setError(verifyError.message);
      } else {
        setError("OTP verification failed. Please try again.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="glass-card w-full max-w-lg rounded-3xl px-8 py-10">
      <div className="space-y-4 text-center">
        <span className="pill inline-flex bg-[rgba(233,64,87,0.12)] text-[#E94057]">
          Premium access
        </span>
        <h2 className="text-3xl font-semibold leading-[1.15] text-[#2A1F2D] md:text-4xl">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E94057] to-[#FF7EB3]">
            Pookiey
          </span>
        </h2>
        <p className="text-sm text-[#6F6077] md:text-base">
          Continue with Google or email OTP to manage your subscription and
          unlock adorable experiences tailored to your vibe.
        </p>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm font-medium text-[#C3344C]">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#111827] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#111827]/20 transition hover:translate-y-[-1px] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E94057] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.35 11.1H12.18V13.71H18.62C18.33 15.29 16.79 18 12.18 18C8.36 18 5.26 14.87 5.26 11C5.26 7.13 8.36 4 12.18 4C14.33 4 15.78 4.92 16.61 5.71L18.64 3.75C16.98 2.15 14.77 1 12.18 1C6.74 1 2.34 5.42 2.34 10.86C2.34 16.3 6.74 20.72 12.18 20.72C18.02 20.72 21.66 16.65 21.66 11.36C21.66 10.7 21.56 10.2 21.35 9.62V11.1Z"
              fill="#EA4335"
            />
          </svg>
        </span>
        {loading ? "Redirecting to Google..." : "Continue with Google"}
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-[#B49CC4]">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E5D7F0] to-transparent" />
        <span className="uppercase tracking-[0.2em]">
          or continue with email OTP
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E5D7F0] to-transparent" />
      </div>

      <div className="space-y-3">
        <label className="block text-left text-xs font-medium text-[#6F6077]">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-2xl border border-[#E3D7F1] bg-white/80 px-3 py-2 text-sm text-[#2A1F2D] placeholder:text-[#C0AECF] focus:border-[#E94057] focus:outline-none focus:ring-2 focus:ring-[#E94057]/20"
          />
        </label>

        {otpSent && (
          <label className="block text-left text-xs font-medium text-[#6F6077]">
            Enter OTP
            <input
              type="text"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="mt-1 w-full rounded-2xl border border-[#E3D7F1] bg-white/80 px-3 py-2 text-sm text-[#2A1F2D] placeholder:text-[#C0AECF] focus:border-[#E94057] focus:outline-none focus:ring-2 focus:ring-[#E94057]/20"
            />
          </label>
        )}

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={otpSent ? handleVerifyOtp : handleSendOtp}
            disabled={otpLoading}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#E3D7F1] bg-white px-4 py-3 text-sm font-semibold text-[#2A1F2D] shadow-sm transition hover:bg-[#F9F5FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E94057] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {otpLoading
              ? otpSent
                ? "Verifying..."
                : "Sending..."
              : otpSent
                ? "Verify OTP"
                : "Send OTP"}
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-3 text-left text-xs text-[#9383A3] md:text-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E94057]/10 text-[#E94057]">
            ✨
          </span>
          <p className="font-medium text-[#6F6077]">
            See who’s crushing on you and get weekly boosts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#4B164C]/10 text-[#4B164C]">
            💌
          </span>
          <p className="font-medium text-[#6F6077]">
            Priority messaging with read receipts and fun reactions.
          </p>
        </div>
      </div>
    </div>
  );
}

