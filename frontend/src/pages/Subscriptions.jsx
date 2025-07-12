import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoCard from "../components/common/VideoCard";
import VideoSkeleton from "../components/common/videoSkeleton";

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribedChannels = async () => {
    try {
      setLoading(true);
      // First, fetch the current user to get their ID
      const { data: userRes } = await axios.get("/api/v1/users/me", { withCredentials: true });
      const userId = userRes.data._id;

      // Then, fetch the user's subscribed channels using correct route
      const { data: subsRes } = await axios.get(`/api/v1/subscription/u/${userId}`, {
        withCredentials: true,
      });

      setChannels(subsRes.data || []);
    } catch (error) {
      console.error("Error fetching subscribed channels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribedChannels();
  }, []);

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-6">Your Subscriptions</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <VideoSkeleton key={index} />
          ))}
        </div>
      ) : channels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {channels.map((channel) => (
            <VideoCard key={channel._id} video={channel.latestVideo || null} user={channel} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">You're not subscribed to any channels yet.</p>
      )}
    </div>
  );
};

export default Subscriptions;