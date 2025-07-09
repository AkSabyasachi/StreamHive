import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/").post(createPlaylist)

router.route("/:playlistId")
   .get(getPlaylistById)
   .patch(updatePlaylist)
   .delete(deletePlaylist)

router.get("/user/my", getUserPlaylist)
router.patch("/:playlistId/videos/:videoId/add",addVideoToPlaylist)
router.patch("/:playlistId/videos/:videoId/remove",removeVideoFromPlaylist)

export default router;