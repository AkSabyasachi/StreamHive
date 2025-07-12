import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoCard from "../components/common/VideoCard";
import VideoSkeleton from "../components/common/videoSkeleton";

const YourVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchYourVideos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/v1/dashboard/videos", {
        withCredentials: true,
      });
      setVideos(data?.data || []);
    } catch (err) {
      console.error("Error fetching your videos:", err);
      setError("Failed to fetch your videos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYourVideos();
  }, []);

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-6">Your Uploaded Videos</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <VideoSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : videos.length === 0 ? (
        <p className="text-gray-500">You haven't uploaded any videos yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default YourVideos;
