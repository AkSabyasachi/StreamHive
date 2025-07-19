// components/common/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;