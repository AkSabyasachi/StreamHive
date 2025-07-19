import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, Clock, Eye, ThumbsUp, Heart } from "lucide-react";

import VideoCard from "../components/common/VideoCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import SecondaryButton from "../components/common/SecondaryButton";
import { useTheme } from "../context/ThemeContext";

const gradientStyle = {
  background: "linear-gradient(135deg, #60a5fa 0%, #6366f1 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
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

// VideoListCard component (same as in Home page)
const VideoListCard = ({ video, showOwner, showViews, showUploadTime, showLikes, theme }) => {
  // Helper functions for formatting
  const formatNumber = (num) => {
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

  return (
    <div className={`flex gap-4 items-start p-4 rounded-2xl transition-all ${
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
        <Link to={`/watch/${video._id}`} className="block">
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="w-40 h-24 rounded-xl object-cover"
          />
        </Link>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Video Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/watch/${video._id}`} className="block">
          <h3 className={`font-semibold line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {video.title}
          </h3>
        </Link>

        {showOwner && video.owner && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-shrink-0">
              <img 
                src={video.owner.avatar || "/default-avatar.png"} 
                alt={video.owner.username} 
                className="w-6 h-6 rounded-full"
              />
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              @{video.owner.username}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {showViews && (
            <span className={`text-xs flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Eye size={14} />
              {formatNumber(video.views || 0)} views
            </span>
          )}
          {showUploadTime && video.createdAt && (
            <span className={`text-xs flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock size={14} />
              {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
            </span>
          )}
          {showLikes && (
            <span className={`text-xs flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <ThumbsUp size={14} />
              {formatNumber(video.likesCount || 0)} likes
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Liked = () => {
  const { theme } = useTheme();

  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("latest");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLikedVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setIsRefreshing(true);
      const { data } = await axios.get(`/likes/videos?sort=${sortOption}`);
      setLikedVideos(data?.data || []);
    } catch (err) {
      setError("Unable to fetch liked videos.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [sortOption]);

  useEffect(() => {
    fetchLikedVideos();
  }, [fetchLikedVideos]);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const filteredVideos = likedVideos
    .filter(({ video }) => video)
    .map(({ video }) => video);

  return (
    <div className="py-8 px-4 min-h-[80vh] max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <motion.h1
            className="text-2xl sm:text-3xl font-bold mb-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={gradientStyle}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              Liked Videos
            </div>
          </motion.h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            See all the videos you've liked
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <label className="mr-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              View:
            </label>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-2 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                List
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <label className="mr-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort:
            </label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 border-0 rounded-lg py-1.5 px-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="views">Most Viewed</option>
              <option value="az">Title A-Z</option>
              <option value="za">Title Z-A</option>
            </select>
          </div>
          
          {/* Refresh Button */}
          <div className="flex items-center">
            <button
              onClick={fetchLikedVideos}
              disabled={isRefreshing}
              className={`p-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-200'
              } border transition-colors`}
              title="Refresh content"
            >
              {isRefreshing ? (
                <div className="flex items-center gap-1 text-xs">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse delay-75"></span>
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse delay-150"></span>
                </div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={32} />
        </div>
      ) : error ? (
        <div className="py-20">
          <ErrorMessage message={error} />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="py-20">
          <EmptyState
            title="No Liked Videos"
            description="Videos you like will appear here."
            icon={
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
            }
            actionText="Explore Videos"
            action={
              <Link to="/">
                <SecondaryButton>Go Home</SecondaryButton>
              </Link>
            }
            className={`py-16 rounded-2xl ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          />
        </div>
      ) : viewMode === "grid" ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredVideos.map((video) => (
            <motion.div
              key={video._id}
              variants={itemVariants}
            >
              <VideoCard video={video} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredVideos.map((video) => (
              <motion.div
                key={video._id}
                variants={itemVariants}
              >
                <VideoListCard 
                  video={video}
                  showOwner
                  showViews
                  showUploadTime
                  showLikes
                  theme={theme}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {filteredVideos.length > 0 && (
        <div className="mt-10 flex justify-center">
          <SecondaryButton onClick={fetchLikedVideos} className="px-6 py-2">
            Refresh Liked Videos
          </SecondaryButton>
        </div>
      )}
    </div>
  );
};

export default Liked;