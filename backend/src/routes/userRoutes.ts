import { Router } from "express";
import { getMe, createUser, updateUser, getUsers } from "../controllers/userControllers";
import { verifyUser, verifyToken } from "../middleware/userMiddlewares";

const userRouter = Router();

userRouter.get("/me", verifyToken, getMe);
userRouter.get("/get-users", verifyUser, getUsers);

userRouter.post("/me", verifyToken, createUser);
userRouter.patch("/me", verifyUser, updateUser);


export default userRouter;
