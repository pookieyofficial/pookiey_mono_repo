"use client";

import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import LoginForm from "../components/auth/LoginForm";
import SubscriptionDashboard from "../components/dashboard/SubscriptionDashboard";
import { callBackend } from "../lib/api";

export default function HomePage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      if (!session) {
        setSyncError(null);
        return;
      }
      setSyncing(true);
      try {
        await callBackend(supabase, "/api/v1/user/me", {
          method: "POST",
          jsonBody: {},
        });
        if (isMounted) {
          setSyncError(null);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message ?? "Failed to sync user profile."
            : "Failed to sync user profile.";
        if (isMounted) {
          setSyncError(message);
        }
      } finally {
        if (isMounted) {
          setSyncing(false);
        }
      }
    };

    void syncUser();

    return () => {
      isMounted = false;
    };
  }, [session, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#E94057]/25 blur-3xl md:h-[380px] md:w-[380px]" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#4B164C]/25 blur-3xl md:h-[320px] md:w-[320px]" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#FF7EB3]/20 blur-3xl md:h-[420px] md:w-[420px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-16 md:flex-row md:items-center md:gap-20 md:px-8 lg:px-12">
          <div className="max-w-xl space-y-6 text-center md:text-left">
            <span className="pill inline-flex bg-white/60 text-[#E94057] shadow-sm shadow-[#E94057]/10">
              Pookiey
            </span>
            <h1 className="text-4xl font-semibold leading-[1.1] text-[#2A1F2D] md:text-5xl">
              Your vibe deserves an{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E94057] via-[#FF7EB3] to-[#4B164C]">
                unforgettable match
              </span>
            </h1>
            <p className="text-base text-[#6F6077] md:text-lg">
              Upgrade to premium, get curated boosts, and keep the chemistry
              flowing across the Pookiey universe. Sign in with Google to manage
              your subscription in seconds.
            </p>
            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-left shadow-md shadow-[#E94057]/10 backdrop-blur">
                <p className="text-sm font-semibold text-[#E94057]">Priority vibes</p>
                <p className="mt-1 text-sm text-[#6F6077]">
                  Stay on top with weekly spotlight boosts and priority matches.
                </p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-left shadow-md shadow-[#4B164C]/10 backdrop-blur">
                <p className="text-sm font-semibold text-[#4B164C]">Control center</p>
                <p className="mt-1 text-sm text-[#6F6077]">
                  View payment history, manage renewals, and adjust plans anytime.
                </p>
              </div>
            </div>
          </div>

          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="relative overflow-hidden">
        <header className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-10 pb-6 md:px-8 lg:px-12">
          <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-r from-[#E94057] via-[#FF7EB3] to-[#4B164C] px-6 py-8 text-white shadow-2xl shadow-[#E94057]/20 md:flex-row md:items-center md:justify-between md:px-10 md:py-12">
            <div className="max-w-xl space-y-3">
              <span className="pill inline-flex bg-white/25 text-white">
                Subscription Center
              </span>
              <h1 className="text-3xl font-semibold leading-[1.1] md:text-4xl">
                Hey {session.user.email?.split("@")[0] ?? "lover"}, your premium
                perks await ✨
              </h1>
              <p className="text-sm text-white/80 md:text-base">
                Manage plans, check payment history, and stay in control of your
                Pookiey experience.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {syncing && (
                <span className="pill inline-flex bg-white/20 text-white/90">
                  Syncing profile…
                </span>
              )}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </header>
      </div>

      {syncError && (
        <div className="mx-auto mt-6 w-full max-w-6xl px-6 md:px-8 lg:px-12">
          <div className="rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm font-medium text-[#C3344C] shadow-sm">
            {syncError}
          </div>
        </div>
      )}

      <div className="relative z-10 mt-10">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-8 lg:px-12">
          <SubscriptionDashboard />
        </div>
      </div>
    </div>
  );
}
