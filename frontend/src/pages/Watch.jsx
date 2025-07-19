import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AddToPlaylistModal from "../components/common/AddToPlaylistModal";
import Card from "../components/common/Card";
import { FaEdit, FaTrash, FaShare } from "react-icons/fa";
import { IoMdAdd, IoMdThumbsUp } from "react-icons/io";
import { MdSubscriptions, MdOutlineSubscriptions, MdPlaylistAdd } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { BiLike, BiDislike } from "react-icons/bi";

const Watch = () => {
  const { videoId } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const [likedVideo, setLikedVideo] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [subsCount, setSubsCount] = useState(0);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [deleteCommentId, setDeleteCommentId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVideoAndComments = async () => {
    try {
      setLoading(true);
      const [videoRes, commentRes] = await Promise.all([
        axios.get(`/videos/${videoId}`),
        axios.get(`/comments/video/${videoId}`),
      ]);

      const videoData = videoRes.data.data;
      setVideo(videoData);
      setComments(commentRes.data.data.comments || []);
      setLikedVideo(videoData?.isLiked);
      setSubscribed(videoData?.isSubscribed);
      setLikesCount(videoData?.likesCount || 0);
      setSubsCount(videoData?.owner?.subscriberCount || 0);
    } catch (err) {
      console.error("Error loading video:", err);
      setError("Video not found or failed to load.");
    } finally {
      setLoading(false);
    }
  };

  const trackWatchHistory = async () => {
    if (!user?._id || !videoId) return;
    try {
      await axios.patch(`/users/watch-history/${videoId}`);
    } catch (err) {
      console.error("Failed to track watch history:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchVideoAndComments();
      await trackWatchHistory();
    };
    load();
  }, [videoId]);

  const confirm = (message, actionFn, id = null) => {
    setConfirmMessage(message);
    setDeleteCommentId(id);
    setConfirmAction(() => () => {
      actionFn();
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  const handleToggleLike = async () => {
    const newLiked = !likedVideo;
    // Optimistic UI update
    setLikedVideo(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
    
    try {
      await axios.post(`/likes/toggle/v/${videoId}`);
    } catch (err) {
      // Revert on error
      setLikedVideo(!newLiked);
      setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
      console.error("Failed to toggle like", err);
    }
  };

  const handleToggleSubscribe = async () => {
    const newSubscribed = !subscribed;
    // Optimistic UI update
    setSubscribed(newSubscribed);
    setSubsCount(prev => newSubscribed ? prev + 1 : prev - 1);
    
    try {
      await axios.post(`/subscription/ch/${video.owner._id}`);
    } catch (err) {
      // Revert on error
      setSubscribed(!newSubscribed);
      setSubsCount(prev => newSubscribed ? prev - 1 : prev + 1);
      console.error("Failed to toggle subscription", err);
    }
  };

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
      fetchVideoAndComments(); // Refresh comments after update
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await axios.delete(`/comments/c/${id}`);
      // Remove the comment from local state immediately
      setComments(prev => prev.filter(comment => comment._id !== id));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleEditComment = (comment) => {
    setCommentInput(comment.content);
    setEditingCommentId(comment._id);
    // Scroll to comment input for better UX
    document.getElementById("comment-input")?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const diff = (Date.now() - date.getTime()) / 1000;
    const map = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };
    for (let [unit, value] of Object.entries(map)) {
      const elapsed = Math.floor(diff / value);
      if (elapsed > 0) return `${elapsed} ${unit}${elapsed > 1 ? "s" : ""} ago`;
    }
    return "just now";
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const truncateDescription = (text, maxLength = 150) => {
    if (!text) return "No description provided.";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="p-8 text-center max-w-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl">
          <div className="text-red-500 text-lg mb-4">⚠️ Error</div>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <PrimaryButton className="mt-6" onClick={() => window.location.href = "/"}>
            Go to Home
          </PrimaryButton>
        </Card>
      </div>
    );
  }

  const videoUrl =
    typeof video?.videoFile === "string"
      ? video.videoFile
      : video?.videoFile?.url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Main Content - Left Side */}
          <div className="flex-1">
            {/* Enhanced Video Player */}
            <div className="mb-6">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-black">
                <div className="relative pb-[56.25%] h-0">
                  <video 
                    controls 
                    className="absolute inset-0 w-full h-full rounded-2xl" 
                    src={videoUrl}
                    poster={video?.thumbnail}
                  />
                </div>
              </div>
            </div>

            {/* Video Title & Metadata */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {video?.title}
              </h1>
              <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm gap-2 mb-4">
                <span className="font-medium">{formatNumber(video?.views)} views</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{formatTimeAgo(video?.createdAt)}</span>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.button 
                    onClick={handleToggleLike}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                      likedVideo 
                        ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <BiLike className="text-lg" />
                    <span>{formatNumber(likesCount)}</span>
                  </motion.button>

                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200"
                  >
                    <BiDislike className="text-lg" />
                  </motion.button>

                  <motion.button 
                    onClick={() => setShowPlaylistModal(true)}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200"
                  >
                    <MdPlaylistAdd className="text-lg" />
                    <span>Save</span>
                  </motion.button>

                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200"
                  >
                    <FaShare className="text-sm" />
                    <span>Share</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Channel Info */}
            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={video?.owner?.avatar}
                    alt={video?.owner?.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {video?.owner?.username}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(subsCount)} subscribers
                    </p>
                  </div>
                </div>

                <motion.button 
                  onClick={handleToggleSubscribe}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 transition-all duration-200 ${
                    subscribed 
                      ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {subscribed ? (
                    <>
                      <MdSubscriptions />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <MdOutlineSubscriptions />
                      <span>Subscribe</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Enhanced Description */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-gray-800 dark:text-gray-200">
                {showDescription ? (
                  <div>
                    <p className="whitespace-pre-wrap leading-relaxed mb-4">
                      {video?.description || "No description provided."}
                    </p>
                    <button
                      onClick={() => setShowDescription(false)}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Show less
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="whitespace-pre-wrap leading-relaxed mb-4">
                      {truncateDescription(video?.description)}
                    </p>
                    {video?.description && video.description.length > 150 && (
                      <button
                        onClick={() => setShowDescription(true)}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Show more
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Sidebar - Right Side */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)] flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Comments ({comments.length})
                  </h2>
                </div>

                {/* Add Comment */}
                {user && (
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700" id="comment-input">
                    <div className="flex gap-3 mb-3">
                      <img
                        src={user?.avatar}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        alt={user?.username}
                      />
                      <div className="flex-1">
                        <textarea
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          rows="3"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      {editingCommentId && (
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setCommentInput("");
                          }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={handleCommentSubmit}
                        disabled={!commentInput.trim()}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          commentInput.trim() 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {editingCommentId ? "Update" : "Comment"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No comments yet. Be the first to comment!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {comments.map((comment) => (
                          <motion.div
                            key={comment._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-3"
                          >
                            <img
                              src={comment.owner?.avatar}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              alt={comment.owner?.username}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div>
                                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {comment.owner?.username}
                                  </span>
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    {formatTimeAgo(comment.createdAt)}
                                  </span>
                                </div>
                                
                                {user?._id === comment.owner?._id && (
                                  <div className="flex gap-1 ml-2">
                                    <button
                                      onClick={() => handleEditComment(comment)}
                                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                                    >
                                      <FaEdit size={12} />
                                    </button>
                                    <button
                                      onClick={() => confirm("Delete this comment?", () => handleDeleteComment(comment._id), comment._id)}
                                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                                    >
                                      <FaTrash size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">
                                {comment.content}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddToPlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        videoId={videoId}
      />

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmAction}
        message={confirmMessage}
      />
    </div>
  );
};

export default Watch;