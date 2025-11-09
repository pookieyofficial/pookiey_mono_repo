import { Router } from "express";
import { 
    getStories, 
    createStory, 
    viewStory, 
    deleteStory 
} from "../controllers/storyControllers";
import { verifyUser } from "../middleware/userMiddlewares";

const storyRouter = Router();

storyRouter.get("/", verifyUser, getStories);
storyRouter.post("/", verifyUser, createStory);
storyRouter.post("/:storyId/view", verifyUser, viewStory);
storyRouter.delete("/:storyId", verifyUser, deleteStory);

export default storyRouter;

