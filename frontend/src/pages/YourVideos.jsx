import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import VideoCard from "../components/common/VideoCard";
import VideoSkeleton from "../components/common/videoSkeleton";

const YourVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchYourVideos = async () => {
    try {
      const { data } = await axios.get("/api/v1/dashboard/videos");
      setVideos(data?.data || []);
    } catch (err) {
      console.error("Error fetching your videos:", err);
      setError("Unable to fetch your uploaded videos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYourVideos();
  }, []);

  return (
    <div className="py-6 px-4 min-h-[80vh]">
      <h1 className="text-2xl font-semibold mb-6">Your Uploaded Videos</h1>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : videos.length === 0 ? (
        <p className="text-gray-500">You haven’t uploaded any videos yet.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default YourVideos;
