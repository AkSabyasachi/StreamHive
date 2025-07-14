import React from "react";
import { Link } from "react-router-dom";

const VideoCard = ({ video }) => {
  const {
    _id,
    title,
    thumbnail,
    views,
    owner: { fullname, avatar, username } = {},
  } = video;

  return (
    <Link
      to={`/watch/${_id}`}
      className="block rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300"
    >
      <img
        src={thumbnail || "/default-thumbnail.jpg"}
        alt={title}
        className="w-full h-48 object-cover"
      />

      <div className="p-4 flex gap-3">
        <img
          src={avatar || "/default-avatar.png"}
          alt={fullname}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {fullname }
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            { username}
          </p>
          <p className="text-xs text-gray-400">{views?.toLocaleString() || 0} views</p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;