import React from "react";

const LoaderOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-white border-t-red-600 rounded-full animate-spin" />
    </div>
  );
};

export default LoaderOverlay;
