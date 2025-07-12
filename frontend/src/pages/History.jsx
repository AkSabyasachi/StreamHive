import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoCard from "../components/common/VideoCard";
import VideoSkeleton from "../components/common/videoSkeleton";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get("/api/v1/users/watch-history", {
        withCredentials: true,
      });
      setHistory(data?.data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-6">Watch History</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <VideoSkeleton key={index} />
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="text-gray-500">You haven’t watched anything yet!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {history.map(({ video, watchedAt }) => (
            <VideoCard
              key={video._id}
              video={video}
              extraInfo={{
                subtitle: `Watched ${new Date(watchedAt).toLocaleString()}`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
