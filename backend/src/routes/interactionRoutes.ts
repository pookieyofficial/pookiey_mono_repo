import { Router } from "express";
import { interaction } from "../controllers/interactionControllers";
import { verifyUser } from "../middleware/userMiddlewares";

const interactionRouter = Router();

interactionRouter.get("/", verifyUser, interaction);

export default interactionRouter;