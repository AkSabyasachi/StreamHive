import React from "react";

const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const resolvedSize = sizeMap[size] || sizeMap["md"];

  return (
    <div className={`relative ${resolvedSize} ${className}`}>
      {/* Spinning Ring */}
      <div
        className={`absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent 
        border-l-purple-500 border-r-indigo-400 animate-spin`}
      ></div>

      {/* Soft Glow */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-purple-600 to-indigo-500 opacity-10 blur-md"
      ></div>

      {/* Center Dot */}
      <div className="w-2 h-2 bg-purple-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md" />
    </div>
  );
};

export default LoadingSpinner;
