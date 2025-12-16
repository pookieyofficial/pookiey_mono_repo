import { Router } from "express";
import { getMe, createUser, updateUser, getUsers, getUserById, getReferralCode, deleteAccount, validateAndProcessReferral } from "../controllers/userControllers";
import { verifyUser, verifyToken } from "../middleware/userMiddlewares";

const userRouter = Router();

userRouter.get("/me", verifyUser, getMe);
userRouter.get("/referral/code", verifyUser, getReferralCode);
userRouter.get("/get-users", verifyUser, getUsers);

userRouter.post("/me", verifyToken, createUser);
userRouter.post("/referral/validate", verifyUser, validateAndProcessReferral);

userRouter.patch("/me", verifyUser, updateUser);
userRouter.delete("/me", verifyUser, deleteAccount);

userRouter.get("/:userId", verifyUser, getUserById);


export default userRouter;
