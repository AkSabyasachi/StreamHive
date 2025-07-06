import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();

//* PUBLIC
router.route("/:videoId").get(getVideoComments)

//*AUTH or PROTECTED
router.use(verifyJWT)

router.route("/:videoId").post(addComment)
router.route("/c/:commentId")
   .delete(deleteComment)
   .patch(updateComment)

export default router;