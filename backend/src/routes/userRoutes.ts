import { Router } from "express";
import { getMe, createUser } from "../controllers/userControllers";
import { verifyUser } from "../middleware/userMiddlewares";

const userRouter = Router();

userRouter.get("/me", verifyUser, getMe);
userRouter.post("/me", verifyUser, createUser);
export default userRouter;
