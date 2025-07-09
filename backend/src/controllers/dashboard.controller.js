import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
   const userId = req.user._id;

   // Validate ID
   if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid User ID");
   }

   // Fetch all videos by the user
   const videos = await Video.find({ owner: userId }).select("_id views");
   const videoIds = videos.map((video) => video._id);

   // Total video count
   const totalVideos = videos.length;

   // Total views across all videos ((//* 🔥🤖🤖 YE WALA DUBARA DEKHNAA))
   const totalViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0);

   // Total likes on these videos
   const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

   // Total subscribers
   const totalSubscribers = await Subscription.countDocuments({ channel: userId });

   const stats = {
      totalVideos,
      totalViews,
      totalLikes,
      totalSubscribers,
   };

   return res.status(200).json(
      new ApiResponse(200, stats, "Channel stats fetched successfully")
   );

})

const getChannelVideos = asyncHandler(async (req, res) => {
   const userId = req.user._id;

   const videos = await Video.find({ owner: userId })
    .sort({ createdAt: -1 }) // newest first
    .select("title description thumbnail views duration createdAt");

   return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));

})

export {
    getChannelStats, 
    getChannelVideos
    }