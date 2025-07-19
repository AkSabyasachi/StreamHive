import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCw, Sparkles, ChevronLeft, ChevronRight, ArrowUp, Search, X } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import CommunityPost from "../components/channel/CommunityPost";
import CreateCommunityPost from "../components/channel/CreateCommunityPost";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import LoadingDots from "../components/common/LoadingDots";
import Modal from "../components/common/Modal";
import { useTheme } from "../context/ThemeContext";

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

const Community = () => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      setError("");
      const res = await axiosInstance.get(
        `/community?page=${pageNum}&limit=10&sortBy=${sortBy === "recent" ? "createdAt" : "likes"}`
      );
      setPosts(res.data?.data?.posts || []);
      setTotalPages(res.data?.data?.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load posts. Please try again.");
      console.error("Error fetching community posts", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setShowCreateModal(false);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPosts(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchPosts(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading State
  if (loading && !isRefreshing) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300 p-4`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading community posts...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !posts.length) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300 p-4`}>
        <EmptyState 
          title="Couldn't load posts"
          description={error}
          icon={<div className="bg-red-500/20 p-4 rounded-full">
            <div className="bg-red-500 text-white p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>}
          actions={
            <div className="flex gap-3 mt-6">
              <SecondaryButton onClick={() => window.location.reload()}>
                Reload Page
              </SecondaryButton>
              <PrimaryButton onClick={() => fetchPosts(1)}>
                Try Again
              </PrimaryButton>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Community Hub
            </h1>
            <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <Sparkles size={16} />
              {posts.length} posts • Sorted by {sortBy === 'recent' ? 'Most Recent' : 'Most Popular'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} px-4 py-2 rounded-full text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Page {page} of {totalPages}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
              aria-label="Refresh posts"
            >
              {isRefreshing ? (
                <LoadingDots size="sm" />
              ) : (
                <RefreshCw size={18} />
              )}
            </button>
            <PrimaryButton
              icon={<Plus />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Post
            </PrimaryButton>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Sort by:</span>
            <div className={`flex items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-full p-1`}>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                  sortBy === 'recent'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Most Recent
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                  sortBy === 'popular'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Most Popular
              </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <AnimatePresence mode="wait">
          {posts.length > 0 ? (
            <motion.div
              key={`${page}-${sortBy}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6 mb-12"
            >
              {posts.map((post) => (
                <motion.div key={post._id} variants={itemVariants}>
                  <CommunityPost
                    post={post}
                    onDelete={handlePostDeleted}
                    onPostUpdated={handlePostUpdated}
                  />
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
                title="No community posts yet"
                description="Be the first to share something with the community!"
                icon={
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    <Plus size={32} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                }
                action={
                  <PrimaryButton onClick={() => setShowCreateModal(true)}>
                    Create First Post
                  </PrimaryButton>
                }
                className={`py-16 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && posts.length > 0 && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <PrimaryButton
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
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
                        pageNum === page
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
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
              >
                Next <ChevronRight size={16} />
              </PrimaryButton>
            </div>
            
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing page {page} of {totalPages} • {posts.length} posts
            </p>
          </div>
        )}

        {/* Create Post Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Post"
          size="lg"
        >
          <CreateCommunityPost 
            onPostCreated={handlePostCreated}
            onClose={() => setShowCreateModal(false)}
          />
        </Modal>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
              title="Scroll to top"
            >
              <ArrowUp size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Community;