import { Router } from "express";
import { getMe, createUser, updateUser, getUsers } from "../controllers/userControllers";
import { verifyUser, verifyToken } from "../middleware/userMiddlewares";

const userRouter = Router();

userRouter.get("/me", verifyToken, getMe);
userRouter.post("/me", verifyToken, createUser);
userRouter.patch("/me", verifyUser, updateUser);

userRouter.get("/get-users", verifyToken, getUsers);

export default userRouter;
