import mongoose, { Schema, Document } from "mongoose";

export interface IStory extends Document {
    userId: string;
    type: "image" | "video";
    mediaUrl: string;
    views: string[]; // Array of user IDs who viewed the story
    createdAt: Date;
    expiresAt: Date; // Stories expire after 24 hours
}

const StorySchema = new Schema<IStory>(
    {
        userId: {
            type: String,
            ref: "Users",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ["image", "video"],
            required: true
        },
        mediaUrl: {
            type: String,
            required: true
        },
        views: [{
            type: String,
            ref: "Users"
        }],
        expiresAt: {
            type: Date,
            required: true,
           
        }
    },
    { timestamps: true }
);

// Indexes for efficient querying
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
StorySchema.index({ userId: 1, createdAt: -1 });

export const Story = mongoose.model<IStory>("Stories", StorySchema);
 
