import express from "express";
import dotenv, { config } from "dotenv";
import connectDB from "./config/database";
import userRouter from "./routes/userRoutes";
import admin from "firebase-admin";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 6969;

app.use(express.json());
admin.initializeApp({ credential: admin.credential.cert("services.json") });

connectDB();

app.get("/", async (req, res) => {
  res.send("Server Running... 🚀");
});

app.use('/api/v1/user', userRouter)

app.listen(PORT as number, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
});
