import express from "express";
import eventController from "../controllers/eventController.js"
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isCommunityHost } from "../middleware/isCommunityHost.js";
const router = express.Router();

router.post("/create", authMiddleware, isCommunityHost, eventController.createEvent);
router.get("/all", eventController.getAllEvents);
router.get("/specific",eventController.getSpecificEvent);
router.delete("/:id", authMiddleware, eventController.deleteEvent);
export default router;