import React from "react";

const RetryError = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div className="text-center py-10 space-y-4">
      <p className="text-red-500 dark:text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default RetryError;
