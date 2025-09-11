import { Router } from "express";
import { getMe, createUser, updateUser } from "../controllers/userControllers";
import { verifyUser } from "../middleware/userMiddlewares";

const userRouter = Router();

userRouter.get("/me", verifyUser, getMe);
userRouter.post("/me", createUser);
userRouter.patch("/me", verifyUser, updateUser);
export default userRouter;
