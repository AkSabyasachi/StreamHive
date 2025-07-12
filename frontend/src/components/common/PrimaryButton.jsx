import React from "react";

const PrimaryButton = ({ children, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
