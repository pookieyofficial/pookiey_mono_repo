"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { callBackend } from "../../lib/api";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    premium: number;
    newToday: number;
  };
  interactions: {
    likesToday: number;
    matchesToday: number;
    messagesToday: number;
  };
  moderation: {
    activeReports: number;
  };
}

export default function AdminDashboard() {
  const supabase = useSupabaseClient();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await callBackend<DashboardStats>(
          supabase,
          "/api/v1/admin/dashboard",
          { method: "GET" }
        );
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#6F6077]">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const StatCard = ({
    title,
    value,
    icon,
    gradient,
  }: {
    title: string;
    value: number;
    icon: string;
    gradient: string;
  }) => (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <div className={`h-12 w-12 rounded-xl ${gradient} opacity-20`} />
      </div>
      <h3 className="text-sm font-medium text-[#6F6077] mb-1">{title}</h3>
      <p className="text-3xl font-bold text-[#2A1F2D]">{value.toLocaleString()}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[#2A1F2D] mb-2">Admin Dashboard</h1>
        <p className="text-[#6F6077]">Overview of your app's key metrics</p>
      </div>

      {/* Core Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#6F6077] mb-2">Who is using my app?</h3>
          <p className="text-2xl font-bold text-[#E94057]">{stats.users.total.toLocaleString()}</p>
          <p className="text-xs text-[#6F6077] mt-1">Total Users</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#6F6077] mb-2">How are they interacting?</h3>
          <p className="text-2xl font-bold text-[#E94057]">
            {stats.interactions.likesToday + stats.interactions.matchesToday}
          </p>
          <p className="text-xs text-[#6F6077] mt-1">Today's Activity</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#6F6077] mb-2">Where are they coming from?</h3>
          <p className="text-2xl font-bold text-[#E94057]">{stats.users.active}</p>
          <p className="text-xs text-[#6F6077] mt-1">Active Users (7d)</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#6F6077] mb-2">Who is making me money?</h3>
          <p className="text-2xl font-bold text-[#E94057]">{stats.users.premium}</p>
          <p className="text-xs text-[#6F6077] mt-1">Premium Users</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-semibold text-[#2A1F2D] mb-6">Today's Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="New Users"
            value={stats.users.newToday}
            icon="👤"
            gradient="bg-gradient-to-br from-[#E94057] to-[#FF7EB3]"
          />
          <StatCard
            title="Likes Sent"
            value={stats.interactions.likesToday}
            icon="❤️"
            gradient="bg-gradient-to-br from-[#E94057] to-[#4B164C]"
          />
          <StatCard
            title="Matches"
            value={stats.interactions.matchesToday}
            icon="💕"
            gradient="bg-gradient-to-br from-[#FF7EB3] to-[#E94057]"
          />
          <StatCard
            title="Messages"
            value={stats.interactions.messagesToday}
            icon="💬"
            gradient="bg-gradient-to-br from-[#4B164C] to-[#E94057]"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[#2A1F2D] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="rounded-xl bg-[#E94057]/10 px-4 py-3 text-center text-sm font-medium text-[#E94057] hover:bg-[#E94057]/20 transition-all"
          >
            View All Users
          </a>
          <a
            href="/admin/reports"
            className="rounded-xl bg-red-100 px-4 py-3 text-center text-sm font-medium text-red-600 hover:bg-red-200 transition-all"
          >
            Review Reports ({stats.moderation.activeReports})
          </a>
          <a
            href="/admin/payments"
            className="rounded-xl bg-green-100 px-4 py-3 text-center text-sm font-medium text-green-600 hover:bg-green-200 transition-all"
          >
            Premium Users
          </a>
          <a
            href="/admin/interactions"
            className="rounded-xl bg-blue-100 px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-200 transition-all"
          >
            View Interactions
          </a>
        </div>
      </div>
    </div>
  );
}
