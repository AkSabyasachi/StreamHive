import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaPlay } from "react-icons/fa";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { Sparkles, Eye, Clock } from "lucide-react";

const PlaylistCard = ({ playlist, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  
  const thumbnail = imgError || !playlist?.videos?.[0]?.thumbnail?.url 
    ? "/default-playlist.jpg" 
    : playlist.videos[0].thumbnail.url;
  
  const videoCount = playlist?.videos?.length || 0;
  const isNew = playlist.createdAt && differenceInDays(Date.now(), new Date(playlist.createdAt)) <= 7;

  const formatCount = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  const handleNavigate = () => {
    navigate(`/playlists/${playlist._id}`);
  };

    // FIX: Proper event handling for delete
  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(playlist._id);
  };

  // FIX: Proper event handling for edit
  const handleEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(playlist);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden relative"
    >
      {/* Thumbnail Container */}
      <div 
        className="relative aspect-video cursor-pointer"
        onClick={handleNavigate}
      >
        <img
          src={thumbnail}
          alt={playlist?.name}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg transition-transform group-hover:scale-110">
            <FaPlay className="h-5 w-5 text-indigo-600" />
          </div>
        </div>

        {/* Video Count Badge */}
        <div className="absolute bottom-3 right-3 bg-black/85 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
          {videoCount} {videoCount === 1 ? "video" : "videos"}
        </div>

        {/* NEW Badge */}
        {isNew && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            NEW
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pb-3">
        <h2 
          className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-3 cursor-pointer group-hover:text-indigo-500 transition-colors"
          onClick={handleNavigate}
          title={playlist?.name}
        >
          {playlist?.name}
        </h2>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {playlist.createdAt
                ? formatDistanceToNow(new Date(playlist.createdAt), { addSuffix: true })
                : "Recently created"}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatCount(playlist.views || 0)} views</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div 
        className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={handleEdit}  // Fixed handler
          className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Edit playlist"
        >
          <FaEdit className="text-blue-600 dark:text-blue-400 text-sm" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={handleDelete}  // Fixed handler
          className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Delete playlist"
        >
          <FaTrash className="text-red-500 text-sm" />
        </motion.button>
      </div>

      {/* Accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.div>
  );
};

export default PlaylistCard;