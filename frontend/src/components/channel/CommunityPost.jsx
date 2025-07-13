import React from "react";

const CommunityPost = ({ post }) => {
  return (
    <div className="border rounded-md p-4 mb-4 bg-white dark:bg-gray-800">
      <div className="flex items-center mb-2">
        <img
          src={post.user?.avatar}
          alt={post.user?.username}
          className="w-8 h-8 rounded-full mr-2"
        />
        <h4 className="font-semibold">{post.user?.username}</h4>
        <span className="ml-auto text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
      <p>{post.text}</p>
    </div>
  );
};

export default CommunityPost;