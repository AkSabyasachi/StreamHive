import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import VideoCard from "../components/common/VideoCard";
import CommunityPost from "../components/channel/CommunityPost";
import SubscribeButton from "../components/channel/SubscribeButton";

const Channel = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [error, setError] = useState("");

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/api/v1/users/c/${username}`);
      setChannel(data.data);
    } catch (err) {
      setError("Channel not found.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelVideos = async () => {
    try {
      setTabLoading(true);
      const { data } = await axiosInstance.get(
        `/api/v1/videos?userId=${channel?._id}`
      );
      setVideos(data.videos || []);
    } catch (err) {
      console.error("Error fetching videos", err);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchCommunityPosts = async () => {
    try {
      setTabLoading(true);
      const { data } = await axiosInstance.get(
        `/api/v1/community/channel/${channel?._id}`
      );
      setCommunityPosts(data.data || []);
    } catch (err) {
      console.error("Error fetching community posts", err);
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    fetchChannelData();
  }, [username]);

  useEffect(() => {
    if (channel) {
      activeTab === "videos" ? fetchChannelVideos() : fetchCommunityPosts();
    }
  }, [channel, activeTab]);

  if (loading) return <p className="p-4">Loading channel...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="py-6 px-4">
      {/* Channel Header */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={channel.avatar}
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">{channel.fullname}</h1>
          <p className="text-gray-500">@{channel.username}</p>
          <span className="text-sm text-gray-400">
            {channel.subscriberCount || 0} subscribers
          </span>
        </div>
        <div className="ml-auto">
          <SubscribeButton channelId={channel._id} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab("videos")}
          className={`mr-4 pb-2 border-b-2 ${
            activeTab === "videos"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-500"
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab("community")}
          className={`pb-2 border-b-2 ${
            activeTab === "community"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-500"
          }`}
        >
          Community
        </button>
      </div>

      {/* Content */}
      {tabLoading ? (
        <p>Loading {activeTab}...</p>
      ) : activeTab === "videos" ? (
        videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No videos uploaded yet.</p>
        )
      ) : communityPosts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {communityPosts.map((post) => (
            <CommunityPost key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No community posts yet.</p>
      )}
    </div>
  );
};

export default Channel;
