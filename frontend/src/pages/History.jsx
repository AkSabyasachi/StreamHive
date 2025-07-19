import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { 
  Sparkles, 
  Clock, 
  Eye, 
  ThumbsUp, 
  Grid, 
  List, 
  Search, 
  X, 
  RefreshCw,
  Play,
  Trash2,
  Filter,
  Calendar,
  TrendingUp
} from "lucide-react";

import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import HistoryCard from "../components/common/HistoryCard";
import SecondaryButton from "../components/common/SecondaryButton";
import PrimaryButton from "../components/common/PrimaryButton";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useTheme } from "../context/ThemeContext";

// Enhanced VideoListCard component for better mobile experience
const VideoListCard = ({ video, theme, onRemove }) => {
  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (duration) => {
    if (!duration) return "0:00";
    
    // Handle duration in seconds and limit to 2 decimal places
    const totalSeconds = parseFloat(duration);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (date) => {
    if (!date) return "Just now";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };

  const isNewVideo = video.createdAt && differenceInDays(new Date(), new Date(video.createdAt)) <= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`
        group relative flex gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-xl sm:rounded-2xl 
        transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]
        ${theme === 'dark' 
          ? 'bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 hover:border-gray-600/50' 
          : 'bg-white hover:bg-gray-50 border border-gray-200/50 hover:border-gray-300/50'
        }
        shadow-sm hover:shadow-md backdrop-blur-sm
      `}
    >
      {/* Thumbnail Container */}
      <Link to={`/watch/${video._id}`} className="relative flex-shrink-0 group/thumb">
        <div className="w-32 h-20 sm:w-40 sm:h-24 md:w-44 md:h-28 rounded-lg sm:rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img 
            src={video.thumbnail || "/default-thumbnail.jpg"} 
            alt={video.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = "/default-thumbnail.jpg";
            }}
          />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transform scale-75 group-hover/thumb:scale-100 transition-all duration-300">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 ml-0.5" fill="currentColor" />
            </div>
          </div>
          
          {/* Duration Badge */}
          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {formatDuration(video.duration)}
          </div>
          
          {/* New Badge */}
          {isNewVideo && (
            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
              <Sparkles className="w-2.5 h-2.5" />
              <span className="hidden sm:inline font-medium">NEW</span>
            </div>
          )}
        </div>
      </Link>

      {/* Video Details */}
      <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
        {/* Title */}
        <Link to={`/watch/${video._id}`}>
          <h3 className={`
            font-semibold text-sm sm:text-base md:text-lg leading-tight
            line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 
            transition-colors duration-200 cursor-pointer
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            {video.title}
          </h3>
        </Link>

        {/* Owner Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <img 
              src={video.owner?.avatar || "/default-avatar.png"} 
              alt={video.owner?.username || "Unknown"}
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full object-cover border-2 border-blue-500/30"
              loading="lazy"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
          </div>
          <span className={`text-xs sm:text-sm md:text-base truncate font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer`}>
            {video.owner?.username || "Unknown Creator"}
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
          {/* Views */}
          <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">{formatNumber(video.views || 0)}</span>
            <span className="hidden sm:inline">views</span>
          </div>
          
          {/* Upload Time */}
          <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">
              {getTimeAgo(video.createdAt)}
            </span>
          </div>
          
          {/* Likes */}
          <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">{formatNumber(video.likesCount || 0)}</span>
            <span className="hidden sm:inline">likes</span>
          </div>
        </div>

        {/* Watch Progress Bar (if available) */}
        {video.watchProgress && video.watchProgress > 0 && (
          <div className="mt-2">
            <div className={`w-full h-1 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(video.watchProgress, 100)}%` }}
              />
            </div>
            <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {Math.round(video.watchProgress)}% watched
            </span>
          </div>
        )}
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove(video._id);
          }}
          className={`
            opacity-0 group-hover:opacity-100 transition-all duration-200
            p-2 rounded-full hover:scale-110 active:scale-95
            ${theme === 'dark' 
              ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' 
              : 'hover:bg-red-100 text-red-500 hover:text-red-600'
            }
          `}
          title="Remove from history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

const History = () => {
  const { theme } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [viewMode, setViewMode] = useState("list"); // Default to list for better mobile experience
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const periodOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" }
  ];

  const sortOptions = [
    { value: "latest", label: "Latest First", icon: <Calendar className="w-4 h-4" /> },
    { value: "oldest", label: "Oldest First", icon: <Clock className="w-4 h-4" /> },
    { value: "views", label: "Most Viewed", icon: <Eye className="w-4 h-4" /> },
    { value: "az", label: "Title A-Z", icon: <Filter className="w-4 h-4" /> },
    { value: "za", label: "Title Z-A", icon: <Filter className="w-4 h-4" /> }
  ];

  const fetchWatchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`/users/watch-history?sort=${sortOption}&period=${selectedPeriod}`);
      setHistory(data?.data || []);
    } catch (err) {
      console.error("Error fetching watch history:", err);
      setError(err.response?.data?.message || "Unable to load watch history.");
    } finally {
      setLoading(false);
    }
  }, [sortOption, selectedPeriod]);

  useEffect(() => {
    fetchWatchHistory();
  }, [fetchWatchHistory]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchWatchHistory().finally(() => setIsRefreshing(false));
  }, [fetchWatchHistory]);

  const handleRemoveFromHistory = useCallback(async (videoId) => {
    try {
      await axios.delete(`/users/watch-history/${videoId}`);
      setHistory(prev => prev.filter(video => video._id !== videoId));
    } catch (err) {
      console.error("Error removing video from history:", err);
    }
  }, []);

  const clearAllHistory = useCallback(async () => {
    try {
      await axios.delete("/users/watch-history");
      setHistory([]);
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  }, []);

  const filteredHistory = history.filter(video => 
    video && (
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const gradientStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="py-6 sm:py-8 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={gradientStyle}
              >
                Watch History
              </motion.h1>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Your recently watched videos • {filteredHistory.length} videos
              </p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search your history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 sm:py-3.5 rounded-xl border text-sm sm:text-base ${
                theme === 'dark' 
                  ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                  : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Period:
            </span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors`}
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              View:
            </span>
            <div className={`flex rounded-lg p-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <button 
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm rounded-md transition-all flex items-center gap-2 ${
                  viewMode === "grid" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm transform scale-105" 
                    : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm rounded-md transition-all flex items-center gap-2 ${
                  viewMode === "list" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm transform scale-105" 
                    : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center gap-2 flex-1">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Sort:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className={`flex-1 sm:flex-initial ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors`}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
              theme === 'dark' 
                ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
                : 'bg-white hover:bg-gray-50 border border-gray-200'
            } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              className="flex justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <LoadingSpinner size={48} />
                <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading your history...
                </p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              className="py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ErrorMessage 
                message={error}
                onRetry={handleRefresh}
              />
            </motion.div>
          ) : filteredHistory.length === 0 ? (
            <motion.div 
              key="empty"
              className="py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EmptyState
                title={searchQuery ? "No videos found" : "Your History is Empty"}
                description={
                  searchQuery 
                    ? `No videos match "${searchQuery}" in your history`
                    : "Videos you watch will appear here"
                }
                actions={
                  searchQuery ? (
                    <SecondaryButton onClick={() => setSearchQuery("")}>
                      Clear Search
                    </SecondaryButton>
                  ) : null
                }
              />
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {filteredHistory.map((video) => (
                <motion.div
                  key={video._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <HistoryCard video={video} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="space-y-3 sm:space-y-4"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.03,
                  },
                },
              }}
            >
              {filteredHistory.map((video) => (
                <motion.div
                  key={video._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <VideoListCard 
                    video={video} 
                    theme={theme} 
                    onRemove={handleRemoveFromHistory}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {filteredHistory.length > 0 && (
          <motion.div 
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex gap-3">
              <SecondaryButton 
                onClick={handleRefresh} 
                className="px-6 py-2"
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing..." : "Refresh History"}
              </SecondaryButton>
              <PrimaryButton 
                onClick={() => setShowClearConfirm(true)}
                className="px-6 py-2"
              >
                Clear All History
              </PrimaryButton>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {filteredHistory.length} of {history.length} videos
            </p>
          </motion.div>
        )}
      </div>

      {/* Clear History Confirmation Dialog */}
      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearAllHistory}
        title="Clear Watch History?"
        description="This will permanently remove all videos from your watch history. This action cannot be undone."
        confirmLabel="Clear History"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default History;