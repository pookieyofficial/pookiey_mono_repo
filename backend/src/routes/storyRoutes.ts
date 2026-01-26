import { Router } from "express";
import { 
    getStories, 
    createStory, 
    viewStory,
    likeStory,
    getStoryViewers,
    deleteStory 
} from "../controllers/storyControllers";
import { verifyUser } from "../middleware/userMiddlewares";

const storyRouter = Router();

storyRouter.get("/", verifyUser, getStories);
storyRouter.post("/", verifyUser, createStory);
storyRouter.post("/:storyId/view", verifyUser, viewStory);
storyRouter.post("/:storyId/like", verifyUser, likeStory);
storyRouter.get("/:storyId/viewers", verifyUser, getStoryViewers);
storyRouter.delete("/:storyId", verifyUser, deleteStory);

export default storyRouter;

