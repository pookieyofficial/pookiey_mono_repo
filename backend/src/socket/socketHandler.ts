import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { Messages, Matches, User } from "../models";
import { sendMessageNotification } from "../services/notificationService";
import mongoose from "mongoose";

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

export const initializeSocket = (httpServer: HTTPServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*", // Configure this properly in production
            methods: ["GET", "POST"]
        }
    });

    // Middleware to authenticate socket connections
    io.use(async (socket: AuthenticatedSocket, next) => {
        try {
            const userId = socket.handshake.auth.userId;

            if (!userId) {
                return next(new Error("Authentication error: userId is required"));
            }

            socket.userId = userId;
            next();
        } catch (error) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket: AuthenticatedSocket) => {
        const userId = socket.userId;

        // User joins their own room
        if (userId) {
            socket.join(`user:${userId}`);
        }

        // Join a match room
        socket.on("join_match", async (matchId: string) => {
            try {
                // Verify user is part of this match
                const match = await Matches.findById(matchId);
                if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
                    socket.emit("error", { message: "Access denied to this match" });
                    return;
                }

                socket.join(`match:${matchId}`);
            } catch (error) {
                socket.emit("error", { message: "Failed to join match" });
            }
        });

        // Leave a match room
        socket.on("leave_match", (matchId: string) => {
            socket.leave(`match:${matchId}`);
        });

        // Send a message
        socket.on("send_message", async (data: {
            matchId: string;
            text: string;
            type?: "text" | "image" | "gif" | "audio";
            mediaUrl?: string;
            audioDuration?: number;
        }) => {
            try {
                const { matchId, text, type = "text", mediaUrl, audioDuration } = data;

                if (!userId) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                // Verify the match exists and user is part of it
                const match = await Matches.findById(matchId);
                if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
                    socket.emit("error", { message: "Access denied" });
                    return;
                }

                const receiverId = match.user1Id === userId ? match.user2Id : match.user1Id;

                const message = new Messages({
                    matchId,
                    senderId: userId,
                    receiverId,
                    text,
                    type,
                    mediaUrl,
                    audioDuration,
                    isRead: false
                });

                await message.save();

                // Update match's lastInteractionAt
                await Matches.findByIdAndUpdate(matchId, {
                    lastInteractionAt: new Date()
                });

                // Emit to match room (both users)
                io.to(`match:${matchId}`).emit("new_message", message);

                // Also emit to receiver's user room for inbox updates
                io.to(`user:${receiverId}`).emit("inbox_update", {
                    matchId,
                    lastMessage: message
                });

                // Send push notification to receiver (if they have tokens)
                try {
                    const [senderUser, receiverUser] = await Promise.all([
                        User.findOne({ user_id: userId }).lean(),
                        User.findOne({ user_id: receiverId }).lean(),
                    ]);

                    const senderName = senderUser?.profile
                        ? `${senderUser.profile.firstName || ""} ${senderUser.profile.lastName || ""}`.trim() || senderUser.displayName || senderUser.email?.split("@")[0]
                        : senderUser?.displayName || senderUser?.email?.split("@")[0] || "";

                    const senderAvatar = senderUser?.photoURL
                        || senderUser?.profile?.photos?.find((p: any) => p.isPrimary)?.url
                        || senderUser?.profile?.photos?.[0]?.url
                        || "";

                    const receiverTokens = Array.isArray((receiverUser as any)?.notificationTokens)
                        ? (receiverUser as any).notificationTokens as string[]
                        : [];

                    if (receiverTokens.length > 0) {
                        await sendMessageNotification({
                            matchId: String(matchId),
                            userName: senderName || "New message",
                            userAvatar: senderAvatar,
                            otherUserId: receiverId,
                            expo_tokens: receiverTokens,
                            messageText: type === "audio" ? "Voice note" : text,
                            messageType: type,
                        });
                    }
                } catch (notifyError) {
                }

            } catch (error) {
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Typing indicator
        socket.on("typing_start", (data: { matchId: string }) => {
            const { matchId } = data;
            socket.to(`match:${matchId}`).emit("user_typing", { userId });
        });

        socket.on("typing_stop", (data: { matchId: string }) => {
            const { matchId } = data;
            socket.to(`match:${matchId}`).emit("user_stopped_typing", { userId });
        });

        // Mark messages as read
        socket.on("mark_as_read", async (data: { matchId: string }) => {
            try {
                const { matchId } = data;

                if (!userId) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                // Verify the match exists and user is part of it
                const match = await Matches.findById(matchId);
                if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
                    socket.emit("error", { message: "Access denied" });
                    return;
                }

                const result = await Messages.updateMany(
                    {
                        matchId: new mongoose.Types.ObjectId(matchId),
                        receiverId: userId,
                        isRead: false
                    },
                    {
                        $set: {
                            isRead: true,
                            readAt: new Date()
                        }
                    }
                );

                // Notify the sender that their messages were read
                const senderId = match.user1Id === userId ? match.user2Id : match.user1Id;
                io.to(`user:${senderId}`).emit("messages_read", {
                    matchId,
                    count: result.modifiedCount
                });

                // Emit inbox_update to the user who read the messages to update their local inbox
                io.to(`user:${userId}`).emit("inbox_update", {
                    matchId
                });

            } catch (error) {
                socket.emit("error", { message: "Failed to mark messages as read" });
            }
        });

        // Voice call events
        // Presence check for enabling/disabling the call button client-side
        socket.on(
            "call_presence",
            async (
                data: { matchId: string; receiverId: string },
                ack?: (res: { receiverOnline: boolean }) => void
            ) => {
                try {
                    const { matchId, receiverId } = data;

                    if (!userId) {
                        ack?.({ receiverOnline: false });
                        return;
                    }

                    // Verify the match exists and user is part of it (same rules as call_initiate)
                    const match = await Matches.findById(matchId);
                    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
                        ack?.({ receiverOnline: false });
                        return;
                    }

                    // Verify receiver is the other user in the match
                    const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
                    if (otherUserId !== receiverId) {
                        ack?.({ receiverOnline: false });
                        return;
                    }

                    const receiverRoom = `user:${receiverId}`;
                    const roomInfo = io.sockets.adapter.rooms.get(receiverRoom);
                    const receiverOnline = !!roomInfo && roomInfo.size > 0;

                    ack?.({ receiverOnline });
                } catch (error) {
                    ack?.({ receiverOnline: false });
                }
            }
        );

        socket.on("call_initiate", async (data: { matchId: string; receiverId: string; callType?: "voice" | "video" }) => {
            try {
                const { matchId, receiverId, callType = "voice" } = data;

                if (!userId) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                // Verify the match exists and user is part of it
                const match = await Matches.findById(matchId);
                if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
                    socket.emit("error", { message: "Access denied to this match" });
                    return;
                }

                // Verify receiver is the other user in the match
                const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
                if (otherUserId !== receiverId) {
                    socket.emit("error", { message: "Receiver is not part of this match" });
                    return;
                }

                // Online-only calling: if receiver is not currently connected, tell the caller immediately.
                const receiverRoom = `user:${receiverId}`;
                const roomInfo = io.sockets.adapter.rooms.get(receiverRoom);
                const receiverOnline = !!roomInfo && roomInfo.size > 0;

                if (!receiverOnline) {
                    socket.emit("call_unavailable", {
                        matchId,
                        receiverId,
                        reason: "offline",
                        callType,
                    });
                    return;
                }

                // Notify the receiver about incoming call (callType: voice | video)
                io.to(`user:${receiverId}`).emit("call_incoming", {
                    matchId,
                    callerId: userId,
                    callerIdentity: userId,
                    callType,
                });

                // Confirm to caller
                socket.emit("call_initiated", {
                    matchId,
                    receiverId,
                    callType,
                });

            } catch (error) {
                socket.emit("error", { message: "Failed to initiate call" });
            }
        });

        socket.on("call_answer", (data: { matchId: string; callerId: string }) => {
            const { matchId, callerId } = data;
            // Notify caller that call was answered
            io.to(`user:${callerId}`).emit("call_answered", {
                matchId,
                receiverId: userId,
                receiverIdentity: userId,
            });
        });

        socket.on("call_reject", (data: { matchId: string; callerId: string }) => {
            const { matchId, callerId } = data;
            // Notify caller that call was rejected
            io.to(`user:${callerId}`).emit("call_rejected", {
                matchId,
                receiverId: userId,
            });
        });

        socket.on("call_end", (data: { matchId: string; otherUserId: string }) => {
            const { matchId, otherUserId } = data;
            // Notify the other user that call ended
            io.to(`user:${otherUserId}`).emit("call_ended", {
                matchId,
                endedBy: userId,
            });
        });

        socket.on("disconnect", () => {
        });
    });

    return io;
};

