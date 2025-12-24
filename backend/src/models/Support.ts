import mongoose, { Schema, Document } from "mongoose";

export interface ISupport extends Document {
  userId: string;
  userEmail?: string;
  subject: string;
  category: "bug" | "feature_request" | "account_issue" | "billing" | "technical" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  message: string;
  attachments?: string[];
  status: "pending" | "in_progress" | "resolved" | "closed";
  response?: string;
  respondedAt?: Date;
  respondedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportSchema = new Schema<ISupport>(
  {
    userId: { type: String, ref: "User", required: true, index: true },
    userEmail: { type: String },
    subject: { type: String, required: true, maxlength: 200 },
    category: {
      type: String,
      enum: ["bug", "feature_request", "account_issue", "billing", "technical", "other"],
      default: "other",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    message: { type: String, required: true, maxlength: 10000 },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "closed"],
      default: "pending",
      index: true,
    },
    response: { type: String, maxlength: 10000 },
    respondedAt: { type: Date },
    respondedBy: { type: String },
  },
  { timestamps: true }
);

SupportSchema.index({ userId: 1, createdAt: -1 });
SupportSchema.index({ status: 1, createdAt: -1 });
SupportSchema.index({ category: 1, status: 1 });
SupportSchema.index({ priority: 1, status: 1 });

export const Support = mongoose.model<ISupport>("Support", SupportSchema);

