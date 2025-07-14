import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/like.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  /*
    * GET ALL VIDEOS WORKFLOW
    
    * 1. Get all published video with destructuring 
    * 2. Convert the strings to numbers like page,limit 
    * 3. Build aggregation pipeline
    * 4. Return the response
    */

  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
    throw new ApiError(400, "Page and Limit must be a valid number");
  }

  const allowedSortFields = ["createdAt", "title", "views", "likes"];
  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sortBy field");
  }

  //* Base match -
  const matchStage = {
    isPublished: true,
  };

  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
  throw new ApiError(400, "Invalid user ID");
}

  //* Filtering based on userId ; userId is normally stored in string format but in MongoDB it is soted as ObjectId so writing new mongoose.Types.... converts the userId to proper ObjectId providing userId based filtering
  if (userId) {
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  //* text search by title/description (got from query)
  if (query?.trim()) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } }, //regex: matches substrings like "%something%"
      { description: { $regex: query, $options: "i" } }, //options: "i" - for case-insensitive search
    ];
  }

  const sortStage = {
    [sortBy]: sortType === "asc" ? 1 : -1, //1 is ascending(old -> new) and -1 is descending
  };

  //* Aggregation Pipeline
  const pipeline = [
    //1
    {
      $match: matchStage,
    },
    /* Internally this happens
    { 
      $match: {
        isPublished: true,
        $or: [
          { title: { $regex: "js", $options: "i" } },
          { description: { $regex: "js", $options: "i" } }
        ]
      }
    }*/
    //2
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    //3
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    //4
    {
      $sort: sortStage,
    },
  ];

  const options = {
    page: pageNum,
    limit: limitNum,
    customLabels: {
      docs: "videos",
      totalDocs: "totalVideos",
    },
  };

  const result = await Video.aggregatePaginate(pipeline, options);

  if (result.totalVideos === 0) {
    throw new ApiError(404, "No matching videos found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: result.videos,
        totalVideos: result.totalVideos,
        totalPages: result.totalPages,
        currentPage: result.page,
      },
      "Videos Fetched Successfully"
    )
  );
});

const publishAVideo = asyncHandler(async(req,res) => {

   //* Extract title and description from req.body
   const {title,description} = req.body
   if(!title || !description)
   {
      throw new ApiError(400,"Title and Description required")
   }

   //* Extract video and thumbnail from req.files
   const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
   const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
   if(!videoFileLocalPath || !thumbnailLocalPath)
   {
      throw new ApiError(400,"Video and Thumbnail required")
   }

   //* Upload themm to cloudinary
   const videoFile = await uploadOnCloudinary(videoFileLocalPath)
   if(!videoFile)
   {
      throw new ApiError(400,"Video upload failed");
   }

   const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
   if(!thumbnail)
   {
      throw new ApiError(400,"Thumbnail upload failed");
   }

   //* Create a new video in MongoDB
   const video = await Video.create({
      title,
      description,
      duration: videoFile.duration || 0,
      owner: req.user._id,
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      isPublished: true
   });

   const videoCreated = await Video.findById(video._id).select("-updatedAt")

   return res
      .status(200)
      .json(new ApiResponse(200, videoCreated, "Video Created successfully"));

});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const videoPipeline = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
  ]);

  if (!videoPipeline.length) {
    throw new ApiError(404, "Video not found.");
  }

  // Increment view count
  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });

  const video = videoPipeline[0];

  //* NEW: Check if the logged-in user has liked the video
  let isLiked = false;

  if (req.user?._id) {
    const like = await Like.findOne({
      user: req.user._id,
      video: videoId,
    });

    isLiked = !!like;
  }

  //  Append isLiked to the video data
  const videoWithLikeStatus = {
    ...video,
    isLiked,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoWithLikeStatus, "Video Fetched Successfully.")
    );
});

const updateVideo = asyncHandler(async(req,res) => {

   //Extract the videoId and validate the id
   const {videoId} = req.params;
   if(!mongoose.Types.ObjectId.isValid(videoId))
   {
      throw new ApiError(400,"Invalid video ID")
   }
   
   // Find and verify video ownership
   const video = await Video.findById(videoId);
   if(!video)
   {
      throw new ApiError(404,"Video not found")
   }
   if(!video.owner.equals(req.user._id))
   {
      throw new ApiError(403,"Unauthorized access.")
   }

   //
   const {title,description} = req.body
   if(!title && !description)
   {
      throw new ApiError(400,"Ateast title or description required!")
   }

   //Update object
   const updateData = {}
   if(title) updateData.title = title?.trim();
   if(description) updateData.description = description?.trim();

   //Thumbnail update
   const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
   if(thumbnailLocalPath)
   {
      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
      if(!thumbnail)
      {
         throw new ApiError(400,"Thumbnail upload failed")
      }
      updateData.thumbnail = thumbnail.url;
   }

   //DB update
   const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $set: updateData },
      { new: true, runValidators: true }
   ).select("-updatedAt")

   return res 
      .status(200)
      .json(new ApiResponse(200,updatedVideo,"Video updated successfully."))

});

const deleteVideo = asyncHandler(async(req,res) => {

   const {videoId} = req.params;
   if(!mongoose.Types.ObjectId.isValid(videoId))
   {
      throw new ApiError(400,"Invalid video ID");
   }

   //Find video
   const video = await Video.findById(videoId)
   if(!videoId)
   {
      throw new ApiError(400,"Video not found.")
   }

   //Check for authorization
   if(!video.owner.equals(req.user._id))
   {
      throw new ApiError(403,"Unauthorized to delete.")
   }

   await Video.findByIdAndDelete(videoId)

   return res
      .status(200)
      .json(new ApiResponse(200,"","Video deletd successfully."))


});

const togglePublishStatus = asyncHandler(async(req,res) => {
   const { videoId } = req.params;
   if(!videoId)
   {
      throw new ApiError(400,"invalid video ID.")
   }

   const video = await Video.findById(videoId)
   if(!video)
   {
      throw new ApiError(404,"Video not found.")
   }

   //check for authorization
   if(!video.owner.equals(req.user._id))
   {
      throw new ApiError(403,"You are unauthorized. You are not the owner.")
   }

   video.isPublished = !video.isPublished
   await video.save()

   return res
      .status(200)
      .json(new ApiResponse(200,{isPublished: video.isPublished} ,`Video is now ${video.isPublished ? "published" : "unpublished"}`))
   
})


export { 
   getAllVideos,
   publishAVideo,
   getVideoById,
   updateVideo,
   deleteVideo,
   togglePublishStatus
};