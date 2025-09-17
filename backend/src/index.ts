import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/mongoDB";
import userRouter from "./routes/userRoutes";
import { RootAPIResponse } from "./utils/rootAPIResponse";
import interactionRouter from "./routes/interactionRoutes";
import requestIp from "request-ip"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 6969;

app.use(express.json());
app.use(requestIp.mw());

connectDB();

app.get("/", async (req, res) => {
  // This is a joke response for the tech geeks
  res.send(RootAPIResponse);
});

app.use('/api/v1/user', userRouter)
app.use('/api/v1/interaction', interactionRouter)

app.listen(PORT as number, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
});
