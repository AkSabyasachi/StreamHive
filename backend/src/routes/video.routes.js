import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

//PUBLIC routes
router.route("/").get(getAllVideos)
router.route("/:videoId").get(getVideoById)

//PROTECTED routes

router.use(verifyJWT)//* All routes below this will use verifyJWT

router
   .route("/upload")
   .post(
      upload.fields([
         {
            name: "videoFile",
            maxCount: 1,
         },
         {
            name: "thumbnail",
            maxCount: 1,
         },
      ]),
      publishAVideo
   );

router
   .route("/:videoId")
   .patch(updateVideo)
   .delete(deleteVideo)

router.route("/:videoId/toggle-publish")
   .patch(togglePublishStatus)

export default router;