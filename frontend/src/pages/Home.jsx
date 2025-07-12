import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoSkeleton from "../components/common/videoSkeleton";
import VideoCard from "../components/common/VideoCard";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get("/api/v1/videos");
        setVideos(res.data?.videos || []);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="w-full px-2 sm:px-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recommended Videos</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
            >
              <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-lg" />
              <div className="p-3">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{video.title}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
