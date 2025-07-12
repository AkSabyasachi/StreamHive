import React from "react";

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-red-100 text-red-700 p-3 rounded text-sm mb-4 dark:bg-red-900 dark:text-red-200">
      {message}
    </div>
  );
};

export default ErrorMessage;
