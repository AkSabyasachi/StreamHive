import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import { FaHeart, FaRegHeart, FaEdit, FaTrash, FaPlay, FaPause } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdSubscriptions, MdOutlineSubscriptions } from "react-icons/md";
import { motion } from "framer-motion";

const Watch = () => {
  const { videoId } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [replyInput, setReplyInput] = useState("");
  const [activeReply, setActiveReply] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [likedVideo, setLikedVideo] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch video and comments
  const fetchVideoAndComments = async () => {
    try {
      setLoading(true);
      setError("");

      const [videoRes, commentRes] = await Promise.all([
        axios.get(`/videos/${videoId}`),
        axios.get(`/comments/video/${videoId}`)
      ]);

      const videoData = videoRes.data.data;
      setVideo(videoData);
      setComments(commentRes.data.data.comments || []);

      setLikedVideo(videoData?.isLiked || false);
      setSubscribed(videoData?.isSubscribed || false);
    } catch (err) {
      console.error("Error loading video:", err);
      setError("Video not found or failed to load.");
    } finally {
      setLoading(false);
    }
  };

  // Track watch history
  const trackWatchHistory = async () => {
    if (!user?._id || !videoId) return;
    try {
      await axios.patch(`/users/watch-history/${videoId}`);
    } catch (err) {
      console.error("Failed to track watch history:", err);
    }
  };

  // useEffect - fetch video + then track history
  useEffect(() => {
    const load = async () => {
      await fetchVideoAndComments();
      await trackWatchHistory(); // 👈 log only after video fetch
    };
    load();
  }, [videoId]);

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "just now";

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }

    return "recently";
  };

  // Submit comment (or edit)
  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;

    try {
      if (editingCommentId) {
        await axios.patch(`/comments/c/${editingCommentId}`, {
          content: commentInput,
        });
      } else {
        await axios.post(`/comments/video/${videoId}`, {
          content: commentInput,
        });
      }

      setCommentInput("");
      setEditingCommentId(null);
      fetchVideoAndComments();
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  // Like toggle
  const handleToggleVideoLike = async () => {
    try {
      await axios.post(`/likes/toggle/v/${videoId}`);
      setLikedVideo((prev) => !prev);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Subscribe toggle
  const handleSubscribeToggle = async () => {
    try {
      await axios.post(`/subscription/ch/${video?.owner?._id}`);
      setSubscribed((prev) => !prev);
    } catch (err) {
      console.error("Error subscribing:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/comments/c/${commentId}`);
      fetchVideoAndComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleEditComment = (comment) => {
    setCommentInput(comment.content);
    setEditingCommentId(comment._id);
    setActiveReply(null);
  };

  const videoUrl = typeof video?.videoFile === "string" ? video.videoFile : video?.videoFile?.url;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
        <PrimaryButton onClick={fetchVideoAndComments}>Retry</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto px-4">
      {/* Video Player */}
      <motion.div
        className="bg-black rounded-xl overflow-hidden shadow-lg relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <video
          controls
          className="w-full aspect-video"
          src={videoUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2">
          {isPlaying ? <FaPause className="text-white text-xl" /> : <FaPlay className="text-white text-xl" />}
        </div>
      </motion.div>

      {/* Info Section */}
      <div className="mt-4">
        <h1 className="text-2xl font-bold">{video.title}</h1>

        <div className="flex flex-wrap items-center justify-between mt-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              <img src={video.owner?.avatar} alt={video.owner?.username} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-medium">@{video.owner?.username}</div>
              <div className="text-sm text-gray-600">
                {video.views} views • {formatTimeAgo(video.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <motion.div whileTap={{ scale: 0.9 }}>
              <PrimaryButton onClick={handleToggleVideoLike} className="flex items-center gap-2">
                {likedVideo ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                {likedVideo ? "Liked" : "Like"}
              </PrimaryButton>
            </motion.div>

            <motion.div whileTap={{ scale: 0.9 }}>
              <SecondaryButton onClick={handleSubscribeToggle} className="flex items-center gap-2">
                {subscribed ? (
                  <MdSubscriptions className="text-blue-500" />
                ) : (
                  <MdOutlineSubscriptions />
                )}
                {subscribed ? "Subscribed" : "Subscribe"}
              </SecondaryButton>
            </motion.div>

            <motion.div whileTap={{ scale: 0.9 }}>
              <SecondaryButton onClick={() => alert("🎵 Playlist integration coming soon!")}>
                <IoMdAdd className="mr-1" />
                Save
              </SecondaryButton>
            </motion.div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <div
            className={`rounded-2xl p-5 shadow-sm border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-gradient-to-br from-gray-50 to-white border-gray-100"
            }`}
          >
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {video.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>
        {/* Add comment */}
        <div className="flex gap-3 mb-6">
          <img src={user?.avatar} alt={user?.username} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a comment..."
              className="w-full border-b-2 border-gray-300 py-2 px-1 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              {editingCommentId && (
                <SecondaryButton onClick={() => setEditingCommentId(null)}>Cancel</SecondaryButton>
              )}
              <PrimaryButton
                onClick={handleCommentSubmit}
                disabled={!commentInput.trim()}
              >
                {editingCommentId ? "Update" : "Comment"}
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* Comment list */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="border-b pb-4">
                <div className="flex gap-3">
                  <img
                    src={comment.owner?.avatar}
                    alt={comment.owner?.username}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-semibold">@{comment.owner?.username}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      {user?._id === comment.owner?._id && (
                        <div className="flex gap-3">
                          <button onClick={() => handleEditComment(comment)}><FaEdit /></button>
                          <button onClick={() => handleDeleteComment(comment._id)}><FaTrash /></button>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 ml-1">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;
