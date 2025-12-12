import { Router } from "express";
import { getMe, createUser, updateUser, getUsers, getUserById, getReferralCode } from "../controllers/userControllers";
import { verifyUser, verifyToken } from "../middleware/userMiddlewares";

const userRouter = Router();

userRouter.get("/me", verifyUser, getMe);
userRouter.get("/referral/code", verifyUser, getReferralCode);
userRouter.get("/get-users", verifyUser, getUsers);
userRouter.get("/:userId", verifyUser, getUserById);

userRouter.post("/me", verifyToken, createUser);
userRouter.patch("/me", verifyUser, updateUser);


export default userRouter;
