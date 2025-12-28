"use client";

import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { callBackend } from "../../lib/api";

type Category = "bug" | "feature_request" | "account_issue" | "billing" | "technical" | "other";
type Priority = "low" | "medium" | "high" | "urgent";

interface SupportMessage {
  _id: string;
  subject: string;
  category: Category;
  priority: Priority;
  message: string;
  attachments?: string[];
  status: "pending" | "in_progress" | "resolved" | "closed";
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

interface SupportHistoryResponse {
  supportMessages: SupportMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const categoryLabels: Record<Category, string> = {
  bug: "🐛 Bug Report",
  feature_request: "💡 Feature Request",
  account_issue: "👤 Account Issue",
  billing: "💳 Billing",
  technical: "🔧 Technical Support",
  other: "❓ Other",
};

const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const priorityColors: Record<Priority, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

export default function SupportPage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [priority, setPriority] = useState<Priority>("medium");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [historyData, setHistoryData] = useState<SupportHistoryResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
          router.push("/");
          return;
        }
        
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push("/");
      }
    };

    void checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    if (activeTab === "history" && !historyData) {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await callBackend<SupportHistoryResponse>(
        supabase,
        `/api/v1/support?page=${historyPage}&limit=10`,
        { method: "GET" }
      );
      if (response.success && response.data) {
        setHistoryData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch support history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length + attachments.length > 5) {
      setSubmitError("Maximum 5 attachments allowed");
      return;
    }

    setUploadingFiles(true);
    setSubmitError(null);

    try {
      const fileArray = Array.from(files);
      const mimeTypes = fileArray.map((file) => file.type || "application/octet-stream");

      // Get presigned URLs
      const presignedResponse = await callBackend<{ urls: Array<{ uploadUrl: string; fileURL: string }> }>(
        supabase,
        "/api/v1/aws/get-s3-presigned-url",
        {
          method: "POST",
          jsonBody: { mimeTypes },
        }
      );

      if (!presignedResponse.success || !presignedResponse.data?.urls) {
        throw new Error("Failed to get upload URLs");
      }

      // Upload files
      const uploadedUrls: string[] = [];
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const { uploadUrl, fileURL } = presignedResponse.data.urls[i];

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        uploadedUrls.push(fileURL);
      }

      setAttachments([...attachments, ...uploadedUrls]);
    } catch (error) {
      console.error("File upload error:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to upload files");
    } finally {
      setUploadingFiles(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      setSubmitError("Please enter a subject");
      return;
    }

    if (!message.trim()) {
      setSubmitError("Please enter your message");
      return;
    }

    if (!session) {
      router.push("/");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await callBackend(supabase, "/api/v1/support", {
        method: "POST",
        jsonBody: {
          subject: subject.trim(),
          category,
          priority,
          message: message.trim(),
          attachments: attachments.length > 0 ? attachments : undefined,
        },
      });

      setSubmitSuccess(true);
      setSubject("");
      setMessage("");
      setCategory("other");
      setPriority("medium");
      setAttachments([]);
      
      // Switch to history tab after 2 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab("history");
        fetchHistory();
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit support message. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[#6F6077]">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-5xl px-6 py-12 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="pill inline-flex bg-white/60 text-[#E94057] shadow-sm shadow-[#E94057]/10">
            Support Center
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] text-[#2A1F2D] md:text-5xl">
            We&apos;re here to help
          </h1>
          <p className="mt-4 text-base text-[#6F6077] md:text-lg">
            Have a question or need assistance? We&apos;re sorry for any inconvenience you may have experienced.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-white/60">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "new"
                ? "text-[#E94057] border-b-2 border-[#E94057]"
                : "text-[#6F6077] hover:text-[#2A1F2D]"
            }`}
          >
            New Request
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              if (!historyData) fetchHistory();
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "history"
                ? "text-[#E94057] border-b-2 border-[#E94057]"
                : "text-[#6F6077] hover:text-[#2A1F2D]"
            }`}
          >
            My Requests ({historyData?.pagination.total || 0})
          </button>
        </div>

        {/* New Request Tab */}
        {activeTab === "new" && (
          <>
            {/* Apology Card */}
            <div className="mb-8 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md shadow-[#E94057]/10 backdrop-blur md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E94057]/10">
                  <svg
                    className="h-6 w-6 text-[#E94057]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[#2A1F2D]">
                    We apologize for any inconvenience
                  </h2>
                  <p className="mt-2 text-sm text-[#6F6077]">
                    Your experience matters to us. If you&apos;ve encountered any issues, bugs, or have suggestions
                    for improvement, please share them with us. Our team is committed to making Pookiey the best
                    it can be, and your feedback helps us achieve that goal.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Form */}
            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md shadow-[#4B164C]/10 backdrop-blur md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-[#2A1F2D] mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue..."
                    className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-[#2A1F2D] placeholder-[#6F6077]/50 shadow-sm transition focus:border-[#E94057]/50 focus:outline-none focus:ring-2 focus:ring-[#E94057]/20 md:text-base"
                    disabled={isSubmitting}
                    maxLength={200}
                    required
                  />
                  <div className="mt-1 text-xs text-[#6F6077]">{subject.length} / 200</div>
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-[#2A1F2D] mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-[#2A1F2D] shadow-sm transition focus:border-[#E94057]/50 focus:outline-none focus:ring-2 focus:ring-[#E94057]/20 md:text-base"
                      disabled={isSubmitting}
                      required
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-semibold text-[#2A1F2D] mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-[#2A1F2D] shadow-sm transition focus:border-[#E94057]/50 focus:outline-none focus:ring-2 focus:ring-[#E94057]/20 md:text-base"
                      disabled={isSubmitting}
                    >
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-[#2A1F2D] mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <p className="mb-2 text-xs text-[#6F6077]">
                    Please describe your issue, question, or feedback in detail
                  </p>
                  <textarea
                    id="message"
                    name="message"
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind... Be as detailed as possible."
                    className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-[#2A1F2D] placeholder-[#6F6077]/50 shadow-sm transition focus:border-[#E94057]/50 focus:outline-none focus:ring-2 focus:ring-[#E94057]/20 md:text-base"
                    disabled={isSubmitting}
                    maxLength={10000}
                    required
                  />
                  <div className="mt-2 flex justify-between text-xs text-[#6F6077]">
                    <span>Include steps to reproduce, screenshots, or any relevant details</span>
                    <span>{message.length} / 10000</span>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-[#2A1F2D] mb-2">
                    Attachments (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={isSubmitting || uploadingFiles}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/80 px-4 py-3 text-sm font-medium text-[#2A1F2D] transition hover:bg-white shadow-sm">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {uploadingFiles ? "Uploading..." : "Add Files"}
                      </div>
                    </label>
                    <span className="text-xs text-[#6F6077]">
                      Max 5 files (images, PDF, DOC)
                    </span>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((url, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg bg-white/60 p-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg className="h-4 w-4 text-[#6F6077] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10l.01 0" />
                            </svg>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#E94057] truncate hover:underline"
                            >
                              {url.split("/").pop()}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            disabled={isSubmitting}
                            className="ml-2 text-red-500 hover:text-red-700 transition"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm font-medium text-[#C3344C] shadow-sm">
                    {submitError}
                  </div>
                )}

                {/* Success Message */}
                {submitSuccess && (
                  <div className="rounded-2xl border border-green-100 bg-green-50/80 p-4 text-sm font-medium text-green-700 shadow-sm">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Thank you! Your message has been submitted successfully. Redirecting to your requests...</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim() || !subject.trim() || uploadingFiles}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#E94057] via-[#FF7EB3] to-[#4B164C] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#E94057]/25 transition hover:shadow-xl hover:shadow-[#E94057]/30 focus:outline-none focus:ring-2 focus:ring-[#E94057]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Support Request"
                  )}
                </button>
              </form>
            </div>
          </>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {loadingHistory ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-[#6F6077]">Loading your requests...</div>
              </div>
            ) : historyData && historyData.supportMessages.length > 0 ? (
              <>
                {historyData.supportMessages.map((support) => (
                  <div
                    key={support._id}
                    className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md shadow-[#4B164C]/10 backdrop-blur"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#2A1F2D]">{support.subject}</h3>
                          <span className={`pill ${priorityColors[support.priority]}`}>
                            {priorityLabels[support.priority]}
                          </span>
                          <span className={`pill ${statusColors[support.status]}`}>
                            {support.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#6F6077]">
                          <span>{categoryLabels[support.category]}</span>
                          <span>•</span>
                          <span>{formatDate(support.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-[#2A1F2D] whitespace-pre-wrap">{support.message}</p>
                    </div>

                    {support.attachments && Array.isArray(support.attachments) && support.attachments.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-[#6F6077] mb-2">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {support.attachments.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/60 text-xs text-[#E94057] hover:bg-white/80 transition"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828z" />
                              </svg>
                              File {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {support.response && (
                      <div className="mt-4 p-4 rounded-2xl bg-green-50/80 border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-green-700">Response from Support</span>
                          {support.respondedAt && (
                            <span className="text-xs text-green-600 ml-auto">
                              {formatDate(support.respondedAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-green-700 whitespace-pre-wrap">{support.response}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {historyData.pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        setHistoryPage(historyPage - 1);
                        fetchHistory();
                      }}
                      disabled={historyPage === 1}
                      className="px-4 py-2 rounded-xl bg-white/50 text-sm font-medium text-[#6F6077] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/70 transition-all"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-[#6F6077]">
                      Page {historyPage} of {historyData.pagination.pages}
                    </span>
                    <button
                      onClick={() => {
                        setHistoryPage(historyPage + 1);
                        fetchHistory();
                      }}
                      disabled={historyPage >= historyData.pagination.pages}
                      className="px-4 py-2 rounded-xl bg-[#E94057] text-sm font-medium text-white hover:bg-[#E94057]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl border border-white/60 bg-white/70 p-12 text-center shadow-md backdrop-blur">
                <svg className="h-16 w-16 mx-auto text-[#6F6077] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-xl font-semibold text-[#2A1F2D] mb-2">No support requests yet</h3>
                <p className="text-[#6F6077] mb-6">You haven&apos;t submitted any support requests.</p>
                <button
                  onClick={() => setActiveTab("new")}
                  className="px-6 py-3 rounded-xl bg-[#E94057] text-white font-semibold hover:bg-[#E94057]/90 transition-all"
                >
                  Create New Request
                </button>
              </div>
            )}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold text-[#2A1F2D] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-[#2A1F2D] mb-1">How quickly will I receive a response?</h3>
              <p className="text-sm text-[#6F6077]">We typically respond within 24-48 hours during business days. Urgent issues are prioritized.</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2A1F2D] mb-1">What information should I include?</h3>
              <p className="text-sm text-[#6F6077]">Please include detailed steps to reproduce the issue, screenshots if applicable, device information, and any error messages you&apos;ve encountered.</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2A1F2D] mb-1">Can I track my support requests?</h3>
              <p className="text-sm text-[#6F6077]">Yes! Click on &quot;My Requests&quot; to view all your submitted support tickets and their current status.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
