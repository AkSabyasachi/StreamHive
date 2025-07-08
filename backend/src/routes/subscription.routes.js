import { Router } from "express";
import { getChannelSubscribers, getUsersSubscribedChannels, isSubscribed, toggleSubscriptions } from "../controllers/subscription.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

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