import { Router } from "express";
import { verifyUser } from "../middleware/userMiddlewares";
import {
    createOrder,
    getCurrentSubscription,
    getPayments,
    getPlans,
    verifyOrder,
} from "../controllers/subscriptionController";

const subscriptionRouter = Router();

subscriptionRouter.get("/plans", verifyUser, getPlans);
subscriptionRouter.get("/current", verifyUser, getCurrentSubscription);
subscriptionRouter.get("/payments", verifyUser, getPayments);
subscriptionRouter.post("/create-order", verifyUser, createOrder);
subscriptionRouter.post("/verify", verifyUser, verifyOrder);

export default subscriptionRouter;

