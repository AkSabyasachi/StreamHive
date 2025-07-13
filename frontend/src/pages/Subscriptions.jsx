import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import VideoCard from "../components/common/VideoCard";
import VideoSkeleton from "../components/common/videoSkeleton"; // Fix import casing!

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribedChannels = useCallback(async () => {
    try {
      const { data: userRes } = await axios.get("/api/v1/users/current-user");
      const userId = userRes?.data?._id;

      const { data: subsRes } = await axios.get(`/api/v1/subscription/u/${userId}`);
      setChannels(subsRes?.data || []);
    } catch (error) {
      console.error("Error fetching subscribed channels:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribedChannels();
  }, [fetchSubscribedChannels]);

  return (
    <div className="py-6 px-4 min-h-[80vh]">
      <h1 className="text-2xl font-semibold mb-6">Your Subscriptions</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <VideoSkeleton key={index} />
          ))}
        </div>
      ) : channels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {channels
            .filter((ch) => ch.latestVideo) // Only show if video exists
            .map((channel) => (
              <VideoCard key={channel.latestVideo._id} video={channel.latestVideo} />
            ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          You're not subscribed to any channels yet.
        </p>
      )}
    </div>
  );
};

export default Subscriptions;
