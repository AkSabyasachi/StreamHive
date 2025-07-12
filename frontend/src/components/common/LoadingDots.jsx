// src/components/common/LoadingDots.jsx
import React from "react";

const LoadingDots = () => {
  return (
    <div className="flex space-x-1 justify-center items-center">
      <div className="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce" />
      <div className="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce delay-75" />
      <div className="h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce delay-150" />
    </div>
  );
};

export default LoadingDots;
