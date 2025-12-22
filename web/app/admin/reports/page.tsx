"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { callBackend } from "../../../lib/api";

interface Report {
  _id: string;
  reportedBy: {
    user_id: string;
    email: string;
    displayName?: string;
  };
  reportedUser: {
    user_id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
  reason: string;
  createdAt: string;
}

interface ReportCount {
  _id: string;
  count: number;
}

interface ReportsResponse {
  reports: Report[];
  reportCounts: ReportCount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ReportsPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await callBackend<ReportsResponse>(
          supabase,
          `/api/v1/admin/reports?page=${page}&limit=50`,
          { method: "GET" }
        );
        if (response.success && response.data) {
          setData(response.data);
        } else {
          // If not admin, redirect to home
          router.push("/");
        }
      } catch (err) {
        // If API call fails (403 or any error), user is not admin
        console.error("Failed to fetch reports:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    void fetchReports();
  }, [supabase, router, page]);

  const handleModeration = async (
    userId: string,
    action: "warn" | "shadowBan" | "ban",
    reason?: string
  ) => {
    try {
      setActionLoading(userId);
      const response = await callBackend(
        supabase,
        `/api/v1/admin/users/${userId}/moderate`,
        {
          method: "PATCH",
          jsonBody: { action, reason },
        }
      );
      if (response.success) {
        // Refresh reports
        const refreshResponse = await callBackend<ReportsResponse>(
          supabase,
          `/api/v1/admin/reports?page=${page}&limit=50`,
          { method: "GET" }
        );
        if (refreshResponse.success && refreshResponse.data) {
          setData(refreshResponse.data);
        } else {
          // If not admin anymore, redirect
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Failed to moderate user:", err);
      // If 403 or auth error, redirect to home
      if (err instanceof Error && err.message.includes("Forbidden")) {
        router.push("/");
      } else {
        alert(err instanceof Error ? err.message : "Failed to moderate user");
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#6F6077]">Loading reports...</div>
      </div>
    );
  }

  if (!data) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get report count for a user
  const getReportCount = (userId: string) => {
    const count = data.reportCounts.find((rc) => rc._id === userId);
    return count?.count || 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#2A1F2D] mb-2">Reports & Moderation</h1>
        <p className="text-[#6F6077]">Review and take action on user reports</p>
      </div>

      {/* Top Reported Users */}
      {data.reportCounts.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[#2A1F2D] mb-4">Most Reported Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.reportCounts.slice(0, 3).map((count) => (
              <div key={count._id} className="rounded-xl bg-red-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">User ID</p>
                    <p className="text-xs text-red-500 font-mono mt-1">{count._id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-700">{count.count}</p>
                    <p className="text-xs text-red-600">reports</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/60">
          <h2 className="text-xl font-semibold text-[#2A1F2D]">All Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/50 border-b border-white/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  Reported User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  Reported By
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  Report Count
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {data.reports.map((report) => {
                const reportCount = getReportCount(report.reportedUser.user_id);
                return (
                  <tr key={report._id} className="hover:bg-white/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {report.reportedUser.photoURL ? (
                          <img
                            src={report.reportedUser.photoURL}
                            alt={report.reportedUser.displayName || report.reportedUser.email}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-[#E94057]/20 flex items-center justify-center">
                            <span className="text-[#E94057] font-semibold">
                              {(report.reportedUser.displayName || report.reportedUser.email)[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-[#2A1F2D]">
                            {report.reportedUser.displayName || "No name"}
                          </div>
                          <div className="text-sm text-[#6F6077]">{report.reportedUser.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-[#2A1F2D]">
                          {report.reportedBy.displayName || "No name"}
                        </div>
                        <div className="text-[#6F6077]">{report.reportedBy.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#6F6077]">{report.reason || "No reason provided"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`pill ${
                          reportCount > 5
                            ? "bg-red-100 text-red-700"
                            : reportCount > 2
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {reportCount} {reportCount === 1 ? "report" : "reports"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6F6077]">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleModeration(
                              report.reportedUser.user_id,
                              "warn",
                              `Reported: ${report.reason}`
                            )
                          }
                          disabled={actionLoading === report.reportedUser.user_id}
                          className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-medium hover:bg-yellow-200 transition-all disabled:opacity-50"
                        >
                          Warn
                        </button>
                        <button
                          onClick={() =>
                            handleModeration(
                              report.reportedUser.user_id,
                              "shadowBan",
                              `Reported: ${report.reason}`
                            )
                          }
                          disabled={actionLoading === report.reportedUser.user_id}
                          className="px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs font-medium hover:bg-orange-200 transition-all disabled:opacity-50"
                        >
                          Shadow Ban
                        </button>
                        <button
                          onClick={() =>
                            handleModeration(
                              report.reportedUser.user_id,
                              "ban",
                              `Reported: ${report.reason}`
                            )
                          }
                          disabled={actionLoading === report.reportedUser.user_id}
                          className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-all disabled:opacity-50"
                        >
                          Ban
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-white/60 flex items-center justify-between">
            <div className="text-sm text-[#6F6077]">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{" "}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
              {data.pagination.total} reports
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-white/50 text-sm font-medium text-[#6F6077] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/70 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.pagination.pages}
                className="px-4 py-2 rounded-xl bg-[#E94057] text-sm font-medium text-white hover:bg-[#E94057]/90 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
