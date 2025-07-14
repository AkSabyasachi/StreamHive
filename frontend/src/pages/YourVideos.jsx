import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import {
  FaEye,
  FaHeart,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const YourVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserVideos = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/videos/my");
      setVideos(data.data.videos || []);
    } catch (err) {
      console.error("Error fetching your videos", err);
      setError("Could not load your videos.");
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (videoId) => {
    try {
      const { data } = await axiosInstance.patch(
        `/videos/${videoId}/toggle-publish`
      );
      setVideos((prev) =>
        prev.map((video) =>
          video._id === videoId
            ? { ...video, isPublished: data.data.isPublished }
            : video
        )
      );
    } catch (err) {
      console.error("Error toggling publish status", err);
      alert("Failed to toggle publish status.");
    }
  };

  const deleteVideo = async (videoId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video?"
    );
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/videos/${videoId}`);
      setVideos((prev) => prev.filter((video) => video._id !== videoId));
    } catch (err) {
      console.error("Error deleting video", err);
      alert("Failed to delete video.");
    }
  };

  useEffect(() => {
    fetchUserVideos();
  }, []);

  if (loading) return <p className="p-4">Loading your videos...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="py-6 px-4 min-h-[80vh]">
      <h1 className="text-2xl font-bold mb-6">Your Videos</h1>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-md overflow-hidden flex flex-col"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-40 object-cover"
              />

              <div className="p-4 flex flex-col justify-between flex-grow">
                <h2 className="font-semibold text-lg line-clamp-2 mb-2">
                  {video.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {video.description}
                </p>

                <div className="mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1 mb-1">
                    <FaEye /> {video.views || 0}
                  </span>
                  <span className="flex items-center gap-1 mb-1">
                    <FaHeart /> {video.likes || 0}
                  </span>
                  <span>
                    Uploaded{" "}
                    {formatDistanceToNow(new Date(video.createdAt))} ago
                  </span>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => togglePublish(video._id)}
                    className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-all ${
                      video.isPublished
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-400 hover:bg-gray-500 text-white"
                    }`}
                  >
                    {video.isPublished ? <FaToggleOn /> : <FaToggleOff />}
                    {video.isPublished ? "Published" : "Unpublished"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => alert("Edit feature coming soon!")}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => deleteVideo(video._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          You haven't uploaded any videos yet.
        </p>
      )}
    </div>
  );
};

export default YourVideos;
