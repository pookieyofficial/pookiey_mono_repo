import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { Messages, Matches } from "../models";
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
        console.log(`User connected: ${userId}`);

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
                console.log(`User ${userId} joined match ${matchId}`);
            } catch (error) {
                console.error("Error joining match:", error);
                socket.emit("error", { message: "Failed to join match" });
            }
        });

        // Leave a match room
        socket.on("leave_match", (matchId: string) => {
            socket.leave(`match:${matchId}`);
            console.log(`User ${userId} left match ${matchId}`);
        });

        // Send a message
        socket.on("send_message", async (data: {
            matchId: string;
            text: string;
            type?: "text" | "image" | "gif";
            mediaUrl?: string;
        }) => {
            try {
                const { matchId, text, type = "text", mediaUrl } = data;

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

            } catch (error) {
                console.error("Error sending message:", error);
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

            } catch (error) {
                console.error("Error marking messages as read:", error);
                socket.emit("error", { message: "Failed to mark messages as read" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}`);
        });
    });

    return io;
};

