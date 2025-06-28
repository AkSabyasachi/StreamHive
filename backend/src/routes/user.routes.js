import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
  //* use multer middleware to handle file uploads
  // 'avatar' and 'coverimage' are the fields in the form
  upload.fields([
    {
      name: "avatar",
      maxCount:1,
    },
    {
      name: "coverimage",
      maxCount:1,
    },
  ]),
  
  //* this is the controller function that handles the registration logic so middleware logic is written just before the controller function
  registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post( verifyJWT , logoutUser)
router.route("/refresh-token").post(refreshAccessToken)


export default router;