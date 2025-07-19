import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../common/ConfirmDialog";
import CreateCommunityPostModal from "./CreateCommunityPostModal";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const CommunityPost = ({ post, onDelete, onPostUpdated }) => {
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user && user._id === post.user?._id;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axiosInstance.delete(`/community/${post._id}`);
      toast.success("Post deleted");
      onDelete?.(post._id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 shadow-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-white">
            {post.user?.username || "Unknown"}
          </span>{" "}
          · {formatDistanceToNow(new Date(post.createdAt))} ago
        </div>
        {isOwner && (
          <div className="flex gap-2 text-gray-400 dark:text-gray-500">
            <button
              onClick={() => setShowEditModal(true)}
              className="hover:text-blue-500"
            >
              <FiEdit size={16} />
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="hover:text-red-500"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-2">
        {post.content}
      </p>

      {post.media && (
        <div className="mt-2">
          {post.media.endsWith(".mp4") ? (
            <video
              src={post.media}
              controls
              className="rounded-md w-full max-h-[400px]"
            />
          ) : (
            <img
              src={post.media}
              alt="Community Post"
              className="rounded-md w-full max-h-[400px] object-cover"
            />
          )}
        </div>
      )}

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this post?"
        description="This action cannot be undone."
      />

      {showEditModal && (
        <CreateCommunityPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialData={post}
          onPostUpdated={onPostUpdated}
        />
      )}
    </motion.div>
  );
};

export default CommunityPost;
