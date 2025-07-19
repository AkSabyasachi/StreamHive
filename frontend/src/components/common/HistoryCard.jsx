import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { Play, Eye, ThumbsUp, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HistoryCard = ({ video }) => {
  if (!video || !video.owner) return null;

  const {
    _id,
    title,
    thumbnail,
    owner,
    createdAt,
    duration,
    views = 0,
    likesCount = 0,
  } = video;

  // Format duration
  const formatDuration = (secs) => {
    if (!secs || isNaN(secs)) return "00:00";
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Format counts
  const formatCount = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  const isNew = createdAt && differenceInDays(Date.now(), new Date(createdAt)) <= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <Link to={`/watch/${_id}`} className="block" aria-label={`Watch ${title}`}>
        <div className="relative">
          {/* Thumbnail with overlay */}
          <div className="aspect-video relative overflow-hidden">
            <img
              src={thumbnail || "/default-thumbnail.jpg"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
              onError={(e) => e.target.src = "/default-thumbnail.jpg"}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg transition-transform group-hover:scale-110">
                <Play className="w-5 h-5 text-indigo-600 fill-current" />
              </div>
            </div>
            
            {/* Duration */}
            {duration && (
              <div className="absolute bottom-3 right-3 bg-black/85 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                {formatDuration(duration)}
              </div>
            )}
            
            {/* Stats on hover */}
            <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/75 text-white text-xs px-2 py-1 rounded flex items-center gap-1 backdrop-blur">
                <Eye className="w-3 h-3 flex-shrink-0" />
                {formatCount(views)}
              </div>
              <div className="bg-black/75 text-white text-xs px-2 py-1 rounded flex items-center gap-1 backdrop-blur">
                <ThumbsUp className="w-3 h-3 flex-shrink-0" />
                {formatCount(likesCount)}
              </div>
            </div>
            
            {/* New badge */}
            {isNew && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                NEW
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Info section */}
      <div className="p-4 pb-3">
        <Link to={`/watch/${_id}`}>
          <h3 
            className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-indigo-500 transition-colors"
            title={title}
          >
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-3 mb-3">
          <img
            src={owner?.avatar || "/default-avatar.png"}
            alt={owner?.username}
            className="w-9 h-9 rounded-full object-cover border-2 border-indigo-400 group-hover:border-indigo-600 transition-all"
            onError={(e) => e.target.src = "/default-avatar.png"}
          />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-400 block text-[14px]">
              {owner?.username || "Unknown"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3 flex-shrink-0" />
              {createdAt
                ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
                : "Just now"}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatCount(views || 0)} views
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5" />
            {formatCount(likesCount || 0)} likes
          </span>
        </div>
      </div>
      
      {/* Accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.div>
  );
};

export default HistoryCard;