import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGO_URI as string;

    await mongoose.connect(mongoURI, {
      dbName: "dating-app",
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    process.exit(1);
  }
};

export default connectDB;
