import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  reportedBy: string;
  reportedUser: string;
  reason: string;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportedBy: { type: String, ref: "User", required: true },
    reportedUser: { type: String, ref: "User", required: true },
    reason: String,
  },
  { timestamps: true }
);

export const Report = mongoose.model<IReport>("Report", ReportSchema);
