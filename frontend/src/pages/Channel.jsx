import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import VideoCard from "../components/common/VideoCard";
import VideoSkeleton from "../components/common/videoSkeleton";

const Channel = () => {
  const { userId } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChannelData = async () => {
    try {
      setLoading(true);

      // ⚠️ Make sure this matches your actual backend route for getting user profile
      const [{ data: userRes }, { data: videosRes }] = await Promise.all([
        axios.get(`/api/v1/users/channel/${userId}`),
        axios.get(`/api/v1/videos?userId=${userId}`),
      ]);

      setChannel(userRes.data);
      setVideos(videosRes.data);
    } catch (error) {
      console.error("Error loading channel:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannelData();
  }, [userId]);

  return (
    <div className="py-6">
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : channel ? (
        <>
          <div className="mb-6 flex items-center gap-4">
            <img
              src={channel.avatar?.url || "/default-avatar.png"}
              alt={channel.username}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-semibold">{channel.fullName}</h2>
              <p className="text-gray-500">@{channel.username}</p>
              <p className="text-sm text-gray-400">
                {channel.subscribersCount} subscribers
              </p>
            </div>
          </div>

          <h3 className="text-xl font-medium mb-4">Videos</h3>
          {videos.length === 0 ? (
            <p className="text-gray-500">No videos uploaded yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-red-500">Channel not found.</p>
      )}
    </div>
  );
};

export default Channel;
