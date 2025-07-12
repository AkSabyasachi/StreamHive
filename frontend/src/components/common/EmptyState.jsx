// src/components/common/EmptyState.jsx
import React from "react";

const EmptyState = ({ message = "No content found.", icon = "📭" }) => {
  return (
    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
};

export default EmptyState;
