// src/pages/PlaylistDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import VideoCard from "../components/common/VideoCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import PlaylistForm from "../components/common/PlaylistForm";
import Modal from "../components/common/Modal";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingEditData, setPendingEditData] = useState(null);

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
      await axios.delete(`/playlist/${playlistId}`);
      toast.success("Playlist deleted successfully");
      navigate("/playlists");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete playlist");
    }
  };

  const handleEdit = async () => {
    if (!pendingEditData) return;

    try {
      await axios.patch(`/playlist/${playlistId}`, pendingEditData);
      setShowEditModal(false);
      setShowEditConfirm(false);
      toast.success("Playlist updated");
      fetchPlaylist();
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update playlist");
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await axios.patch(`/playlist/${playlistId}/videos/${videoId}/remove`);
      toast.success("Video removed from playlist");
      fetchPlaylist();
    } catch (err) {
      console.error("Video remove failed", err);
      toast.error("Failed to remove video");
    }
  };

  const isOwner = playlist?.owner?._id === user?._id;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <motion.div
      className="py-6 px-4 min-h-[80vh]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">
            {playlist.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {playlist.description || "No description"}
          </p>
        </div>

        {isOwner && (
          <div className="flex gap-3">
            <SecondaryButton onClick={() => setShowEditModal(true)}>
              Edit
            </SecondaryButton>
            <PrimaryButton onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </PrimaryButton>
          </div>
        )}
      </div>

      {playlist.videos.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No videos in this playlist yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {playlist.videos.map((video) => (
            <motion.div
              key={video._id}
              className="relative"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <VideoCard video={video} />
              {isOwner && (
                <button
                  onClick={() => handleRemoveVideo(video._id)}
                  className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80"
                >
                  ✕
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm delete playlist */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this playlist?"
      />

      {/* Confirm update playlist */}
      <ConfirmDialog
        isOpen={showEditConfirm}
        onClose={() => {
          setShowEditConfirm(false);
          setPendingEditData(null);
        }}
        onConfirm={handleEdit}
        message="Are you sure you want to save these changes to the playlist?"
      />

      {/* Edit playlist form */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <PlaylistForm
          initialData={playlist}
          onSubmit={(data) => {
            setPendingEditData(data);
            setShowEditConfirm(true);
          }}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </motion.div>
  );
};

export default PlaylistDetail;
