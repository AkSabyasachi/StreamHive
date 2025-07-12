import React from "react";

const PlaylistCard = ({ playlist }) => {
  const thumbnail =
    playlist.videos?.[0]?.thumbnail?.url || "/default-thumbnail.jpg";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition">
      <img
        src={thumbnail}
        alt={playlist.name}
        className="w-full h-40 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h2 className="text-lg font-bold truncate">{playlist.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {playlist.videos.length} video
          {playlist.videos.length !== 1 && "s"}
        </p>
      </div>
    </div>
  );
};

export default PlaylistCard;
