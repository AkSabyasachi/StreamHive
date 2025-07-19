// components/common/FileUpload.jsx
import React, { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FileUpload = ({ 
  type, 
  label, 
  description, 
  accept, 
  maxSize, 
  onFileChange, 
  previewUrl, 
  onRemove, 
  disabled 
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size <= maxSize) {
        onFileChange({ target: { files: [file] } });
      } else {
        toast.error(`File size should be less than ${maxSize / (1024 * 1024)}MB`);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
        />
        
        {previewUrl ? (
          <div className="relative">
            {type === "video" ? (
              <video src={previewUrl} controls className="w-full max-h-48 rounded-lg" />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
            >
              <FiX size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;