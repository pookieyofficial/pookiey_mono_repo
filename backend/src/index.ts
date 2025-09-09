import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database";
import userRouter from "./routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6969;

app.use(express.json());

connectDB();

app.get("/", async (req, res) => {
  res.send("Server Running... 🚀");
});

app.use('/api/v1/user', userRouter)

app.listen(PORT, () => {
  console.log(`⚡ Server running on http://localhost:${PORT}`);
});