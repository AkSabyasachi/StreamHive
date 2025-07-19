import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

// 1. Toggle Like on a Video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  let liked;

  if (!existingLike) {
    await Like.create({ video: videoId, likedBy: req.user._id });
    liked = true;
  } else {
    await Like.deleteOne({ _id: existingLike._id });
    liked = false;
  }

  const totalLikes = await Like.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(200, {
      liked,
      totalLikes,
    }, liked ? "Video liked." : "Video unliked.")
  );
});

// 2. Toggle Like on a Comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (!existingLike) {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment liked successfully."));
  } else {
    await Like.deleteOne({ _id: existingLike._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked successfully."));
  }
});

// 3. Get all liked videos for a user
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  })
    .populate({
      path: "video",
      populate: {
        path: "owner",
        select: "username avatar",
      },
    })
    .select("video");

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

// 4. Toggle Like on a Community Post
const toggleCommunityLike = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    throw new ApiError(400, "Invalid Community ID");
  }

  const existingLike = await Like.findOne({
    community: communityId,
    likedBy: req.user._id,
  });

  if (!existingLike) {
    await Like.create({
      community: communityId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Community post liked successfully."));
  } else {
    await Like.deleteOne({ _id: existingLike._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Community post unliked successfully."));
  }
});

export {
  toggleVideoLike,
  toggleCommentLike,
  getLikedVideos,
  toggleCommunityLike,
};