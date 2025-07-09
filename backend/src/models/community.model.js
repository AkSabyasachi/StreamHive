import mongoose,{Schema} from "mongoose";

const communitySchema = new Schema(
   {
      content:{
         type: String,
         required: true,
      },
      media: {
         type: String, //Cloudinary URL
      },
      owner: {
         type: Schema.Types.ObjectId,
         ref: "User"
      }

   },{ timestamps: true }
)

export const Community = mongoose.model("Community",communitySchema)