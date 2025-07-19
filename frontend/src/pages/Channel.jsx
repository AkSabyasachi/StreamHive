import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../utils/axiosInstance";
import VideoCard from "../components/common/VideoCard";
import EmptyState from "../components/common/EmptyState";
import CommunityPost from "../components/channel/CommunityPost";
import SubscribeButton from "../components/channel/SubscribeButton";
import CreateCommunityPostModal from "../components/channel/CreateCommunityPostModal";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Search, Grid, List, Video, MessageSquare, Heart, Eye, Clock, PlusCircle, Users } from "lucide-react";

const ITEMS_PER_PAGE = 12;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Custom icons for list view
const EyeIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const HeartIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

// New VideoListCard component matching Dashboard style
const VideoListCard = ({ video, theme, showViews = true, showUploadTime = true, showLikes = true }) => {
  // Helper functions for formatting
  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <Link to={`/watch/${video._id}`} className="block">
      <div className={`flex gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-2xl transition-all ${
        theme === 'dark' 
          ? 'bg-gray-800/50 hover:bg-gray-700/50' 
          : 'bg-white hover:bg-gray-50'
      } border ${
        theme === 'dark' 
          ? 'border-gray-700' 
          : 'border-gray-200'
      }`}>
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="w-24 h-16 sm:w-40 sm:h-24 rounded-xl object-cover"
          />
          {video.duration && (
            <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold line-clamp-2 text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {video.title}
          </h3>

          {video.description && (
            <p className={`text-xs sm:text-sm mt-1 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {video.description}
            </p>
          )}

          <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
            {showViews && (
              <span className={`text-xs flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <EyeIcon size={12} />
                {formatNumber(video.views)} views
              </span>
            )}
            {showUploadTime && (
              <span className={`text-xs flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Clock size={12} />
                {formatDate(video.createdAt)}
              </span>
            )}
            {showLikes && (
              <span className={`text-xs flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <HeartIcon size={12} />
                {formatNumber(video.likesCount)} likes
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const StatCard = ({ label, value, icon, theme }) => (
  <div className={`bg-white dark:bg-gray-900 shadow group hover:shadow-xl transition-all rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 text-center relative overflow-hidden`}>
    <div className={`absolute -top-3 -right-3 opacity-10 group-hover:opacity-15 transition-all`}>
      {icon}
    </div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2 select-all">{value}</p>
  </div>
);

const Channel = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/users/c/${username}`);
      setChannel(data.data);
    } catch (err) {
      setError("Channel not found.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelVideos = async () => {
    if (!channel?._id) return;
    try {
      setTabLoading(true);
      const { data } = await axiosInstance.get(`/videos?userId=${channel._id}`);
      const publishedVideos = data.data.videos.filter((video) => video.isPublished);
      setVideos(publishedVideos);
    } catch (err) {
      console.error("Error fetching videos", err);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchCommunityPosts = async () => {
    if (!channel?._id) return;
    try {
      setTabLoading(true);
      const { data } = await axiosInstance.get(`/community/user/${channel._id}`);
      setCommunityPosts(data.data.posts || []);
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

  const handlePostCreated = (newPost) => {
    setCommunityPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setCommunityPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let result = [...videos];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(video => 
        video.title.toLowerCase().includes(term) ||
        (video.description && video.description.toLowerCase().includes(term))
      );
    }
    
    if (sortOption === "recent") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === "views") {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortOption === "likes") {
      result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }
    
    return result;
  }, [videos, searchTerm, sortOption]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = [...communityPosts];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(post => 
        post.content.toLowerCase().includes(term) ||
        (post.title && post.title.toLowerCase().includes(term))
      );
    }
    
    if (sortOption === "recent") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    
    return result;
  }, [communityPosts, searchTerm, sortOption]);

  // Pagination
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVideos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVideos, currentPage]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const totalPages = Math.ceil(
    activeTab === "videos" 
      ? filteredVideos.length / ITEMS_PER_PAGE 
      : filteredPosts.length / ITEMS_PER_PAGE
  );

  // Format numbers
  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  // Calculate stats from videos
  const channelStats = useMemo(() => {
    const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
    const totalLikes = videos.reduce((sum, video) => sum + (video.likesCount || 0), 0);
    return {
      totalVideos: videos.length,
      totalViews,
      totalLikes,
      totalSubscribers: channel?.subscriberCount || 0
    };
  }, [videos, channel]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300 p-4">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 font-medium">Loading channel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300 p-4">
        <ErrorMessage 
          title="Channel not found"
          message={error}
          actions={
            <Link to="/">
              <PrimaryButton>Go Home</PrimaryButton>
            </Link>
          }
          className="max-w-md w-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto">
        {/* Cover image with overlay and layered avatar */}
        {channel?.coverImage && (
          <div className="relative h-40 sm:h-56 md:h-72 w-full rounded-2xl overflow-hidden mb-8 group shadow-lg">
            <img
              src={channel.coverImage}
              alt="Cover"
              className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
            {/* Avatar, partly overlapped */}
            <div className="absolute -bottom-10 left-6 sm:left-10 z-20">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-indigo-700 p-1 shadow-xl ring-2 ring-white dark:ring-gray-900">
                <img
                  src={channel.avatar || "/default-avatar.png"}
                  alt={channel.fullname || "Channel"}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}

        {/* Channel Info */}
        <div className="pl-0 sm:pl-36 md:pl-40 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {channel.fullname}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-mono">@{channel.username}</p>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              {formatNumber(channel.subscriberCount || 0)} subscribers
            </p>
          </div>
          <div className="ml-auto">
            <SubscribeButton channelId={channel._id} />
          </div>
        </div>

        {/* Stats Grid - Now only showing Total Videos and Subscribers */}
        <div className="grid grid-cols-2 gap-5 mb-10">
          <StatCard 
            label="Total Videos" 
            value={formatNumber(channelStats.totalVideos)} 
            icon={<Video className="w-6 h-6 text-indigo-500/60" />}
            theme={theme} 
          />
          <StatCard 
            label="Subscribers" 
            value={formatNumber(channelStats.totalSubscribers)}
            icon={<Users className="w-6 h-6 text-green-500/60" />}
            theme={theme}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex gap-4">
            {["videos", "community"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                  setSearchTerm("");
                }}
                className={`rounded-full px-6 py-2 font-semibold transition-all
                  text-base focus:outline-none focus:ring-2 focus:ring-blue-400
                  ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-950"
                  }
                `}
              >
                {tab === "videos" ? "Videos" : "Community Posts"}
              </button>
            ))}
          </div>

          {activeTab === "community" && user?._id === channel._id && (
            <PrimaryButton onClick={() => setModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" /> Create Post
            </PrimaryButton>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
            <input
              type="text"
              placeholder={`Search ${activeTab === "videos" ? "videos" : "posts"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-gray-100 border-gray-300 text-gray-900'
              } border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {activeTab === "videos" && (
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  View:
                </label>
                <div className={`flex items-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-1`}>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? 'bg-blue-500 text-white'
                        : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Grid View"
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? 'bg-blue-500 text-white'
                        : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="List View"
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <label className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort:
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className={`bg-gray-100 dark:bg-gray-800 border-0 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                <option value="recent">Recent First</option>
                <option value="oldest">Oldest First</option>
                {activeTab === "videos" && (
                  <>
                    <option value="views">Most Viewed</option>
                    <option value="likes">Most Liked</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Tab content */}
        {tabLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={36} />
          </div>
        ) : activeTab === "videos" ? (
          paginatedVideos.length === 0 ? (
            <EmptyState
              title="No videos uploaded yet"
              description="This channel hasn't uploaded any videos"
              icon={
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-indigo-400 dark:text-indigo-300" />
                </div>
              }
              className="py-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
            />
          ) : viewMode === "grid" ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginatedVideos.map((video) => (
                <motion.div key={video._id} variants={itemVariants}>
                  <VideoCard
                    video={video}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // Updated list view using the new VideoListCard component
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 mb-12"
            >
              {paginatedVideos.map((video) => (
                <motion.div key={video._id} variants={itemVariants}>
                  <VideoListCard 
                    video={video}
                    theme={theme}
                    showViews={sortOption === 'views' || sortOption === 'recent'}
                    showUploadTime={sortOption === 'recent' || sortOption === 'oldest'}
                    showLikes={sortOption === 'likes' || sortOption === 'recent'}
                  />
                </motion.div>
              ))}
            </motion.div>
          )
        ) : paginatedPosts.length === 0 ? (
          <EmptyState
            title="No community posts yet"
            description="This channel hasn't created any community posts"
            icon={
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-400 dark:text-blue-300" />
              </div>
            }
            className="py-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-7"
          >
            {paginatedPosts.map((post) => (
              <motion.div key={post._id} variants={itemVariants}>
                <CommunityPost
                  post={post}
                  onDelete={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <div className="flex gap-2">
              <SecondaryButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </SecondaryButton>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-full font-medium transition-all ${
                        pageNum === currentPage
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <SecondaryButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </SecondaryButton>
            </div>
          </div>
        )}

        <CreateCommunityPostModal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          onPostCreated={handlePostCreated}
        />
      </div>
    </div>
  );
};

export default Channel;