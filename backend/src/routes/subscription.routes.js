import { Router } from "express";
import { getChannelSubscribers, getUsersSubscribedChannels, isSubscribed, toggleSubscriptions } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
console.log("✅ subscription.routes.js loaded");


router.use(verifyJWT)

//  Get subscriber count of a channel
router.get("/ch/:channelId/count", getChannelSubscribers);

//  Check if current user is subscribed to a channel
router.get("/ch/:channelId/status", isSubscribed);

//  Subscribe/unsubscribe to a channel
router.post("/ch/:channelId", toggleSubscriptions);

//  Get all channels (users) current user is subscribed to
router.get("/u/:userId", getUsersSubscribedChannels);

export default router;