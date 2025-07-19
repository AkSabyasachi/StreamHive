import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Video as VideoIcon,
  Grid,
  List,
  Search,
  X,
  ArrowUp,
  Flame
} from "lucide-react";
import axios from "../utils/axiosInstance";
import VideoCard from "../components/common/VideoCard";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import LoadingSpinner from "../components/common/LoadingSpinner";
import LoadingDots from "../components/common/LoadingDots";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

// New component for list view
const VideoListCard = ({ video, showOwner, showViews, showUploadTime, theme }) => {
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
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-40 h-24 rounded-xl object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>

      {/* Video Details */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {video.title}
        </h3>

        {showOwner && (
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
              <EyeIcon size={14} />
              {formatNumber(video.views)} views
            </span>
          )}
          {showUploadTime && (
            <span className={`text-xs flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock size={14} />
              {video.uploadedAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom icons for list view
const EyeIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const Home = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const categories = [
    { id: "all", name: "All Videos", icon: <VideoIcon size={16} />, color: "from-blue-500 to-indigo-500" },
    { id: "recent", name: "New Videos", icon: <Sparkles size={16} />, color: "from-purple-500 to-pink-500" },
    { id: "popular", name: "Most Viewed", icon: <Flame size={16} />, color: "from-orange-500 to-yellow-500" },
  ];

  const fetchVideos = useCallback(async (pageNum = 1, category = "all") => {
    try {
      setLoading(pageNum === 1);
      setError("");
      
      // Determine sort parameter and direction based on category
      let sortParam = "-createdAt"; // Default: newest first
      if (category === "popular") {
        sortParam = "-views"; // Descending order by views
      }
      
      const res = await axios.get(`/videos?page=${pageNum}&limit=12&category=${category}&sort=${sortParam}`);
      const { videos, totalPages: tp } = res.data.data;
      setVideos(videos);
      setTotalPages(tp);
      setPage(pageNum);
      setActiveCategory(category);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load videos. Please try again later.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(1, activeCategory);
  }, [fetchVideos, activeCategory]);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRetry = useCallback(() => fetchVideos(page, activeCategory), [fetchVideos, page, activeCategory]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchVideos(page, activeCategory);
  }, [fetchVideos, page, activeCategory]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        fetchVideos(newPage, activeCategory);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [fetchVideos, totalPages, activeCategory]
  );

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    fetchVideos(1, categoryId);
  }, [fetchVideos]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.owner.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading State
  if (loading && !isRefreshing) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300 p-4`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <LoadingSpinner size="lg" />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`mt-6 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Loading videos...
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4"
          >
            <LoadingDots />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error && !videos.length) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300 p-4`}>
        <ErrorMessage 
          title="Oops, something went wrong"
          message={error}
          icon={<AlertCircle size={48} className="text-red-500 mx-auto" />}
          actions={
            <div className="flex gap-3">
              <SecondaryButton onClick={() => window.location.reload()}>
                Reload Page
              </SecondaryButton>
              <PrimaryButton onClick={handleRetry}>Try Again</PrimaryButton>
            </div>
          }
          className="max-w-md w-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Discover Amazing Content
            </span>
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore videos from talented creators around the world
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search videos or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } transition-colors`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* View Mode & Refresh */}
          <div className="flex items-center gap-3">
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

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-3 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              } border transition-colors`}
              title="Refresh content"
            >
              {isRefreshing ? <LoadingDots /> : <RefreshCw size={18} />}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg shadow-blue-500/25`
                  : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category.icon}
              {category.name}
            </motion.button>
          ))}
        </div>

        {/* Videos Grid/List */}
        <AnimatePresence mode="wait">
          {filteredVideos.length > 0 ? (
            <motion.div
              key={`${activeCategory}-${viewMode}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
                  : "space-y-4 mb-12"
              }
            >
              {filteredVideos.map((video) => (
                <motion.div 
                  key={video._id} 
                  variants={itemVariants}
                  className={viewMode === "list" ? "w-full" : ""}
                >
                  {viewMode === "grid" ? (
                    <VideoCard 
                      video={video} 
                      showOwner 
                      showViews={activeCategory === 'popular'}
                      showUploadTime={activeCategory === 'recent' || activeCategory === 'all'}
                    />
                  ) : (
                    <VideoListCard 
                      video={video}
                      showOwner
                      showViews={activeCategory === 'popular'}
                      showUploadTime={activeCategory === 'recent' || activeCategory === 'all'}
                      theme={theme}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <EmptyState
                title="No videos found"
                description={
                  searchQuery
                    ? `No videos match "${searchQuery}". Try different keywords.`
                    : "There are no videos in this category. Try another category or check back later."
                }
                icon={
                  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4`}>
                    <VideoIcon size={40} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                }
                actions={
                  <div className="flex gap-3">
                    <SecondaryButton onClick={() => setSearchQuery("")}>
                      Clear Search
                    </SecondaryButton>
                    <PrimaryButton onClick={() => handleCategoryChange("all")}>
                      View All Videos
                    </PrimaryButton>
                  </div>
                }
                className={`py-16 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && filteredVideos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <PrimaryButton
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-6 py-3"
                Icon={ChevronLeft}
                iconPosition="left"
              >
                Previous
              </PrimaryButton>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-12 h-12 rounded-full font-medium transition-all duration-300 ${
                        pageNum === page
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                          : theme === 'dark'
                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>...</span>
                )}
                {totalPages > 5 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className={`w-12 h-12 rounded-full font-medium ${
                      page === totalPages
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                        : theme === 'dark'
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
              </div>
              
              <PrimaryButton
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-6 py-3"
                Icon={ChevronRight}
                iconPosition="right"
              >
                Next
              </PrimaryButton>
            </div>
            
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2`}>
              <span>Page {page} of {totalPages}</span>
              <span>•</span>
              <span>{filteredVideos.length} videos</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
            title="Scroll to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;