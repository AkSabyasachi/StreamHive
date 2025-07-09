import mongoose from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async(req,res) => {
   const { name, description ,videos = [] } = req.body
   const userId = req.user._id
   if(!name?.trim())
   {
      throw new ApiError(400,"Name of the playlist required.")
   }

   const newPlaylist = await Playlist.create({
      name: name?.trim(),
      description: description?.trim() || "" ,
      videos,
      owner: userId
   })

   return res
   .status(201)
   .json(new ApiResponse(201,newPlaylist,"Playlist created successfully."))

})


const getUserPlaylist = asyncHandler(async(req,res) => {
   const userId = req.user._id
   if(!mongoose.Types.ObjectId.isValid(userId))
   {
      throw new ApiError(400,"Invalid User ID.")
   }

   const playlists = await Playlist.find({owner: userId})
   .populate("videos" , "thumbnail title duration")
   .sort({createdAt : -1})

   if(!playlists || playlists.length === 0)
   {
      throw new ApiError(400,"No playlist of the user found.")
   }

   return res.status(200)
   .json(new ApiResponse(200,playlists,"User's Playlist fetched successfully."))

})


const getPlaylistById = asyncHandler(async(req,res) => {
   const { playlistId } = req.params;
   if (!mongoose.Types.ObjectId.isValid(playlistId)) 
   {
    throw new ApiError(400, "Invalid Playlist ID");
   }

   const playlist = await Playlist.findById(playlistId)
   .populate("videos","thumbnail duration title") //* .populate({path:" " , select: " "})
   .populate("owner", "username avatar");

   if(!playlist)
   {
      throw new ApiError(400,"No playlist of the user found.")
   }

   return res.status(200)
   .json(new ApiResponse(200,playlist,"Playlist fetched successfully."))

})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

   if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) 
   {
    throw new ApiError(400, "Invalid Playlist or Video ID");
   }

   const playlist = await Playlist.findById(playlistId);
   if (!playlist) throw new ApiError(404, "Playlist not found");

   if (!playlist.owner.equals(req.user._id)) 
   {
     throw new ApiError(403, "You are not authorized to modify this playlist");
   }

   if (playlist.videos.includes(videoId)) 
   {
     throw new ApiError(400, "Video already exists in the playlist");
   }

   playlist.videos.push(videoId);
   await playlist.save();

   return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist"));
});


const removeVideoFromPlaylist = asyncHandler(async(req,res) => {
   const { playlistId, videoId } = req.params;

   if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) 
   {
    throw new ApiError(400, "Invalid Playlist or Video ID");
   }

   const playlist = await Playlist.findById(playlistId);
   if (!playlist) throw new ApiError(404, "Playlist not found");

   if (!playlist.owner.equals(req.user._id)) 
   {
     throw new ApiError(403, "You are not authorized to modify this playlist");
   }

   //* .filter is immutable and it creates a new array , so when the video id matches that video is not present in the new array . We convert the objectId to string before comparision because objectid and string might look same but they are not
   playlist.videos = playlist.videos.filter( (v) => v.toString() !== videoId )

   await playlist.save()
   return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist"));

})


const updatePlaylist = asyncHandler(async(req,res) => {
   const {playlistId} = req.params
   const {name,description} = req.body
   if(!mongoose.Types.ObjectId.isValid(playlistId))
   {
      throw new ApiError(400,"Invalid User ID.")
   }
   if(!name?.trim())
   {
      throw new ApiError(400,"New Playlist name required.")
   }

   const updateData = {}
   if(name) updateData.name = name.trim();
   if(description) updateData.description = description.trim();
   
   const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $set: updateData },
      { new: true, runValidators: true }
   ).select("-updatedAt")

   return res 
         .status(200)
         .json(new ApiResponse(200,updatedPlaylist,"Playlist updated successfully."))

})


const deletePlaylist = asyncHandler(async(req,res) => {
   const {playlistId} = req.params
   if(!mongoose.Types.ObjectId.isValid(playlistId))
   {
      throw new ApiError(400,"Invalid Playlist ID.")
   }

   const playlist = await Playlist.findById(playlistId);
   if (!playlist) throw new ApiError(404, "Playlist not found");

   if(!playlist.owner.equals(req.user._id))
   {
      throw new ApiError(403,"You are unauthorized to delete this playlist.")
   }

   await Playlist.findByIdAndDelete(playlistId)

   return res 
      .status(200)
      .json(new ApiResponse(200,[],"Playlist deleted successfully."))

})



export {
   createPlaylist,
   getUserPlaylist,
   getPlaylistById,
   addVideoToPlaylist,
   removeVideoFromPlaylist,
   updatePlaylist,
   deletePlaylist
}