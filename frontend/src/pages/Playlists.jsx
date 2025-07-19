import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../utils/axiosInstance";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  LayoutGrid, 
  List, 
  RefreshCcw, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Sparkles,
  X,
  Eye,
  Filter
} from "lucide-react";
import { FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import PlaylistCard from "../components/common/PlaylistCard";
import Modal from "../components/common/Modal";
import PlaylistForm from "../components/common/PlaylistForm";
import ConfirmDialog from "../components/common/ConfirmDialog";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import LoadingDots from "../components/common/LoadingDots";
import ErrorMessage from "../components/common/ErrorMessage";
import { useTheme } from "../context/ThemeContext";

const ITEMS_PER_PAGE = 12;
const SORT_OPTIONS = {
  ALPHABETICAL: 'alphabetical',
  RECENT: 'recent',
  VIDEO_COUNT: 'videoCount'
};

const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

// Filter categories similar to Home page
const filterCategories = [
  { id: "all", name: "All Playlists", icon: <Video size={16} />, color: "from-blue-500 to-indigo-500" },
  { id: "recent", name: "Recent", icon: <Clock size={16} />, color: "from-purple-500 to-pink-500" },
  { id: "popular", name: "Most Videos", icon: <Sparkles size={16} />, color: "from-orange-500 to-yellow-500" },
];

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

const Playlists = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.RECENT);
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const totalPages = Math.ceil(filteredPlaylists.length / ITEMS_PER_PAGE);
  
  const paginatedPlaylists = useMemo(() => {
    return filteredPlaylists.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredPlaylists, currentPage]);

  const sortPlaylists = useCallback((playlistsToSort) => {
    const sorted = [...playlistsToSort].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case SORT_OPTIONS.ALPHABETICAL:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case SORT_OPTIONS.RECENT:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case SORT_OPTIONS.VIDEO_COUNT:
          aValue = a.videos?.length || 0;
          bValue = b.videos?.length || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return sorted;
  }, [sortBy, sortOrder]);

  const filterAndSortPlaylists = useCallback(() => {
    let filtered = playlists;

    // Apply category filter
    if (activeFilter === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(playlist => 
        new Date(playlist.createdAt) >= thirtyDaysAgo
      );
    } else if (activeFilter === "popular") {
      filtered = filtered.filter(playlist => 
        (playlist.videos?.length || 0) >= 5
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(playlist =>
        playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        playlist.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered = sortPlaylists(filtered);
    
    setFilteredPlaylists(filtered);
    setCurrentPage(1);
  }, [playlists, searchTerm, sortPlaylists, activeFilter]);

  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/playlist/user/my");
      
      const playlistsWithVideos = data.data.map(playlist => ({
        ...playlist,
        videos: playlist.videos?.items || playlist.videos || []
      }));
      
      setPlaylists(playlistsWithVideos);
    } catch (err) {
      setError("Failed to load playlists");
      console.error("Error fetching playlists:", err);
      toast.error(err.response?.data?.message || "Failed to load playlists");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  useEffect(() => {
    filterAndSortPlaylists();
  }, [filterAndSortPlaylists]);

  const handleRetry = useCallback(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleCreate = async (formData) => {
    try {
      const { data } = await axios.post("/playlist", formData);
      fetchPlaylists();
      setShowCreateModal(false);
      toast.success("Playlist created!");
    } catch (err) {
      console.error("Error creating playlist:", err);
      toast.error(err.response?.data?.message || "Failed to create playlist");
    }
  };

  const handleEdit = async (formData) => {
    if (!selectedPlaylist) return;
    
    try {
      await axios.patch(`/playlist/${selectedPlaylist._id}`, formData);
      fetchPlaylists();
      setShowEditModal(false);
      setSelectedPlaylist(null);
      toast.success("Playlist updated!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update playlist");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    
    try {
      setDeleting(true);
      await axios.delete(`/playlist/${deletingId}`);
      setPlaylists(prev => prev.filter(pl => pl._id !== deletingId));
      toast.success("Playlist deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete playlist");
    } finally {
      setShowConfirmDelete(false);
      setDeletingId(null);
      setDeleting(false);
    }
  };

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [totalPages]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlists/${playlist._id}`);
  };

  const renderPlaylistListItem = (playlist) => {
    // Use the first video's thumbnail if available
    const firstVideoThumbnail = playlist.videos?.length > 0 
      ? playlist.videos[0].thumbnail 
      : null;
    
    return (
      <motion.div
        key={playlist._id}
        variants={itemVariants}
        className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group ${
          theme === 'dark' ? 'bg-gray-800/80 border border-gray-700/50 hover:border-gray-600/50' : 'bg-white border border-gray-200/50 hover:border-gray-300/50'
        }`}
      >
        <div 
          className="flex items-center justify-between p-4 gap-4"
          onClick={() => handlePlaylistClick(playlist)}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Thumbnail - use first video's thumbnail */}
            <div className="relative w-32 h-20 sm:w-40 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
              {firstVideoThumbnail ? (
                <img
                  src={firstVideoThumbnail}
                  alt={playlist.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
                  <Video size={20} className="text-white" />
                </div>
              )}
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                {playlist.videos?.length || 0} videos
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-base truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 transition-colors`}>
                {playlist.title}
              </div>
              <div className={`text-sm mt-1 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {playlist.description || "No description"}
              </div>
              <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-2`}>
                <Calendar size={14} />
                <span>
                  Created {new Date(playlist.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setSelectedPlaylist(playlist);
                setShowEditModal(true);
              }}
              className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              title="Edit playlist"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => {
                setDeletingId(playlist._id);
                setShowConfirmDelete(true);
              }}
              className={`p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors`}
              title="Delete playlist"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Loading State
  if (loading && !isRefreshing) {
    return (
      <div className={`min-h-[80vh] flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300 p-4`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading your playlists...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !playlists.length) {
    return (
      <div className={`min-h-[80vh] flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300 p-4`}>
        <ErrorMessage 
          title="Oops, something went wrong"
          message={error}
          icon={<FiAlertCircle size={48} className="text-red-500" />}
          actions={
            <>
              <SecondaryButton onClick={() => window.location.reload()} className="px-6">
                Reload Page
              </SecondaryButton>
              <PrimaryButton onClick={handleRetry}>Try Again</PrimaryButton>
            </>
          }
          className="max-w-md w-full"
        />
      </div>
    );
  }

  // Gradient style for header title
  const gradientStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with gradient title */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                className="text-2xl sm:text-3xl font-bold mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={gradientStyle}
              >
                Your Playlists
              </motion.h1>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredPlaylists.length} of {playlists.length} playlists • {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} px-4 py-2 rounded-full text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-full ${
                  theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
                aria-label="Refresh playlists"
              >
                {isRefreshing ? (
                  <LoadingDots size="sm" />
                ) : (
                  <RefreshCcw size={18} />
                )}
              </button>
              <PrimaryButton
                icon={<Plus />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Playlist
              </PrimaryButton>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 sm:py-3.5 rounded-xl border text-sm sm:text-base ${
                theme === 'dark' 
                  ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                  : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Filter:
            </span>
            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => handleFilterChange(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                    activeFilter === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg shadow-blue-500/25`
                      : theme === 'dark'
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              View:
            </span>
            <div className={`flex rounded-lg p-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <button 
                onClick={() => setViewMode(VIEW_MODES.GRID)}
                className={`px-3 py-2 text-sm rounded-md transition-all flex items-center gap-2 ${
                  viewMode === VIEW_MODES.GRID 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm transform scale-105" 
                    : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button 
                onClick={() => setViewMode(VIEW_MODES.LIST)}
                className={`px-3 py-2 text-sm rounded-md transition-all flex items-center gap-2 ${
                  viewMode === VIEW_MODES.LIST 
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`flex-1 sm:flex-initial ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors`}
            >
              <option value={SORT_OPTIONS.ALPHABETICAL}>A-Z</option>
              <option value={SORT_OPTIONS.RECENT}>Recent</option>
              <option value={SORT_OPTIONS.VIDEO_COUNT}>Video Count</option>
            </select>
            
            <button
              onClick={toggleSortOrder}
              className={`p-2 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                  : 'bg-white border-gray-200 hover:bg-gray-100'
              } border rounded-lg transition-all duration-200`}
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </button>
          </div>
        </div>

        {/* Content */}
        {paginatedPlaylists.length > 0 ? (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === VIEW_MODES.GRID
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
                  : "flex flex-col gap-4 mb-12"
              }
            >
              {paginatedPlaylists.map(playlist => (
                viewMode === VIEW_MODES.GRID ? (
                  <PlaylistCard
                    key={playlist._id}
                    playlist={playlist}
                    onEdit={() => {
                      setSelectedPlaylist(playlist);
                      setShowEditModal(true);
                    }}
                    onDelete={() => {
                      setDeletingId(playlist._id);
                      setShowConfirmDelete(true);
                    }}
                  />
                ) : (
                  renderPlaylistListItem(playlist)
                )
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <PrimaryButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-full"
                  >
                    <ChevronLeft size={16} /> Previous
                  </PrimaryButton>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-full font-medium transition-all
                          ${
                            pageNum === currentPage
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                              : theme === 'dark'
                                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }
                        `}
                        aria-label={`Go to page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  
                  <PrimaryButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-full"
                  >
                    Next <ChevronRight size={16} />
                  </PrimaryButton>
                </div>
                
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing page {currentPage} of {totalPages} • {paginatedPlaylists.length} playlists
                </p>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title={searchTerm ? "No playlists found" : "No Playlists"}
            description={
              searchTerm
                ? `No playlists match your search "${searchTerm}"`
                : "You haven't created any playlists yet. Start organizing your favorite content!"
            }
            icon={
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                <Plus size={32} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            }
            action={
              searchTerm ? (
                <SecondaryButton onClick={() => setSearchTerm("")}>
                  Clear Search
                </SecondaryButton>
              ) : (
                <PrimaryButton onClick={() => setShowCreateModal(true)}>
                  Create First Playlist
                </PrimaryButton>
              )
            }
            className={`py-16 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
          />
        )}

        {/* Create Playlist Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Playlist"
          size="md"
        >
          <PlaylistForm
            onSubmit={handleCreate}
            onClose={() => setShowCreateModal(false)}
          />
        </Modal>

        {/* Edit Playlist Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPlaylist(null);
          }}
          title="Edit Playlist"
          size="md"
        >
          {selectedPlaylist && (
            <PlaylistForm
              initialData={selectedPlaylist}
              onSubmit={handleEdit}
              onClose={() => setShowEditModal(false)}
            />
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={showConfirmDelete}
          onClose={() => setShowConfirmDelete(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Playlist?"
          description={`Are you sure you want to delete the "${playlists.find(p => p._id === deletingId)?.title}" playlist? This action cannot be undone.`}
          confirmLabel={deleting ? "Deleting..." : "Delete Playlist"}
          cancelLabel="Cancel"
          loading={deleting}
        />
      </div>
    </div>
  );
};

export default Playlists;