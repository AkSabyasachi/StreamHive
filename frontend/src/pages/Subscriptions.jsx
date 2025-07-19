// src/pages/Subscriptions.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserX,
  ChevronLeft,
  ChevronRight,
  Users,
  Search,
  X,
  Grid,
  List,
  RefreshCw,
  AlertCircle,
  UserPlus,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUp,
  CalendarDays,
  Filter,
  Flame,
  Video as VideoIcon,
  Home
} from "lucide-react";
import axios from "../utils/axiosInstance";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import LoadingDots from "../components/common/LoadingDots";
import ErrorMessage from "../components/common/ErrorMessage";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const ITEMS_PER_PAGE = 12;

// Animation Variants
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
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const Subscriptions = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [channelToUnsub, setChannelToUnsub] = useState(null);
  const [unsubscribing, setUnsubscribing] = useState(false);

  // Filtered and paginated channels
  const filteredChannels = useMemo(() => {
    let filtered = channels;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(({ channel }) =>
        channel.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.fullname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [channels, searchQuery]);

  const paginatedChannels = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredChannels.slice(startIndex, endIndex);
  }, [filteredChannels, page]);

  // Calculate total pages
  useEffect(() => {
    setTotalPages(Math.ceil(filteredChannels.length / ITEMS_PER_PAGE));
  }, [filteredChannels.length]);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSubscribedChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const { data: userRes } = await axios.get("/users/current-user");
      const userId = userRes?.data?._id;

      if (!userId) {
        throw new Error("User not found");
      }

      const { data: subsRes } = await axios.get(`/subscription/u/${userId}`);
      const channelsData = subsRes?.data || [];
      
      setChannels(channelsData);
    } catch (err) {
      console.error("Error fetching subscribed channels:", err);
      setError("Failed to load subscriptions. Please try again later.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribedChannels();
  }, [fetchSubscribedChannels]);

  const handleRetry = useCallback(() => fetchSubscribedChannels(), [fetchSubscribedChannels]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchSubscribedChannels();
  }, [fetchSubscribedChannels]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [totalPages]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmUnsubscribe = (channel) => {
    setChannelToUnsub(channel);
    setShowConfirm(true);
  };

  const handleUnsubscribe = async () => {
    if (!channelToUnsub) return;

    try {
      setUnsubscribing(true);
      await axios.post(`/subscription/ch/${channelToUnsub._id}`);
      
      setChannels((prev) =>
        prev.filter((ch) => ch.channel._id !== channelToUnsub._id)
      );
      
    } catch (err) {
      console.error("Unsubscribe failed:", err);
      setError("Failed to unsubscribe. Please try again.");
    } finally {
      setUnsubscribing(false);
      setShowConfirm(false);
      setChannelToUnsub(null);
    }
  };

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
            transition={{ delay: 0.5 }}
            className={`mt-6 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Loading your subscriptions...
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4"
          >
            <LoadingDots />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error && !channels.length) {
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
              Your Subscriptions
            </span>
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-2`}>
            <Users size={20} />
            Follow your favorite creators and never miss their content
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
                placeholder="Search channels or creators..."
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
            >
              {isRefreshing ? <LoadingDots /> : <RefreshCw size={18} />}
            </button>
          </div>
        </div>

        {/* Channels Grid */}
        <AnimatePresence mode="wait">
          {paginatedChannels.length > 0 ? (
            <motion.div
              key={viewMode}
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
              {paginatedChannels.map(({ channel }) => (
                <motion.div 
                  key={channel._id} 
                  variants={itemVariants}
                  className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    viewMode === "list" ? 'flex items-center justify-between p-4' : 'p-6'
                  }`}
                >
                  <Link
                    to={`/channel/${channel.username}`}
                    className={`flex items-center gap-4 ${viewMode === "list" ? 'flex-1' : 'mb-4'}`}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex-shrink-0 p-0.5">
                      <img
                        src={channel.avatar || "/default-avatar.png"}
                        alt={channel.username}
                        className="w-full h-full object-cover rounded-full"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-lg ${theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors`}>
                        {channel.fullname}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        @{channel.username}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1 mt-1`}>
                        <Users size={12} />
                        {(channel.subscriberCount || 0).toLocaleString()} subscribers
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1 mt-1`}>
                        <VideoIcon size={12} />
                        {(channel.videoCount || 0).toLocaleString()} videos
                      </div>
                    </div>
                  </Link>
                  
                  <SecondaryButton
                    onClick={() => confirmUnsubscribe(channel)}
                    className={`text-sm px-4 py-2 border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 transition-all duration-200 ${
                      unsubscribing ? 'opacity-50 cursor-not-allowed' : ''
                    } ${theme === 'dark' ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
                    disabled={unsubscribing}
                  >
                    <UserX size={16} className="mr-1" />
                    {viewMode === "grid" ? "Unsubscribe" : ""}
                  </SecondaryButton>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {channels.length === 0 && !searchQuery ? (
                // No subscriptions at all
                <div className="flex flex-col items-center justify-center py-12">
                  <EmptyState
                    title="No Subscriptions Yet"
                    description="You haven't subscribed to any channels. Explore creators and start following your favorites!"
                    className={`py-16 w-full max-w-2xl mx-auto ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'}`}
                    actions={
                      <div className="flex flex-wrap gap-3 justify-center">
                        <PrimaryButton onClick={() => navigate("/explore")} className="flex items-center gap-2">
                          <Flame size={18} />
                          Explore Creators
                        </PrimaryButton>
                        <SecondaryButton onClick={() => navigate("/")} className="flex items-center gap-2">
                          <Home size={18} />
                          Go to Home
                        </SecondaryButton>
                      </div>
                    }
                  />
                </div>
              ) : (
                // Search returned no results
                <EmptyState
                  title={`No channels match "${searchQuery}"`}
                  description="Try different keywords or clear your search to see all your subscriptions."
                  className={`py-16 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} w-full max-w-2xl mx-auto`}
                  actions={
                    <div className="flex gap-3">
                      <SecondaryButton onClick={() => setSearchQuery("")}>
                        Clear Search
                      </SecondaryButton>
                      <PrimaryButton onClick={() => navigate("/explore")}>
                        Explore Creators
                      </PrimaryButton>
                    </div>
                  }
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
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
              <span>Showing page {page} of {totalPages}</span>
              <span>•</span>
              <span>{paginatedChannels.length} channels</span>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleUnsubscribe}
        title="Unsubscribe from Channel?"
        description={`Are you sure you want to unsubscribe from @${
          channelToUnsub?.username || ""
        }? You'll stop receiving notifications from this channel.`}
        confirmLabel={unsubscribing ? "Unsubscribing..." : "Yes, Unsubscribe"}
        cancelLabel="Cancel"
        loading={unsubscribing}
      />
    </div>
  );
};

export default Subscriptions;