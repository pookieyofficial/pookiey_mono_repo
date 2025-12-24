import { Router } from "express";
import { createSupportMessage, getSupportMessages } from "../controllers/supportController";
import { verifyUser } from "../middleware/userMiddlewares";

const supportRouter = Router();

supportRouter.post("/", verifyUser, createSupportMessage);
supportRouter.get("/", verifyUser, getSupportMessages);

export default supportRouter;

