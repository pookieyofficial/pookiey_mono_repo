import express from "express";
import { 
    getInbox, 
    getMessages, 
    sendMessage, 
    markAsRead, 
    deleteMessage 
} from "../controllers/messageControllers";
import { verifyUser } from "../middleware/userMiddlewares";

const messageRouter = express.Router();

// All routes require authentication
messageRouter.use(verifyUser);

// Get user's inbox (all matches with latest messages)
messageRouter.get("/inbox", getInbox);

// Get messages for a specific match
messageRouter.get("/:matchId", getMessages);

// Send a message
messageRouter.post("/", sendMessage);

// Mark messages as read
messageRouter.put("/:matchId/read", markAsRead);

// Delete a message
messageRouter.delete("/:messageId", deleteMessage);

export default messageRouter;

