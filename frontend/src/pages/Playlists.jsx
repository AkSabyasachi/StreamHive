import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import PlaylistCard from "../components/common/PlaylistCard";
import VideoSkeleton from "../components/common/videoSkeleton";
import Modal from "../components/common/Modal";
import PlaylistForm from "../components/common/PlaylistForm";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  // Fetch user playlists
  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/playlist/user/my");
      setPlaylists(data?.data || []);
    } catch (error) {
      toast.error("Failed to load playlists.");
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // CREATE
  const handleCreate = async (formData) => {
    try {
      setCreating(true);
      const { data } = await axios.post("/playlist", formData);
      setPlaylists((prev) => [data.data, ...prev]);
      setShowCreateModal(false);
      toast.success("Playlist created!");
    } catch (err) {
      console.error("Error creating playlist:", err);
      toast.error("Failed to create playlist.");
    } finally {
      setCreating(false);
    }
  };

  // EDIT
  const handleEditClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowEditModal(true);
  };

  const handleEdit = async (formData) => {
    try {
      setUpdating(true);
      await axios.patch(`/playlist/${selectedPlaylist._id}`, formData);
      toast.success("Playlist updated!");
      setShowEditModal(false);
      setSelectedPlaylist(null);
      fetchPlaylists();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update playlist.");
    } finally {
      setUpdating(false);
    }
  };

  // DELETE
  const handleDeleteClick = (playlistId) => {
    setDeletingId(playlistId);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/playlist/${deletingId}`);
      toast.success("Playlist deleted.");
      setPlaylists((prev) => prev.filter((pl) => pl._id !== deletingId));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete playlist.");
    } finally {
      setShowConfirmDelete(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="py-6 px-4 min-h-[80vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          className="text-2xl font-semibold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Playlists
        </motion.h1>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          + Create Playlist
        </motion.button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No playlists found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist._id}
              playlist={playlist}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Playlist"
      >
        <PlaylistForm
          onSubmit={handleCreate}
          onClose={() => setShowCreateModal(false)}
          loading={creating}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPlaylist(null);
        }}
        title="Edit Playlist"
      >
        <PlaylistForm
          initialData={selectedPlaylist}
          onSubmit={handleEdit}
          onClose={() => setShowEditModal(false)}
          loading={updating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteConfirm}
        message="Are you sure you want to delete this playlist?"
      />
    </div>
  );
};

export default Playlists;
