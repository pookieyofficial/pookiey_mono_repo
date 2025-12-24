"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { callBackend } from "../../../lib/api";

interface SupportMessage {
  _id: string;
  userId: string;
  userEmail?: string;
  subject: string;
  category: "bug" | "feature_request" | "account_issue" | "billing" | "technical" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  user?: {
    user_id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  };
  message: string;
  attachments?: string[];
  status: "pending" | "in_progress" | "resolved" | "closed";
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

interface SupportResponse {
  supportMessages: SupportMessage[];
  statusCounts: Array<{ _id: string; count: number }>;
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
  const [supportData, setSupportData] = useState<SupportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [supportPage, setSupportPage] = useState(1);
  const [supportStatusFilter, setSupportStatusFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [showResponseInput, setShowResponseInput] = useState<string | null>(null);

  useEffect(() => {
    fetchSupportMessages();
  }, [supportPage, supportStatusFilter]);

  const fetchSupportMessages = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: supportPage.toString(),
        limit: "50",
      });
      if (supportStatusFilter) {
        queryParams.append("status", supportStatusFilter);
      }
      const response = await callBackend<SupportResponse>(
        supabase,
        `/api/v1/admin/support?${queryParams.toString()}`,
        { method: "GET" }
      );
      if (response.success && response.data) {
        setSupportData(response.data);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to fetch support messages:", err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupportStatus = async (
    supportId: string,
    status: "pending" | "in_progress" | "resolved" | "closed",
    response?: string
  ) => {
    if (!supportId) {
      alert("Support ID is missing");
      return;
    }

    try {
      setActionLoading(supportId);
      console.log("Updating support status:", { supportId, status, response });
      
      const responseBody: any = { status };
      if (response && response.trim()) {
        responseBody.response = response.trim();
      }
      
      console.log("Sending request to:", `/api/v1/admin/support/${supportId}`, responseBody);
      
      const response_data = await callBackend(
        supabase,
        `/api/v1/admin/support/${supportId}`,
        {
          method: "PATCH",
          jsonBody: responseBody,
        }
      );
      
      console.log("Update response:", response_data);
      
      if (response_data.success) {
        setShowResponseInput(null);
        setResponseText({ ...responseText, [supportId]: "" });
        // Refresh the support messages
        await fetchSupportMessages();
      } else {
        throw new Error(response_data.message || "Failed to update support status");
      }
    } catch (err) {
      console.error("Failed to update support status - Full error:", err);
      let errorMessage = "Failed to update support status";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check if it's a network error
        if (err.message.includes("fetch") || err.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        }
        // Check if it's an authentication error
        if (err.message.includes("Unauthorized") || err.message.includes("401")) {
          errorMessage = "Authentication failed. Please refresh the page.";
        }
        // Check if it's a not found error
        if (err.message.includes("404") || err.message.includes("not found")) {
          errorMessage = "Support message not found.";
        }
      }
      
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !supportData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#6F6077]">Loading support messages...</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#2A1F2D] mb-2">Support Messages</h1>
        <p className="text-[#6F6077]">Manage and respond to user support requests</p>
      </div>

      {/* Status Filter */}
      {supportData && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold text-[#2A1F2D]">Filter by status:</span>
            <button
              onClick={() => setSupportStatusFilter("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                supportStatusFilter === ""
                  ? "bg-[#E94057] text-white"
                  : "bg-white/50 text-[#6F6077] hover:bg-white/70"
              }`}
            >
              All
            </button>
            {supportData.statusCounts.map((statusCount) => (
              <button
                key={statusCount._id}
                onClick={() => setSupportStatusFilter(statusCount._id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  supportStatusFilter === statusCount._id
                    ? "bg-[#E94057] text-white"
                    : "bg-white/50 text-[#6F6077] hover:bg-white/70"
                }`}
              >
                {statusCount._id.charAt(0).toUpperCase() + statusCount._id.slice(1)} ({statusCount.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Support Messages Table */}
      {supportData && supportData.supportMessages.length > 0 ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/60">
            <h2 className="text-xl font-semibold text-[#2A1F2D]">Support Messages</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/50 border-b border-white/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                    Query
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                    Status
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
                {supportData.supportMessages.map((support) => {
                  const user = support.user || {
                    user_id: support.userId,
                    email: support.userEmail || "Unknown",
                    displayName: undefined,
                    photoURL: undefined,
                  };
                  return (
                    <tr key={support._id} className="hover:bg-white/30 transition-colors">
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
                        <div className="max-w-md">
                          <p className="text-sm text-[#2A1F2D] whitespace-pre-wrap">{support.message}</p>
                          {support.attachments && support.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {support.attachments.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#E94057] hover:underline"
                                >
                                  📎 File {idx + 1}
                                </a>
                              ))}
                            </div>
                          )}
                          {support.response && (
                            <div className="mt-2 p-2 bg-green-50 rounded-lg">
                              <p className="text-xs font-semibold text-green-700 mb-1">Response:</p>
                              <p className="text-xs text-green-600 line-clamp-2">{support.response}</p>
                              {support.respondedAt && (
                                <p className="text-xs text-green-500 mt-1">
                                  {formatDate(support.respondedAt)}
                                </p>
                              )}
                            </div>
                          )}
                          {showResponseInput === support._id && (
                            <div className="mt-2">
                              <textarea
                                value={responseText[support._id] || ""}
                                onChange={(e) =>
                                  setResponseText({ ...responseText, [support._id]: e.target.value })
                                }
                                placeholder="Enter your response..."
                                className="w-full px-3 py-2 text-sm border border-white/60 rounded-lg bg-white/80 text-[#2A1F2D] focus:outline-none focus:ring-2 focus:ring-[#E94057]/20"
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`pill ${getStatusColor(support.status)}`}>
                          {support.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6F6077]">
                        {formatDate(support.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {showResponseInput !== support._id ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowResponseInput(support._id);
                              }}
                              className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-all"
                            >
                              Respond
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateSupportStatus(
                                    support._id,
                                    "resolved",
                                    responseText[support._id]
                                  );
                                }}
                                disabled={actionLoading === support._id || !!actionLoading}
                                className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === support._id ? "Sending..." : "Send & Resolve"}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setShowResponseInput(null);
                                  setResponseText({ ...responseText, [support._id]: "" });
                                }}
                                className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          <div className="flex gap-1 flex-wrap">
                            {support.status !== "in_progress" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateSupportStatus(support._id, "in_progress");
                                }}
                                disabled={actionLoading === support._id || !!actionLoading}
                                className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === support._id ? "Updating..." : "In Progress"}
                              </button>
                            )}
                            {support.status !== "resolved" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateSupportStatus(support._id, "resolved");
                                }}
                                disabled={actionLoading === support._id || !!actionLoading}
                                className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === support._id ? "Updating..." : "Resolve"}
                              </button>
                            )}
                            {support.status !== "closed" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateSupportStatus(support._id, "closed");
                                }}
                                disabled={actionLoading === support._id || !!actionLoading}
                                className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === support._id ? "Updating..." : "Close"}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {supportData.pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-white/60 flex items-center justify-between">
              <div className="text-sm text-[#6F6077]">
                Showing {((supportData.pagination.page - 1) * supportData.pagination.limit) + 1} to{" "}
                {Math.min(supportData.pagination.page * supportData.pagination.limit, supportData.pagination.total)}{" "}
                of {supportData.pagination.total} messages
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSupportPage(supportPage - 1)}
                  disabled={supportPage === 1}
                  className="px-4 py-2 rounded-xl bg-white/50 text-sm font-medium text-[#6F6077] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/70 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => setSupportPage(supportPage + 1)}
                  disabled={supportPage >= supportData.pagination.pages}
                  className="px-4 py-2 rounded-xl bg-[#E94057] text-sm font-medium text-white hover:bg-[#E94057]/90 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : supportData && supportData.supportMessages.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <svg className="h-16 w-16 mx-auto text-[#6F6077] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-xl font-semibold text-[#2A1F2D] mb-2">No support messages</h3>
          <p className="text-[#6F6077]">There are no support messages to display.</p>
        </div>
      ) : null}
    </div>
  );
}
