// components/common/LikeButton.jsx (New)
import React, { useState } from "react";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import axiosInstance from "../../utils/axiosInstance";

const LikeButton = ({ videoId, isLiked, totalLikes, onLikeChange }) => {
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(totalLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.post(`/likes/toggle/${videoId}`);
      setLiked(data.data.liked);
      setLikesCount(data.data.totalLikes);
      if (onLikeChange) onLikeChange(data.data.liked, data.data.totalLikes);
    } catch (err) {
      console.error("Failed to toggle like", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full transition-colors ${
        liked ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-800"
      }`}
    >
      {liked ? <AiFillLike /> : <AiOutlineLike />} {likesCount}
    </button>
  );
};

export default LikeButton;
