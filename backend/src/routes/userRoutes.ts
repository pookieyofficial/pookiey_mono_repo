import { Router } from "express";
import { getMe, createUser, updateUser } from "../controllers/userControllers";
import { verifyUser, verifyToken } from "../middleware/userMiddlewares";

const userRouter = Router();

userRouter.get("/me", verifyToken, getMe);
userRouter.post("/me", createUser);
userRouter.patch("/me", verifyUser, updateUser);
export default userRouter;
