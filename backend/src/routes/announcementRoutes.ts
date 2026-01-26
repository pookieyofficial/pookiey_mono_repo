import { Router } from "express";
import {
  getActiveAnnouncement,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementControllers";
import { verifyUser } from "../middleware/userMiddlewares";

const announcementRouter = Router();

// Public endpoint - get active announcement for current user
announcementRouter.get("/active", verifyUser, getActiveAnnouncement);

// Admin endpoints
announcementRouter.get("/all", verifyUser, getAllAnnouncements);
announcementRouter.post("/", verifyUser, createAnnouncement);
announcementRouter.patch("/:id", verifyUser, updateAnnouncement);
announcementRouter.delete("/:id", verifyUser, deleteAnnouncement);

export default announcementRouter;
