import React, { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { FaEye, FaHeart, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  Sparkles,
  Clock,
  Eye,
  ThumbsUp,
  List,
  Grid,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";

const ITEMS_PER_PAGE = 12;
const SORT_OPTIONS = {
  RECENT: "recent",
  VIEWS: "views",
  LIKES: "likes",
  TITLE: "title",
};

const gradientStyle = {
  background: "linear-gradient(135deg, #60a5fa 0%, #6366f1 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
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

const YourVideos = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.RECENT);
  const [sortOrder, setSortOrder] = useState("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);

  const paginatedVideos = useMemo(() => {
    return filteredVideos.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredVideos, currentPage]);

  const sortVideos = useCallback((videosToSort) => {
    const sorted = [...videosToSort].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case SORT_OPTIONS.VIEWS:
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        case SORT_OPTIONS.LIKES:
          aValue = a.likes || 0;
          bValue = b.likes || 0;
          break;
        case SORT_OPTIONS.TITLE:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case SORT_OPTIONS.RECENT:
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [sortBy, sortOrder]);

  const filterAndSortVideos = useCallback(() => {
    let filtered = videos;

    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered = sortVideos(filtered);

    setFilteredVideos(filtered);
    setCurrentPage(1);
  }, [videos, searchTerm, sortVideos]);

  const fetchUserVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axiosInstance.get("/videos/my");
      setVideos(data.data.videos || []);
    } catch (err) {
      console.error("Error fetching your videos", err);
      setError("Could not load your videos.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserVideos();
  }, [fetchUserVideos]);

  useEffect(() => {
    filterAndSortVideos();
  }, [filterAndSortVideos]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchUserVideos();
  }, [fetchUserVideos]);

  const togglePublish = async (videoId) => {
    try {
      setTogglingId(videoId);
      const { data } = await axiosInstance.patch(
        `/videos/${videoId}/toggle-publish`
      );
      setVideos((prev) =>
        prev.map((video) =>
          video._id === videoId
            ? { ...video, isPublished: data.data.isPublished }
            : video
        )
      );
    } catch (err) {
      console.error("Error toggling publish status", err);
      alert("Failed to toggle publish status.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = (video) => {
    setSelectedVideo(video);
    setShowDeleteDialog(true);
  };

  const deleteVideo = async () => {
    if (!selectedVideo) return;

    try {
      setDeletingId(selectedVideo._id);
      await axiosInstance.delete(`/videos/${selectedVideo._id}`);
      setVideos((prev) =>
        prev.filter((video) => video._id !== selectedVideo._id)
      );
    } catch (err) {
      console.error("Error deleting video", err);
      alert("Failed to delete video.");
    } finally {
      setDeletingId(null);
      setShowDeleteDialog(false);
      setSelectedVideo(null);
    }
  };

  const confirmEdit = (video) => {
    setSelectedVideo(video);
    setShowEditDialog(true);
  };

  const handleEdit = async () => {
    if (!selectedVideo) return;
    alert(`Edit feature coming soon! Would edit video: ${selectedVideo.title}`);
    setShowEditDialog(false);
    setSelectedVideo(null);
  };

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages]
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const renderGridCard = (video) => (
    <motion.div
      key={video._id}
      variants={itemVariants}
      className={`${
        theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full`}
    >
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
            video.isPublished
              ? "bg-green-600 text-white"
              : "bg-gray-600 text-gray-200"
          }`}
        >
          {video.isPublished ? "Published" : "Unpublished"}
        </div>
        {video.createdAt &&
          differenceInDays(new Date(), new Date(video.createdAt)) <= 7 && (
            <span className="absolute top-1 left-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> NEW
            </span>
          )}
      </div>

      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3
            className={`font-semibold text-lg line-clamp-2 mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {video.title}
          </h3>
          <p
            className={`text-sm line-clamp-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {video.description || "No description"}
          </p>
        </div>

        <div className="mt-4">
          <div
            className={`flex justify-between text-xs ${
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" /> {formatNumber(video.views || 0)}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" /> {formatNumber(video.likes || 0)}
              </span>
            </div>
            <span>
              {formatDistanceToNow(new Date(video.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center mt-4">
            <SecondaryButton
              onClick={() => togglePublish(video._id)}
              className={`flex items-center gap-1 text-sm ${
                video.isPublished
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-400 hover:bg-gray-500 text-white"
              }`}
              loading={togglingId === video._id}
            >
              {video.isPublished ? "Published" : "Unpublished"}
            </SecondaryButton>

            <div className="flex gap-2">
              <button
                className={`p-2 rounded-full ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-blue-400"
                    : "bg-gray-200 hover:bg-gray-300 text-blue-600"
                }`}
                onClick={() => confirmEdit(video)}
                title="Edit video"
              >
                <FaEdit size={14} />
              </button>
              <button
                className={`p-2 rounded-full ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-red-400"
                    : "bg-gray-200 hover:bg-gray-300 text-red-600"
                }`}
                onClick={() => confirmDelete(video)}
                title="Delete video"
                disabled={deletingId === video._id}
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderListItem = (video) => (
  <motion.div
    key={video._id}
    variants={itemVariants}
    className={`flex gap-4 items-start p-4 rounded-2xl transition-all ${
      theme === "dark" 
        ? "bg-gray-800/50 hover:bg-gray-700/50 border-gray-700" 
        : "bg-white hover:bg-gray-50 border-gray-200"
    } border shadow-sm hover:shadow-md`}
  >
    {/* Thumbnail Section */}
    <div className="flex-shrink-0 flex flex-col gap-3">
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-40 h-24 rounded-xl object-cover"
        />
        <div
          className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
            video.isPublished
              ? "bg-green-600 text-white"
              : "bg-gray-600 text-gray-200"
          }`}
        >
          {video.isPublished ? "Published" : "Unpublished"}
        </div>
        {video.createdAt &&
          differenceInDays(new Date(), new Date(video.createdAt)) <= 7 && (
            <span className="absolute top-1 left-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> NEW
            </span>
          )}
      </div>
      
      {/* Publish/Unpublish Button below thumbnail */}
      <SecondaryButton
        onClick={() => togglePublish(video._id)}
        className={`text-xs py-1.5 px-3 w-full ${
          video.isPublished
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-400 hover:bg-gray-500 text-white"
        }`}
        loading={togglingId === video._id}
      >
        {video.isPublished ? "Unpublish" : "Publish"}
      </SecondaryButton>
    </div>

    {/* Video Details */}
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="flex-1">
        <h3
          className={`font-semibold text-base line-clamp-2 mb-1 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {video.title}
        </h3>
        
        <p
          className={`text-sm line-clamp-2 mb-2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {video.description || "No description"}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`text-xs flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            <Eye className="w-3.5 h-3.5" />
            {formatNumber(video.views || 0)} views
          </span>
          <span className={`text-xs flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            <ThumbsUp className="w-3.5 h-3.5" />
            {formatNumber(video.likes || 0)} likes
          </span>
          <span className={`text-xs flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            <Clock className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(video.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* Edit and Delete Buttons - Side by side at bottom */}
      <div className="flex gap-2 mt-auto">
        <button
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs transition-colors ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          onClick={() => confirmEdit(video)}
        >
          Edit
        </button>
        <button
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs transition-colors ${
            theme === "dark"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          onClick={() => confirmDelete(video)}
          disabled={deletingId === video._id}
        >
          {deletingId === video._id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </motion.div>
);

  if (loading && !isRefreshing) {
    return (
      <div
        className={`min-h-[80vh] flex flex-col items-center justify-center ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        } transition-colors duration-300 p-4`}
      >
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p
            className={`mt-4 text-lg ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Loading your videos...
          </p>
        </div>
      </div>
    );
  }

  if (error && !videos.length) {
    return (
      <div
        className={`min-h-[80vh] flex items-center justify-center ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        } transition-colors duration-300 p-4`}
      >
        <ErrorMessage
          title="Oops, something went wrong"
          message={error}
          icon={<FiAlertCircle size={48} className="text-red-500" />}
          actions={
            <>
              <SecondaryButton
                onClick={() => window.location.reload()}
                className="px-6"
              >
                Reload Page
              </SecondaryButton>
              <PrimaryButton onClick={fetchUserVideos}>Try Again</PrimaryButton>
            </>
          }
          className="max-w-md w-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] py-8 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } transition-colors duration-300`}
    >
      <div className="w-full px-4 mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <motion.h1
              className="text-2xl sm:text-3xl font-bold mb-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={gradientStyle}
            >
              Your Videos
            </motion.h1>
            <p
              className={`text-xs sm:text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {filteredVideos.length} of {videos.length} videos
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            {/* Search bar */}
            <div className="relative flex-1">
              <FaSearch
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
                size={16}
              />
              <input
                type="text"
                placeholder="Search videos by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-sm ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-900"
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
              />
            </div>

            {/* Controls */}
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
                    <Grid className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
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
                    <List className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    List
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <label className="mr-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`bg-gray-100 dark:bg-gray-800 border-0 rounded-lg py-1.5 px-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  <option value={SORT_OPTIONS.RECENT}>Recent First</option>
                  <option value={SORT_OPTIONS.VIEWS}>Most Views</option>
                  <option value={SORT_OPTIONS.LIKES}>Most Likes</option>
                  <option value={SORT_OPTIONS.TITLE}>Title A-Z</option>
                </select>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-full ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-colors`}
                aria-label="Refresh videos"
              >
                {isRefreshing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {paginatedVideos.length > 0 ? (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8"
                  : "space-y-3 sm:space-y-4 mb-8"
              }
            >
              {paginatedVideos.map((video) =>
                viewMode === "grid" ? renderGridCard(video) : renderListItem(video)
              )}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <PrimaryButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm rounded-lg"
                  >
                    <ChevronLeft size={16} /> Previous
                  </PrimaryButton>

                  <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                            pageNum === currentPage
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                              : theme === "dark"
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          aria-label={`Go to page ${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  <PrimaryButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm rounded-lg"
                  >
                    Next <ChevronRight size={16} />
                  </PrimaryButton>
                </div>

                <p
                  className={`text-xs sm:text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Page {currentPage} of {totalPages} • {paginatedVideos.length} videos
                </p>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title={searchTerm ? "No videos found" : "No Videos Uploaded"}
            description={
              searchTerm
                ? `No videos match your search "${searchTerm}"`
                : "You haven't uploaded any videos yet. Start sharing your content with the world!"
            }
            icon={
              <div
                className={`${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                } rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}
              >
                <Sparkles
                  size={32}
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>
            }
            action={
              searchTerm ? (
                <SecondaryButton onClick={() => setSearchTerm("")}>
                  Clear Search
                </SecondaryButton>
              ) : (
                <PrimaryButton
                  onClick={() => (window.location.href = "/upload")}
                >
                  Upload Your First Video
                </PrimaryButton>
              )
            }
            className={`py-16 rounded-2xl ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          />
        )}
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={deleteVideo}
        title="Delete Video?"
        description={`Are you sure you want to delete "${selectedVideo?.title}"? This action cannot be undone.`}
        confirmLabel={deletingId ? "Deleting..." : "Delete Video"}
        cancelLabel="Cancel"
        loading={!!deletingId}
      />

      <ConfirmDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onConfirm={handleEdit}
        title="Edit Video?"
        description={`You are about to edit "${selectedVideo?.title}". Are you sure you want to continue?`}
        confirmLabel="Edit Video"
        cancelLabel="Cancel"
        confirmVariant="primary"
      />
    </div>
  );
};

export default YourVideos;