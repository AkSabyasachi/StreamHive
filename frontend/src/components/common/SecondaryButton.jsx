// components/common/SecondaryButton.jsx
import React from 'react';

const SecondaryButton = ({ 
  children, 
  onClick, 
  disabled, 
  variant = "default", 
  className = "" 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
        variant === "danger"
          ? "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
          : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
