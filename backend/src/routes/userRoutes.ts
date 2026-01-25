import { Router } from "express";
import {
    getMe,
    createUser,
    updateUser,
    getUsers,
    getUserById,
    getReferralCode,
    deleteAccount,
    validateAndProcessReferral,
    getUserMatches,
    getUsersWhoLikedMe,
} from "../controllers/userControllers";
import { verifyUser, verifyToken } from "../middleware/userMiddlewares";

const userRouter = Router();

userRouter.get("/me", verifyUser, getMe);
userRouter.get("/referral/code", verifyUser, getReferralCode);
userRouter.get("/get-users", verifyUser, getUsers);
userRouter.get("/get-user-matches", verifyUser, getUserMatches);
userRouter.get("/get-users-who-liked-me", verifyUser, getUsersWhoLikedMe);

userRouter.post("/me", verifyToken, createUser);
userRouter.post("/referral/validate", verifyUser, validateAndProcessReferral);

userRouter.patch("/me", verifyUser, updateUser);
userRouter.delete("/me", verifyUser, deleteAccount);

userRouter.get("/:userId", verifyUser, getUserById);


export default userRouter;
