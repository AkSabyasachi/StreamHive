import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoCard from "../components/common/VideoCard";
import VideoSkeleton from "../components/common/videoSkeleton";

const Liked = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/v1/likes/videos", {
        withCredentials: true,
      });
      setLikedVideos(data?.data || []);
    } catch (err) {
      console.error("Error fetching liked videos:", err);
      setError("Unable to fetch liked videos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-6">Liked Videos</h1>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : likedVideos.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No liked videos yet.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {likedVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Liked;
