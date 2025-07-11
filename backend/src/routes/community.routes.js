import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createCommunityPost, deleteCommunityPost, getAllCommunityPost, getCommunityPostById, getUserCommunityPost, updateCommunityPost } from "../controllers/community.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
console.log("✅ community.routes.js loaded");


router.use(verifyJWT)

router.route("/")
   .get(getAllCommunityPost)
   .post(upload.single("media"),createCommunityPost)

router.route("/user/:userId").get(getUserCommunityPost)

router.route("/:communityId")
   .get(getCommunityPostById)
   .patch(upload.single("media"),updateCommunityPost)
   .delete(deleteCommunityPost)

export default router;