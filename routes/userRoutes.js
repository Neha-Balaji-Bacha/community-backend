// Routes : Routes define API endpoints, meaning they decide the 
// final URL paths like /api/user/register or /api/user/login that clients use to access the backend

// In short : Routes decide the API endpoint and HTTP method
import express from "express";
import userController from "../controllers/userController.js"
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isMemberMiddleware } from "../middleware/isMemberMiddleware.js";
import { isHostMiddleWare } from "../middleware/isHostMiddleware.js";
import uploadProfilePic from "../config/multer.js";
const router = express.Router();

router.post("/register",userController.register);
router.post("/login",userController.login);
router.post("/logout",userController.logout);
router.get("/me",authMiddleware, userController.profile);
router.patch("/join-community/:communityId", authMiddleware, userController.joinCommunity);
router.patch("/make-host" , authMiddleware,userController.makeHost);
router.patch("/leave-community/:id", authMiddleware,userController.leaveCommunity);
router.get("/dashboard", authMiddleware, isMemberMiddleware, userController.dashboard);
router.get("/host/dashboard", authMiddleware,isHostMiddleWare, userController.getHostDashboard);
router.patch("/toggleRSVP/:eventId", authMiddleware,userController.toggleRSVP);
router.patch("/upload-profile-pic",authMiddleware, uploadProfilePic.single("profilePic"), userController.uploadProfilePic);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

export default router;
