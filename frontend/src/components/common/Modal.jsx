import React from "react";
import ReactDOM from "react-dom";
import { FiX } from "react-icons/fi";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 relative max-w-lg w-full">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl text-gray-500 dark:text-gray-300 hover:text-red-500 transition"
          aria-label="Close modal"
        >
          <FiX />
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;