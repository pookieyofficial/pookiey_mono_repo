import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "./config/mongoDB";
import userRouter from "./routes/userRoutes";
import { RootAPIResponse } from "./utils/rootAPIResponse";
import interactionRouter from "./routes/interactionRoutes";
import awsRouter from "./routes/awsRoutes";
import messageRouter from "./routes/messageRoutes";
import requestIp from "request-ip";
import { initializeSocket } from "./socket/socketHandler";
import cors from "cors";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 6969;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());

connectDB();

const io = initializeSocket(httpServer);

app.set('io', io);

app.get("/", async (req, res) => {
  res.send(RootAPIResponse);
});

app.use('/api/v1/user', userRouter);
app.use('/api/v1/interaction', interactionRouter);
app.use('/api/v1/aws', awsRouter);
app.use('/api/v1/messages', messageRouter);

httpServer.listen(PORT as number, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});
