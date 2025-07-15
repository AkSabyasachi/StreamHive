import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PlaylistCard = ({ playlist, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const thumbnail =
    playlist?.videos?.[0]?.thumbnail?.url || "/default-thumbnail.jpg";
  const videoCount = playlist?.videos?.length || 0;

  const handleNavigate = () => {
    navigate(`/playlists/${playlist._id}`);
  };

  return (
    <div
      onClick={handleNavigate}
      className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-transform transform hover:scale-[1.02] cursor-pointer"
    >
      {/* Thumbnail */}
      <img
        src={thumbnail}
        alt={playlist?.name}
        className="w-full h-40 object-cover rounded-t-lg"
      />

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold truncate">{playlist?.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {videoCount} video{videoCount !== 1 && "s"}
        </p>
      </div>

      {/* Hover Icons */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2"
      >
        <button
          onClick={() => onEdit(playlist)}
          className="text-blue-500 hover:text-blue-700 bg-white dark:bg-gray-700 p-2 rounded-full shadow"
          title="Edit Playlist"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(playlist._id)}
          className="text-red-500 hover:text-red-700 bg-white dark:bg-gray-700 p-2 rounded-full shadow"
          title="Delete Playlist"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default PlaylistCard;
