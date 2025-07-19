// components/common/ErrorMessage.jsx
import React from 'react';

const ErrorMessage = ({ type, children }) => {
  return (
    <div className={`p-3 rounded-lg ${
      type === "error" 
        ? "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" 
        : "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
    }`}>
      {children}
    </div>
  );
};

export default ErrorMessage;