import React from "react";

const LoadingSpinner = ({ size = 24, className = "" }) => {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-red-500 border-gray-300 dark:border-gray-700 dark:border-t-red-400 ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default LoadingSpinner;
