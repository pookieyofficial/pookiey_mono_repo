import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  htmlContent: string;
  isEnabled: boolean;
  priority?: number; // Higher priority announcements show first
  targetAudience?: "all" | "free" | "premium" | "super"; // Who should see this
  startDate?: Date; // When to start showing
  endDate?: Date; // When to stop showing
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, maxlength: 200 },
    htmlContent: { type: String, required: true },
    isEnabled: { type: Boolean, default: false, index: true },
    priority: { type: Number, default: 0, index: true },
    targetAudience: {
      type: String,
      enum: ["all", "free", "premium", "super", "basic"],
      default: "all",
      index: true,
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

// Indexes for efficient querying
AnnouncementSchema.index({ isEnabled: 1, priority: -1, createdAt: -1 });
AnnouncementSchema.index({ isEnabled: 1, targetAudience: 1, startDate: 1, endDate: 1 });

export const Announcement = mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
