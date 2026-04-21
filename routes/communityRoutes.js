import express from "express";
import communityController from "../controllers/communityController.js";
import { isHostMiddleWare } from "../middleware/isHostMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isCommunityHost } from "../middleware/isCommunityHost.js";

const router = express.Router();

router.post("/create",authMiddleware,isHostMiddleWare,communityController.createCommunity);
router.get("/all", communityController.getAllCommunities);
router.get("/specific",communityController.getSpecificCommunity);
router.get("/with-members",communityController.getCommunitywithMembers);
router.delete("/:id",authMiddleware, communityController.deleteCommunity);

export default router;
