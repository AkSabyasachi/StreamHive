import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";

const Watch = () => {
  const { videoId } = useParams();
  const { user } = useAuth();

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [likedVideo, setLikedVideo] = useState(false);

  // Fetch video + comments
  const fetchVideoAndComments = async () => {
    try {
      setLoading(true);
      const [videoRes, commentRes] = await Promise.all([
        axios.get(`/api/v1/videos/${videoId}`),
        axios.get(`/api/v1/comments/video/${videoId}`)
      ]);
      setVideo(videoRes.data.data);
      setComments(commentRes.data.data || []);
    } catch (err) {
      console.error("Error loading video:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoAndComments();
  }, [videoId]);

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;

    try {
      if (editingCommentId) {
        // Update comment
        await axios.patch(`/api/v1/comments/c/${editingCommentId}`, {
          content: commentInput
        });
      } else {
        // Add new comment
        await axios.post(`/api/v1/comments/video/${videoId}`, {
          content: commentInput
        });
      }
      setCommentInput("");
      setEditingCommentId(null);
      fetchVideoAndComments();
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/v1/comments/c/${commentId}`);
      fetchVideoAndComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleEditComment = (comment) => {
    setCommentInput(comment.content);
    setEditingCommentId(comment._id);
  };

  const handleToggleCommentLike = async (commentId) => {
    try {
      await axios.post(`/api/v1/likes/toggle/c/${commentId}`);
      fetchVideoAndComments();
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleToggleVideoLike = async () => {
    try {
      await axios.post(`/api/v1/likes/toggle/v/${videoId}`);
      setLikedVideo(!likedVideo);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleSubscribeToggle = async () => {
    try {
      await axios.post(`/api/v1/subscription/ch/${video?.owner?._id}`);
      setSubscribed((prev) => !prev);
    } catch (err) {
      console.error("Error subscribing:", err);
    }
  };

  const handleAddToPlaylist = () => {
    alert("🎵 Playlist integration coming soon!");
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="py-6 space-y-6">
      {/* --- Video Player --- */}
      <div>
        <video
          controls
          className="w-full max-h-[500px] rounded-lg"
          src={video?.videoFile?.url}
        />
        <h1 className="text-xl font-semibold mt-4">{video.title}</h1>
        <p className="text-sm text-gray-600 mt-1">{video.description}</p>
      </div>

      {/* --- Actions --- */}
      <div className="flex gap-4 flex-wrap">
        <PrimaryButton onClick={handleToggleVideoLike}>
          {likedVideo ? "Unlike" : "Like"}
        </PrimaryButton>

        <SecondaryButton onClick={handleAddToPlaylist}>
          ➕ Add to Playlist
        </SecondaryButton>

        <SecondaryButton onClick={handleSubscribeToggle}>
          {subscribed ? "Unsubscribe" : "Subscribe"} @{video?.owner?.username}
        </SecondaryButton>
      </div>

      {/* --- Comments Section --- */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Comments</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border p-2 rounded"
          />
          <PrimaryButton onClick={handleCommentSubmit}>
            {editingCommentId ? "Update" : "Post"}
          </PrimaryButton>
        </div>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b pb-2">
              <div className="flex justify-between">
                <div>
                  <span className="font-semibold">@{comment.owner?.username}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </div>
                {user?._id === comment.owner?._id && (
                  <div className="flex gap-2 text-sm">
                    <button onClick={() => handleEditComment(comment)} className="text-blue-500">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteComment(comment._id)} className="text-red-500">
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1">{comment.content}</p>
              <button
                onClick={() => handleToggleCommentLike(comment._id)}
                className="text-sm text-gray-600 mt-1"
              >
                ❤️ {comment.likesCount || 0} Likes
              </button>

              {/* 👇 Replies (basic) */}
              {comment.replies?.length > 0 && (
                <div className="ml-4 mt-2 space-y-2 text-sm text-gray-700">
                  {comment.replies.map((reply) => (
                    <div key={reply._id}>
                      <span className="font-semibold">@{reply.owner?.username}</span>:{" "}
                      {reply.content}
                      <span className="text-gray-400 ml-2 text-xs">
                        {formatTimestamp(reply.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Watch;
