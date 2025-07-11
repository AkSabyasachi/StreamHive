import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();
console.log("✅ comment.routes.js loaded");


//* PUBLIC
router.get("/video/:videoId",getVideoComments)

//*AUTH or PROTECTED
router.use(verifyJWT)

router.route("/video/:videoId").post(addComment)
router.route("/c/:commentId")
   .delete(deleteComment)
   .patch(updateComment)

export default router;