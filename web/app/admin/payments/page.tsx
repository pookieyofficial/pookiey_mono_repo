"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { callBackend } from "../../../lib/api";

interface PremiumUser {
  user_id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  subscription?: {
    status: string;
    plan?: string;
    startDate?: string;
    endDate?: string;
  };
  createdAt: string;
}

interface PremiumStats {
  totalPremiumUsers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  premiumUsers: PremiumUser[];
}

export default function PaymentsPage() {
  const supabase = useSupabaseClient();
  const [stats, setStats] = useState<PremiumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const params = filter !== "all" ? `?filter=${filter}` : "";
        const response = await callBackend<PremiumStats>(
          supabase,
          `/api/v1/admin/premium/stats${params}`,
          { method: "GET" }
        );
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch premium stats:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [supabase, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#6F6077]">Loading premium stats...</div>
      </div>
    );
  }

  if (!stats) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#2A1F2D] mb-2">Payments & Premium</h1>
        <p className="text-[#6F6077]">View premium subscriptions and revenue</p>
      </div>

      {/* Filter */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[#6F6077]">Time Period:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-white/60 bg-white/70 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E94057]"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">👑</span>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#E94057] to-[#FF7EB3] opacity-20" />
          </div>
          <h3 className="text-sm font-medium text-[#6F6077] mb-1">Total Premium Users</h3>
          <p className="text-3xl font-bold text-[#2A1F2D]">{stats.totalPremiumUsers}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">✅</span>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 opacity-20" />
          </div>
          <h3 className="text-sm font-medium text-[#6F6077] mb-1">Active Subscriptions</h3>
          <p className="text-3xl font-bold text-[#2A1F2D]">{stats.activeSubscriptions}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">⏰</span>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-20" />
          </div>
          <h3 className="text-sm font-medium text-[#6F6077] mb-1">Expired Subscriptions</h3>
          <p className="text-3xl font-bold text-[#2A1F2D]">{stats.expiredSubscriptions}</p>
        </div>
      </div>

      {/* Premium Users Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/60">
          <h2 className="text-xl font-semibold text-[#2A1F2D]">Premium Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/50 border-b border-white/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {stats.premiumUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-white/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || user.email}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#E94057]/20 flex items-center justify-center">
                          <span className="text-[#E94057] font-semibold">
                            {(user.displayName || user.email)[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-[#2A1F2D]">
                          {user.displayName || "No name"}
                        </div>
                        <div className="text-sm text-[#6F6077]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="pill bg-[#E94057]/10 text-[#E94057]">
                      {user.subscription?.plan || "Premium"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6F6077]">
                    {formatDate(user.subscription?.startDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6F6077]">
                    {formatDate(user.subscription?.endDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="pill bg-green-100 text-green-700">
                      {user.subscription?.status || "active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
