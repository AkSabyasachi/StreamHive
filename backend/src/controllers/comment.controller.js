import mongoose from "mongoose";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";


const getVideoComments = asyncHandler(async(req,res) => {

   const {videoId} = req.params;
   const {page = 1, limit = 10} = req.query
   if(!mongoose.Types.ObjectId.isValid(videoId))
   {
      throw new ApiError(400,"Invalid Video ID.")
   }

   const skip = (parseInt(page) - 1)* parseInt(limit)

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
   if(result.totalComments === 0)
   {
      throw new ApiError(400,"No comments yet.")
   }
   
   return res
      .status(200)
      .json(new ApiResponse(200,result,"Comments fetched Successfully."
      ))

});


export {
   getVideoComments,
}