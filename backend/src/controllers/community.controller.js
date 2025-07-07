import { ApiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Community } from "../models/community.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const createCommunityPost = asyncHandler(async(req,res) => {
   const { content } = req.body
   if(!content?.trim())
   {
      throw new ApiError(400,"Post Content Required.")
   }

   let mediaUrl;
   if(req.file)
   {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path)
      if(!cloudinaryResponse?.url)
      {
         throw new ApiError(500,"Media upload failed")
      }
      mediaUrl = cloudinaryResponse.url
   }

   const post = await Community.create({
    content: content.trim(),
    media: mediaUrl || null,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Community post created successfully."));

})

const updateCommunityPost = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    throw new ApiError(400, "Invalid Community ID");
  }

  const post = await Community.findById(communityId);
  if (!post) throw new ApiError(404, "Post not found");

  if (!post.owner.equals(req.user._id)) {
    throw new ApiError(403, "Unauthorized to update this post");
  }

  // Update text
  if (content?.trim()) post.content = content.trim();

  // Update media ("optional" file via multer)
  if (req.file) {
    const upload = await uploadOnCloudinary(req.file.path);
    if (!upload?.url) throw new ApiError(500, "Media upload failed");
    post.media = upload.url;
  }

  await post.save();

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post updated successfully"));
});

const getAllCommunityPost = asyncHandler(async(req,res) => {
   const {
      page =1,
      limit=10,
      sortBy = "createdAt",
      sortType = "desc",
   } = req.query
   const pageNum = parseInt(page);
   const limitNum = parseInt(limit);

   const allowedSortFields = ["createdAt","likesCount"]
   if(!allowedSortFields.includes(sortBy))
   {
      throw new ApiError(400,"Invalid sort field.")
   }

   const pipeline = [
      {$sort: {[sortBy]: sortType === "asc"? 1: -1}},
      {
         $lookup: {
            from:"users",
            localField:"owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
               {
                  $project: {
                     fullname: 1,
                     username: 1,
                     avatar: 1
                  }
               }
            ]
         }
      },
      {
         $addFields: {
            owner: {$first: "$owner"}
         }
      }
   ]

   const result = await Community.aggregatePaginate(pipeline,{
      page: pageNum,
      limit: limitNum,
      customLabels: {
         docs: "posts",
         totalDocs: "totalPosts",
         totalPages: "totalPages",
         page: "currentPage"
      }
   })

   return res
      .status(200)
      .json(new ApiResponse(200,result,"Commmunity Posts fetched successfully."))


})

const getCommunityPostById = asyncHandler(async(req,res) => {
   const {communityId} = req.params
   if(!mongoose.Types.ObjectId.isValid(communityId))
   {
      throw new ApiError(400,"Invalid cmmunity Id.")
   }

   const post = await Community.findById(communityId)
    .populate("owner", "username avatar fullname");

   if (!post) 
   {
      throw new ApiError(404, "Post not found");
   }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post fetched successfully"));

});

const deleteCommunityPost = asyncHandler(async (req, res) => {
  const { communityId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(communityId)) {
    throw new ApiError(400, "Invalid Community ID");
  }

  const post = await Community.findById(communityId);
  if (!post) throw new ApiError(404, "Post not found");

  if (!post.owner.equals(req.user._id)) {
    throw new ApiError(403, "Unauthorized to delete this post");
  }

  await post.deleteOne();
  // Optionally: delete related likes or comments here

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

const getUserCommunityPost = asyncHandler(async(req,res) => {
   const {userId} = req.params
   const {page =1 , limit=10} = req.query

   const pageNum = parseInt(page)
   const limitNum = parseInt(limit)

   if(!mongoose.Types.ObjectId.isValid(userId))
   {
      throw new ApiError(400,"Invalid User ID.");
   }

   const pipeline = [
      {
         $match: { owner: mongoose.Types.ObjectId(userId)}
      },
      {$sort: {createdAt: -1}}
   ]

   const result = await Community.aggregatePaginate(pipeline,{
      page: pageNum,
      limit: limitNum,
      customLabels: {
         docs: "posts",
         totalDocs: "totalPosts",
         totalPages: "totalPages",
         page: "currentPage"
      }
   }).lean()

   return res
      .status(200)
      .json(new ApiResponse(200,result,"Community Posts fetched successfully."))

})

export {
   createCommunityPost,
   updateCommunityPost,
   getAllCommunityPost,
   getCommunityPostById,
   deleteCommunityPost,
   getUserCommunityPost
}