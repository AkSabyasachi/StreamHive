import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

//* Subscribe or unsubscribe
const toggleSubscriptions = asyncHandler(async(req,res) => {
   const {channelId} = req.params;
   const subscriberId = req.user._id;

   if(!mongoose.Types.ObjectId.isValid(channelId))
   {
      throw new ApiError(400,"Invalid Channel ID")
   }
   if(subscriberId.toString() === channelId)
   {
      throw new ApiError(400,"You cannot subscribe to yourself.")
   }

   const existingSub = await Subscription.findOne({
      channel: channelId,
      subscriber: subscriberId
   })

   if(!existingSub)
   {
      await Subscription.create({
         channel: channelId,
         subscriber: subscriberId
      });

      //* Auto-increment subscriber count
      await User.findByIdAndUpdate(channelId, {
         $inc: {subscriberCount : 1},
      });

      return res
         .status(200)             //Did a bug here - passed "existingSub"
         .json(new ApiResponse(200, {}, "Subscribed successfully"));

   } else 
   {
      await Subscription.deleteOne({_id: existingSub._id})

      //* Auto-decrement subscriber count 
      await User.findByIdAndUpdate(channelId, {
         $inc: {subscriberCount : -1},
      });

      return res
         .status(200)
         .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
   }

})

//* Get subscribers of a channel or user
//* To find the number of subscribers count the number of documents according to the "channels"----"Watch the backend series vdo in case forgot"
const getChannelSubscribers = asyncHandler(async(req,res) => {
   const {channelId} = req.params
   if(!mongoose.Types.ObjectId.isValid(channelId))
   {
      throw new ApiError(400,"Invalid Channel ID")
   }

   const count = await Subscription.countDocuments({channel: channelId})
   
    return res
    .status(200)
    .json(new ApiResponse(200, { subscriberCount: count }, "Fetched subscriber count"));

})

//* Get channels(users) this user subscribed to
//* To find the number of channels a user has subscribed to find the number of documents based on "subcriberId or userId (same)" and filter them based on it
const getUsersSubscribedChannels = asyncHandler(async(req,res) => {
   const userId = req.user._id
   if(!mongoose.Types.ObjectId.isValid(userId))
   {
      throw new ApiError(400,"Invalid User ID")
   }

   const subscriptions = await Subscription.find({subscriber: userId})
   .populate({
      path: "channel",
      select: "username fullname avatar subscriberCount"
   })

   return res
      .status(200)
      .json(new ApiResponse(200, subscriptions,"Fetched subscribed channels."))

})


const isSubscribed = asyncHandler(async(req,res) => {
   const {channelId} = req.params
   const userId = req.user._id
   if(!mongoose.Types.ObjectId.isValid(channelId))
   {
      throw new ApiError(400,"Invalid Channel ID")
   }
   if(!mongoose.Types.ObjectId.isValid(userId))
   {
      throw new ApiError(400,"Invalid User ID")
   }

   const isSubscribed = await Subscription.exists({
      channel: channelId,
      subscriber: userId
   })

    return res
    .status(200)
    .json(new ApiResponse(200, { isSubscribed: Boolean(isSubscribed) }, "Subscription status fetched"));

})

export { 
   toggleSubscriptions,
   getChannelSubscribers,
   getUsersSubscribedChannels,
   isSubscribed
}