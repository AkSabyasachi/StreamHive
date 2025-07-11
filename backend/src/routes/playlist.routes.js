import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router()
console.log("✅ playlist.routes.js loaded");


router.use(verifyJWT)

router.get("/user/my", getUserPlaylist)

router.route("/").post(createPlaylist)

router.route("/:playlistId")
   .get(getPlaylistById)
   .patch(updatePlaylist)
   .delete(deletePlaylist)

router.patch("/:playlistId/videos/:videoId/add",addVideoToPlaylist)
router.patch("/:playlistId/videos/:videoId/remove",removeVideoFromPlaylist)

export default router;