import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import FormInput from "./FormInput";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import LoadingSpinner from "./LoadingSpinner";
import axios from "../../utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaPlus, FaMusic, FaTimes } from "react-icons/fa";
import { FiPlay } from "react-icons/fi";

// Helper to get the latest video object
function getLatestVideo(videos) {
  if (!Array.isArray(videos) || !videos.length) return null;
  if (videos[0]?.createdAt) {
    return [...videos].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
  }
  return videos[videos.length - 1];
}

const AddToPlaylistModal = ({ isOpen, onClose, videoId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPlaylists = async () => {
    try {
      const { data } = await axios.get("/playlist/user/my");
      setPlaylists(data?.data || []);
    } catch (err) {
      console.error("Failed to fetch playlists", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchPlaylists().finally(() => setLoading(false));
      setCreating(false);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  const toggleVideoInPlaylist = async (playlistId, hasVideo) => {
    try {
      setActionLoadingId(playlistId);
      if (hasVideo) {
        await axios.patch(`/playlist/${playlistId}/videos/${videoId}/remove`);
      } else {
        await axios.patch(`/playlist/${playlistId}/videos/${videoId}/add`, {
          videoId,
        });
      }
      setSuccessMessage(hasVideo ? "Removed from playlist" : "Added to playlist");
      
      // Update the playlists state to reflect the change
      setPlaylists((prev) =>
        prev.map((p) =>
          p._id === playlistId
            ? {
                ...p,
                videos: hasVideo
                  ? p.videos.filter((v) => (v._id || v) !== videoId)
                  : [...p.videos, { _id: videoId }],
              }
            : p
        )
      );
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      console.error("Error updating playlist:", err);
      setError("Failed to update playlist");
      setTimeout(() => setError(""), 3000);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError("Playlist name is required");
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.post("/playlist", {
        name: newPlaylistName,
        description: newPlaylistDesc,
        videos: [videoId],
      });
      setPlaylists((prev) => [...prev, data.data]);
      setCreating(false);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setError("");
      setSuccessMessage("Playlist created successfully");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if video is in playlist
  const isVideoInPlaylist = (playlist) => {
    if (!playlist.videos || !Array.isArray(playlist.videos)) return false;
    return playlist.videos.some((v) => {
      // Handle both object format {_id: "..."} and string format "..."
      const id = typeof v === 'string' ? v : v._id;
      return id === videoId;
    });
  };

  // Helper function to get playlist thumbnail
  const getPlaylistThumbnail = (playlist) => {
    if (!playlist.videos || playlist.videos.length === 0) {
      return null;
    }
    
    // Get the first video (similar to PlaylistDetail logic)
    const firstVideo = playlist.videos[0];
    
    // Handle both object format and string format
    if (typeof firstVideo === 'object' && firstVideo.thumbnail) {
      return firstVideo.thumbnail.url || firstVideo.thumbnail;
    }
    
    return null;
  };

  // Card and accent style helpers
  const cardBg = "bg-white dark:bg-gray-900";
  const borderColor = "border border-gray-200 dark:border-gray-700";
  const shadow = "shadow-lg";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.22 }}
        className="relative"
      >
        {/* Modal close button (the ONLY one) */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors z-20 p-2 rounded-full"
          aria-label="Close"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>

        {/* Title bar */}
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-2 shadow">
            <FaMusic className="text-white text-lg" />
          </span>
          <span className="text-2xl font-black text-gray-900 dark:text-white">Save to Playlist</span>
        </div>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 mb-2 bg-green-100 text-green-700 rounded-lg text-sm border border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-800 shadow"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 mb-2 bg-red-100 text-red-700 rounded-lg text-sm border border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-800 shadow"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-14">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <>
            {playlists.length === 0 && !creating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex flex-col items-center justify-center py-12 px-8 text-center rounded-xl ${cardBg} ${shadow} border border-dashed border-indigo-300 dark:border-indigo-800`}
              >
                <FaMusic className="text-indigo-300 dark:text-indigo-400 text-5xl mb-3" />
                <div className="mb-6 text-gray-500 dark:text-gray-400">
                  You don't have any playlists yet.
                </div>
                <PrimaryButton
                  onClick={() => setCreating(true)}
                  icon={<FaPlus />}
                  className="mt-3"
                >
                  Create Playlist
                </PrimaryButton>
              </motion.div>
            )}

            {/* Playlists list: clean cards with custom scrollbar */}
            {!creating && playlists.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 gap-4 max-h-[38vh] overflow-y-auto pr-1 scrollable-area"
              >
                {playlists.map((playlist) => {
                  const hasVideo = isVideoInPlaylist(playlist);
                  const thumbnailUrl = getPlaylistThumbnail(playlist);
                  
                  return (
                    <motion.div
                      key={playlist._id}
                      whileHover={{ scale: 1.015 }}
                      className={`
                        flex items-center justify-between p-3 rounded-xl ${cardBg} ${shadow} ${borderColor}
                        transition group hover:border-indigo-400 dark:hover:border-indigo-500
                        ${hasVideo ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shadow-sm">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={playlist.name}
                              className="object-cover w-full h-full"
                              onError={e => { 
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center text-white ${thumbnailUrl ? 'hidden' : 'flex'}`}>
                            <FiPlay className="w-5 h-5 opacity-80" />
                          </div>
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-gray-900 dark:text-white truncate flex items-center gap-2">
                            {playlist.name}
                            {hasVideo && (
                              <FaCheckCircle className="text-indigo-500 dark:text-indigo-400 text-sm flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {playlist.videos?.length || 0} video{(playlist.videos?.length || 0) !== 1 && 's'}
                            {hasVideo && (
                              <span className="text-indigo-600 dark:text-indigo-400 ml-2">• Added</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        {actionLoadingId === playlist._id ? (
                          <LoadingSpinner size={18} className="mx-4" />
                        ) : hasVideo ? (
                          <button
                            onClick={() => toggleVideoInPlaylist(playlist._id, true)}
                            className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-800 dark:hover:bg-red-900/60 text-sm font-semibold transition"
                            aria-label="Remove from playlist"
                          >
                            <FaCheckCircle className="mr-1" />
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleVideoInPlaylist(playlist._id, false)}
                            className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-700 dark:hover:bg-indigo-900/60 text-sm font-semibold transition"
                            aria-label="Add to playlist"
                          >
                            <FaPlus className="mr-1" />
                            Add
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Create playlist form; looks like a card */}
            <AnimatePresence>
              {(creating || playlists.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={`mt-6 rounded-xl ${cardBg} ${shadow} ${borderColor} py-6 px-6`}
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <FaPlus /> Create New Playlist
                  </h3>
                  <div className="space-y-3">
                    <FormInput
                      label="Playlist Name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="My Favorite Videos"
                      error={error && !newPlaylistName.trim() ? error : ""}
                      autoFocus
                    />
                    <FormInput
                      label="Description (optional)"
                      value={newPlaylistDesc}
                      onChange={(e) => setNewPlaylistDesc(e.target.value)}
                      placeholder="Optional description"
                      textarea
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <SecondaryButton
                      onClick={() => {
                        setCreating(false);
                        setNewPlaylistName("");
                        setNewPlaylistDesc("");
                        setError("");
                      }}
                    >
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton
                      onClick={handleCreatePlaylist}
                      className="flex items-center gap-2"
                      disabled={loading}
                    >
                      <FaPlus /> Create Playlist
                    </PrimaryButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button to open create form */}
            {!creating && playlists.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-3">
                <button
                  onClick={() => setCreating(true)}
                  className="w-full py-2 flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-semibold"
                >
                  <FaPlus /> Create new playlist
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* Custom scrollbar CSS for scrollable-area */}
        <style>{`
          .scrollable-area::-webkit-scrollbar {
            width: 8px;
            background: #181a21;
          }
          .scrollable-area::-webkit-scrollbar-thumb {
            background: #525266;
            border-radius: 4px;
          }
          .scrollable-area {
            scrollbar-width: thin;
            scrollbar-color: #525266 #181a21;
          }
        `}</style>
      </motion.div>
    </Modal>
  );
};

export default AddToPlaylistModal;