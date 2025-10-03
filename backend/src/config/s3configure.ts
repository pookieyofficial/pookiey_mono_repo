
import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

dotenv.config
if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY){
  throw new Error("Missing required environment variables");
}

const s3 = new AWS.S3({
  region: process.env.AWS_REGION as string,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
});

export default s3;
