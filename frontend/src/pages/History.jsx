import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import VideoCard from "../components/common/VideoCard";
import VideoSkeleton from "../components/common/videoSkeleton"; // 🔧 Fix casing

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWatchHistory = async () => {
    try {
      const { data } = await axios.get("/api/v1/users/watch-history");
      setHistory(data?.data || []);
    } catch (err) {
      console.error("Error fetching watch history:", err);
      setError("Unable to fetch watch history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  return (
    <div className="py-6 px-4 min-h-[80vh]">
      <h1 className="text-2xl font-semibold mb-6">Watch History</h1>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : history.length === 0 ? (
        <p className="text-gray-500">No videos in your watch history.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
