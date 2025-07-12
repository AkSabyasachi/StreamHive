import React from "react";

const VideoSkeleton = () => (
  <div className="w-full max-w-sm bg-gray-800 rounded-lg p-4 animate-pulse space-y-4">
    <div className="h-48 bg-gray-700 rounded" />
    <div className="h-4 bg-gray-700 rounded w-3/4" />
    <div className="h-4 bg-gray-700 rounded w-1/2" />
  </div>
);

export default VideoSkeleton;
