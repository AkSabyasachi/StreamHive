import mongoose, { Schema } from "mongoose";

const likeSchema =new Schema(
   {
      video: {
         type: Schema.Types.ObjectId,
         ref:"Video"
      },
      likedBy: {
         type: Schema.Types.ObjectId,
         ref:"User"
      },
      community: {
         type: Schema.Types.ObjectId,
         ref: "Community"
      },
      comment:{
         type: Schema.Types.ObjectId,
         ref: "Comment"
      }
   },{ timestamps: true }
)

export const Like = mongoose.model("Like",likeSchema)