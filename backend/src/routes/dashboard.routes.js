import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router();
console.log("✅ dashboard.routes.js loaded");


router.use(verifyJWT);

//Channel analytics
router.get("/stats", getChannelStats);
//All videos uploaded by the user
router.get("/videos", getChannelVideos);

export default router;