import React, { useState, useEffect, useCallback } from "react";
import CreateCommunityPostModal from "../components/channel/CreateCommunityPostModal";
import CommunityPost from "../components/channel/CommunityPost";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { Search, RefreshCcw, ArrowUp, ArrowDown, X, Calendar, Plus } from "lucide-react";
import { FiAlertCircle } from "react-icons/fi";

const ITEMS_PER_PAGE = 10;

const MyCommunityPosts = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get(`/community/user/${user._id}`, {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE
        }
      });
      
      // Handle the new response structure
      const responseData = response.data.data;
      if (responseData && responseData.posts) {
        setPosts(responseData.posts);
        setTotalPosts(responseData.totalPosts);
        setTotalPages(responseData.totalPages);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load posts");
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, currentPage]);

  useEffect(() => {
    if (user?._id) {
      fetchPosts();
    }
  }, [user, fetchPosts, currentPage]);

  const handleDelete = async (postId) => {
    try {
      setDeleting(true);
      await axiosInstance.delete(`/community/${postId}`);
      // Refresh posts after deletion
      fetchPosts();
      toast.success("Post deleted");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleCreate = (newPost) => {
    // Refresh posts to include the new one
    fetchPosts();
  };

  const handleUpdate = (updatedPost) => {
    // Refresh posts to show updates
    fetchPosts();
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [totalPages]);

  // Loading State
  if (loading && !isRefreshing) {
    return (
      <div className={`min-h-[80vh] flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300 p-4`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading your posts...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !posts.length) {
    return (
      <div className={`min-h-[80vh] flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300 p-4`}>
        <div className="max-w-md w-full text-center">
          <FiAlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Oops, something went wrong
          </h2>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
          <div className="flex justify-center gap-3">
            <SecondaryButton onClick={() => window.location.reload()} className="px-6">
              Reload Page
            </SecondaryButton>
            <PrimaryButton onClick={fetchPosts}>Try Again</PrimaryButton>
          </div>
        </div>
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
              Your Community Posts
            </h1>
            <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <Calendar size={16} />
              Showing {posts.length} of {totalPosts} posts
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
              aria-label="Refresh posts"
            >
              {isRefreshing ? (
                <RefreshCcw className="animate-spin" size={18} />
              ) : (
                <RefreshCcw size={18} />
              )}
            </button>
            <PrimaryButton
              icon={<Plus />}
              onClick={() => setShowCreateModal(true)}
            >
              New Post
            </PrimaryButton>
          </div>
        </div>

        {/* Content */}
        {posts.length > 0 ? (
          <>
            <div className="space-y-4 mb-12">
          {posts.map((post) => (
            <div 
              key={post._id}
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
            >
              <CommunityPost
                post={post}
                editable
                onEdit={() => setEditingPost(post)}
                onDelete={() => setConfirmDeleteId(post._id)}
              />
              
              {/* Add action buttons */}
              <div className="p-4 flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700">
                <SecondaryButton 
                  onClick={() => setEditingPost(post)}
                  className="px-4 py-2"
                >
                  Edit Post
                </SecondaryButton>
                <PrimaryButton 
                  onClick={() => setConfirmDeleteId(post._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700"
                >
                  Delete Post
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <PrimaryButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-full"
                  >
                    Previous
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
                    Next
                  </PrimaryButton>
                </div>
                
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing page {currentPage} of {totalPages} • {posts.length} posts
                </p>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title={"No Posts Yet"}
            description={
              "Start a conversation with your audience by creating your first post"
            }
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
        )}

        {/* Create Post Modal */}
        <CreateCommunityPostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handleCreate}
        />

        {/* Edit Post Modal */}
        <CreateCommunityPostModal
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          initialData={editingPost}
          onPostUpdated={handleUpdate}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
          title="Delete Post?"
          description="Are you sure you want to delete this community post? This action cannot be undone."
          confirmLabel={deleting ? "Deleting..." : "Delete Post"}
          cancelLabel="Cancel"
          loading={deleting}
        />
      </div>
    </div>
  );
};

export default MyCommunityPosts;