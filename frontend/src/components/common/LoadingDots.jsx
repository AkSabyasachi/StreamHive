import React from "react";

const LoadingDots = () => {
  return (
    <div className="flex space-x-1 justify-center items-center">
      {[0, 75, 150].map((delay, i) => (
        <div
          key={i}
          className={`h-2 w-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce`}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
};

export default LoadingDots;