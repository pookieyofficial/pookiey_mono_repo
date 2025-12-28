"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { callBackend } from "../../../lib/api";

interface InteractionStats {
  overall: {
    likesSent: number;
    matches: number;
    messagesSent: number;
  };
  trends: Array<{
    date: string;
    likes: number;
    matches: number;
    messages: number;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function InteractionsPage() {
  const supabase = useSupabaseClient();
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("today");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await callBackend<InteractionStats>(
          supabase,
          `/api/v1/admin/analytics/interactions?filter=${filter}`,
          { method: "GET" }
        );
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        // console.error("Failed to fetch interaction stats:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [supabase, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#6F6077]">Loading interactions...</div>
      </div>
    );
  }

  if (!stats) return null;

  const maxValue = Math.max(
    ...stats.trends.map((t) => Math.max(t.likes, t.matches, t.messages))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#2A1F2D] mb-2">Interactions</h1>
        <p className="text-[#6F6077]">Track how users are engaging with your app</p>
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
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">❤️</span>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#E94057] to-[#FF7EB3] opacity-20" />
          </div>
          <h3 className="text-sm font-medium text-[#6F6077] mb-1">Likes Sent</h3>
          <p className="text-3xl font-bold text-[#2A1F2D]">{stats.overall.likesSent.toLocaleString()}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">💕</span>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF7EB3] to-[#E94057] opacity-20" />
          </div>
          <h3 className="text-sm font-medium text-[#6F6077] mb-1">Matches</h3>
          <p className="text-3xl font-bold text-[#2A1F2D]">{stats.overall.matches.toLocaleString()}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">💬</span>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#4B164C] to-[#E94057] opacity-20" />
          </div>
          <h3 className="text-sm font-medium text-[#6F6077] mb-1">Messages Sent</h3>
          <p className="text-3xl font-bold text-[#2A1F2D]">{stats.overall.messagesSent.toLocaleString()}</p>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[#2A1F2D] mb-6">30-Day Trends</h2>
        <div className="space-y-4">
          {stats.trends.map((trend, idx) => {
            const likesHeight = (trend.likes / maxValue) * 100;
            const matchesHeight = (trend.matches / maxValue) * 100;
            const messagesHeight = (trend.messages / maxValue) * 100;

            return (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1 text-xs text-[#6F6077] text-right pr-4 min-w-[80px]">
                  {new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div className="flex-1 flex items-end gap-1 h-24">
                  <div className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-[#E94057] to-[#FF7EB3] transition-all"
                      style={{ height: `${likesHeight}%` }}
                      title={`Likes: ${trend.likes}`}
                    />
                    <span className="text-xs text-[#6F6077] mt-1">❤️</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-[#FF7EB3] to-[#E94057] transition-all"
                      style={{ height: `${matchesHeight}%` }}
                      title={`Matches: ${trend.matches}`}
                    />
                    <span className="text-xs text-[#6F6077] mt-1">💕</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-[#4B164C] to-[#E94057] transition-all"
                      style={{ height: `${messagesHeight}%` }}
                      title={`Messages: ${trend.messages}`}
                    />
                    <span className="text-xs text-[#6F6077] mt-1">💬</span>
                  </div>
                </div>
                <div className="flex-1 text-xs text-[#6F6077] pl-4 min-w-[100px]">
                  <div>L: {trend.likes}</div>
                  <div>M: {trend.matches}</div>
                  <div>Msg: {trend.messages}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[#2A1F2D] mb-4">Key Insights</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg">📊</span>
            <div>
              <p className="font-medium text-[#2A1F2D]">Engagement Rate</p>
              <p className="text-sm text-[#6F6077]">
                {stats.overall.matches > 0
                  ? ((stats.overall.matches / stats.overall.likesSent) * 100).toFixed(1)
                  : 0}% of likes resulted in matches
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📈</span>
            <div>
              <p className="font-medium text-[#2A1F2D]">Activity Level</p>
              <p className="text-sm text-[#6F6077]">
                {stats.overall.messagesSent > 1000
                  ? "High activity - users are actively engaging"
                  : stats.overall.messagesSent > 500
                  ? "Moderate activity"
                  : "Low activity - consider engagement campaigns"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
