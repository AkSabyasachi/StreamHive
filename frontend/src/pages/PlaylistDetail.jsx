// src/pages/PlaylistDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  FiEdit2,
  FiTrash2,
  FiX,
  FiPlus,
  FiUser,
  FiArrowLeft,
  FiCalendar,
  FiPlay,
  FiMoreVertical,
} from "react-icons/fi";

import VideoCard from "../components/common/VideoCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import PlaylistForm from "../components/common/PlaylistForm";
import Modal from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/playlist/${playlistId}`);
      setPlaylist(data?.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load playlist");
      navigate("/playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      await axios.delete(`/playlist/${playlistId}`);
      toast.success("Playlist deleted successfully");
      navigate("/playlists");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete playlist");
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = async (formData) => {
    try {
      setIsProcessing(true);
      await axios.patch(`/playlist/${playlistId}`, formData);
      setShowEditModal(false);
      toast.success("Playlist updated");
      fetchPlaylist();
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update playlist");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      setIsProcessing(true);
      await axios.patch(`/playlist/${playlistId}/videos/${videoId}/remove`);
      toast.success("Video removed from playlist");
      fetchPlaylist();
    } catch (err) {
      console.error("Video remove failed", err);
      toast.error("Failed to remove video");
    } finally {
      setIsProcessing(false);
    }
  };

  const isOwner = playlist?.owner?._id === user?._id;

  if (loading) {
    return (
      <div className={`min-h-[80vh] flex flex-col justify-center items-center px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <LoadingSpinner size="lg" />
        <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Loading playlist...
        </p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className={`min-h-[80vh] flex items-center justify-center px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <EmptyState
          title="Playlist not found"
          description="The playlist you're looking for doesn't exist or has been removed"
          action={
            <PrimaryButton onClick={() => navigate("/playlists")}>
              Browse Playlists
            </PrimaryButton>
          }
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate("/playlists")}
          className={`flex items-center gap-2 mb-6 px-3 py-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiArrowLeft size={20} />
          <span className="font-medium">Back to Playlists</span>
        </motion.button>

        {/* Playlist Header */}
        <motion.div
          className={`rounded-xl border shadow-lg p-4 sm:p-6 mb-8 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Thumbnail */}
            <div className="relative w-full lg:w-80 aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex-shrink-0">
              {playlist.videos && playlist.videos.length > 0 ? (
                <img
                  src={playlist.videos[0].thumbnail}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <FiPlay className="w-16 h-16 opacity-80" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-medium">
                    {playlist.videos?.length || 0} {playlist.videos?.length === 1 ? "video" : "videos"}
                  </span>
                  {playlist.videos && playlist.videos.length > 0 && (
                    <FiPlay className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Info + Actions */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                    {playlist.name}
                  </h1>
                  {isOwner && (
                    <div className="flex sm:hidden">
                      <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className={`p-2 rounded-lg ${
                          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <FiMoreVertical size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Dropdown */}
                {showMobileMenu && isOwner && (
                  <div className={`sm:hidden mb-4 rounded-lg border p-2 ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                        theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <FiEdit2 size={16} />
                      Edit Playlist
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FiTrash2 size={16} />
                      Delete Playlist
                    </button>
                  </div>
                )}

                <p className={`mb-6 leading-relaxed ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {playlist.description || "No description available"}
                </p>

                {/* Owner Info */}
                <div className="flex items-center gap-3 mb-6">
                  {playlist.owner?.avatar ? (
                    <img
                      src={playlist.owner.avatar}
                      alt={playlist.owner.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <FiUser className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/channel/${playlist.owner?._id}`}
                      className="font-medium hover:underline block truncate"
                    >
                      {playlist.owner?.username}
                    </Link>
                    <div className={`text-sm flex items-center gap-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <FiCalendar size={14} />
                      Created {new Date(playlist.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Actions */}
              {isOwner && (
                <div className="hidden sm:flex gap-3 mt-auto">
                  <SecondaryButton 
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2"
                  >
                    <FiEdit2 size={16} /> Edit
                  </SecondaryButton>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                  >
                    <FiTrash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Playlist Videos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Videos</h2>
            <span className={`text-sm px-3 py-1 rounded-full ${
              theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {playlist.videos?.length || 0} videos
            </span>
          </div>

          {!playlist.videos || playlist.videos.length === 0 ? (
            <EmptyState
              title="No videos in this playlist"
              description="This playlist is empty. Add some videos to get started!"
              icon={
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <FiPlay size={32} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                </div>
              }
              action={
                <Link to="/videos">
                  <PrimaryButton>Browse Videos</PrimaryButton>
                </Link>
              }
              className={`py-16 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {playlist.videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="relative group"
                >
                  <VideoCard
                    video={video}
                    showChannel={false}
                    className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl"
                  />
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveVideo(video._id)}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                      disabled={isProcessing}
                      title="Remove from playlist"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Delete Playlist Confirmation */}
        <ConfirmDialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Playlist?"
          description={`Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`}
          confirmLabel={isProcessing ? "Deleting..." : "Delete Playlist"}
          cancelLabel="Cancel"
          loading={isProcessing}
        />

        {/* Edit Playlist Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Playlist"
          size="md"
        >
          <PlaylistForm
            initialData={playlist}
            onSubmit={handleEdit}
            onClose={() => setShowEditModal(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default PlaylistDetail;