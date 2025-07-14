import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  getMyVideos
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

console.log("✅ video.routes.js loaded");

// PUBLIC routes
router.route("/").get(getAllVideos);

// PROTECTED routes
router.use(verifyJWT); // All routes below this are protected

router.get("/my", getMyVideos);
router.get("/:videoId", getVideoById);

router.post(
  "/upload", 
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

router
  .route("/:videoId")
  .patch(updateVideo)
  .delete(deleteVideo);

router.route("/:videoId/toggle-publish").patch(togglePublishStatus);

export default router;
