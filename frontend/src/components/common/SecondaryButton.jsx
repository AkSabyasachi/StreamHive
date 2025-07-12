import React from "react";

const SecondaryButton = ({ children, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
