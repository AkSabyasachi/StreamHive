import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";


const getVideoComments = asyncHandler(async(req,res) => {

   const {videoId} = req.params;
   const {page = 1, limit = 10} = req.query
   if(!mongoose.Types.ObjectId.isValid(videoId))
   {
      throw new ApiError(400,"Invalid Video ID.")
   }

   const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      customLabels: {
         docs: "comments",
         totalDocs: "totalComments",
         totalPages: "totalPages",
         page: "currentPage"
      },
   }

   const pipeline = [
      {
         $match: {
            video : new mongoose.Types.ObjectId(videoId)
         }
      },
      {
         $sort: {
            createdAt: -1,
         }
      },
      {
         $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as:"owner",
            pipeline: [
               {
                  $project: {
                     fullname: 1,
                     username: 1,
                     avatar: 1,
                  }
               }
            ]
         }
      },
      {
         $addFields: {
            owner: {$first: "$owner"},
         }
      },
      //* If you use aggregate handle the pagination manually like this
      // {
      //    $facet: { //facet returns an object with each firld as arrays {[],[],[]}
      //       paginatedResults : [{$skip: skip} , {$limit: parseInt(limit)}],
      //       totalCount: [{$count: "count"}]
      //    }
      // }
   ];

   const result = await Comment.aggregatePaginate(pipeline,options);

   
   return res
      .status(200)
      .json(new ApiResponse(200,result,"Comments fetched Successfully."
      ))

});

const addComment = asyncHandler(async(req,res) => {
   const { videoId } = req.params;
   const { content } = req.body

   if(!mongoose.Types.ObjectId.isValid(videoId))
   {
      throw new ApiError(400,"Invalid video ID")
   }

   if(!content?.trim())
   {
      throw new ApiError(400,"Missing content")
   }

   const comment = await Comment.create({
      content: content.trim(),
      video: new mongoose.Types.ObjectId(videoId),
      owner: req.user._id,
   })

   const populatedComment = await Comment.findById(comment._id)
   .populate({
      path: "owner",
      select: "username avatar",
   })

   return res
      .status(201) //201 better for resource creation
      .json(new ApiResponse(201, populatedComment ,"Comment added successfully."))

});

const updateComment = asyncHandler(async(req,res) => {
   const {commentId} = req.params
   const {content} = req.body

   if(!mongoose.Types.ObjectId.isValid(commentId))
   {
      throw new ApiError(400,"Invalid Comment ID.")
   }
   if(!content?.trim())
   {
      throw new ApiError(400,"Missing new Content")
   }

   const comment = await Comment.findById(commentId)
   if(!comment)
   {
      throw new ApiError(404,"Comment not found.")
   }

   if(!comment.owner.equals(req.user._id))
   {
      throw new ApiError(403,"You are unauthorized to update this comment.")
   }

   comment.content = content.trim()
   await comment.save()

   return res
      .status(200)
      .json(new ApiResponse(200,comment,"Comment Updated successfully."))

});

const deleteComment = asyncHandler(async(req,res) => {
   const {commentId} = req.params
   if(!mongoose.Types.ObjectId.isValid(commentId))
   {
      throw new ApiError(400,"Invalid Comment ID.")
   }

   const comment = await Comment.findById(commentId)
   if(!comment)
   {
      throw new ApiError(404,"Comment not found.")
   }

   if(!comment.owner.equals(req.user._id))
   {
      throw new ApiError(403,"You are unauthorized to delete this comment.")
   }

   await Comment.findByIdAndDelete(commentId)

   return res
      .status(200)
      .json(new ApiResponse(200,{},"Comment deleted successfully."))


});

export {
   getVideoComments,
   addComment,
   updateComment,
   deleteComment
}