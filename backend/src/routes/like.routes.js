import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleCommunityLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router()
console.log("✅ like.routes.js loaded");

router.use(verifyJWT)

router.route("/videos").get(getLikedVideos)
router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/toggle/co/:communityId").post(toggleCommunityLike)

export default router;