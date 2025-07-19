import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import PrimaryButton from "../common/PrimaryButton";
import SecondaryButton from "../common/SecondaryButton";
import FileUpload from "../common/FileUpload";
import { FiUpload, FiEdit, FiX, FiImage, FiVideo, FiSmile } from "react-icons/fi";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const CreateCommunityPostModal = ({
  isOpen,
  onClose,
  initialData = null,
  onPostCreated,
  onPostUpdated,
}) => {
  const isEditing = !!initialData;

  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (isEditing && initialData) {
      setContent(initialData.content || "");
      setPreview(initialData.media || null);
      setMedia(null);
    } else {
      setContent("");
      setMedia(null);
      setPreview(null);
    }
  }, [initialData, isEditing]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent("");
      setMedia(null);
      setUploadProgress(0);
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
    }
  }, [isOpen, preview]);

  const handleMediaUpload = async () => {
    if (!media) {
      return isEditing ? initialData?.media : null;
    }

    try {
      console.log("Starting media upload...", media);
      
      const formData = new FormData();
      formData.append("file", media);
      formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

      // Simulate upload progress
      setUploadProgress(10);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary upload error:", errorData);
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await response.json();
      setUploadProgress(100);
      console.log("Upload successful:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("Media upload error:", error);
      setUploadProgress(0);
      throw new Error("Failed to upload media: " + error.message);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Post content is required");
      return;
    }

    try {
      setLoading(true);

      let mediaUrl = null;
      if (media || (isEditing && initialData?.media && !media)) {
        mediaUrl = await handleMediaUpload();
      }

      const postData = {
        content: content.trim(),
        ...(mediaUrl && { media: mediaUrl })
      };

      let response;

      if (isEditing) {
        response = await axiosInstance.patch(
          `/community/${initialData._id}`,
          postData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        onPostUpdated?.(response.data.data);
        toast.success("Post updated successfully! ✨");
      } else {
        response = await axiosInstance.post(`/community`, postData, {
          headers: { "Content-Type": "application/json" },
        });
        onPostCreated?.(response.data.data);
        toast.success("Post created successfully! 🎉");
      }

      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err?.response?.data?.message || "Something went wrong 😞");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size);

    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/mov', 'video/avi'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image or video file 📷");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB 📏");
      return;
    }

    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setMedia(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const removeMedia = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setMedia(null);
    setPreview(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const isVideoFile = (url) => {
    if (!url) return false;
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || 
           url.includes('video') || url.includes('.avi');
  };

  const getCharacterCountColor = () => {
    const ratio = content.length / 1000;
    if (ratio < 0.7) return 'text-gray-500';
    if (ratio < 0.9) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-2">
          {isEditing ? <FiEdit className="text-blue-500" /> : <FiUpload className="text-green-500" />}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
            {isEditing ? "Edit Your Post" : "Create New Post"}
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Content Input Section */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            <FiSmile className="text-blue-500" />
            What's on your mind?
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts with the community..."
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm hover:shadow-md focus:shadow-lg"
              maxLength={1000}
            />
            <div className={`absolute bottom-3 right-3 text-xs font-medium ${getCharacterCountColor()}`}>
              {content.length}/1000
            </div>
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FiImage className="text-purple-500" />
            Add Media (Optional)
          </label>
          
          <div
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileUpload
              label=""
              onFileSelect={handleFileSelect}
              accept="image/*,video/*"
              className="w-full"
            />
            <div className="text-center mt-2">
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                <FiImage className="text-lg" />
                <FiVideo className="text-lg" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Images & Videos up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Media Preview Section */}
        {preview && (
          <div className="relative animate-in slide-in-from-top-2 duration-300">
            <div className="relative group rounded-xl overflow-hidden shadow-lg">
              {isVideoFile(preview) ? (
                <video 
                  src={preview} 
                  controls 
                  className="w-full max-h-60 rounded-xl"
                  onError={(e) => {
                    console.error("Video preview error:", e);
                    toast.error("Error loading video preview");
                  }}
                />
              ) : (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full max-h-60 rounded-xl object-cover"
                  onError={(e) => {
                    console.error("Image preview error:", e);
                    toast.error("Error loading image preview");
                  }}
                />
              )}
              
              {/* Remove button */}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 opacity-80 hover:opacity-100"
                aria-label="Remove media"
              >
                <FiX />
              </button>

              {/* File info overlay */}
              {media && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white text-sm">
                    <p className="font-medium truncate">{media.name}</p>
                    <p className="text-xs opacity-80">{formatFileSize(media.size)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <SecondaryButton 
            onClick={onClose} 
            disabled={loading}
            className="px-6 py-2.5"
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton 
            onClick={handleSubmit} 
            loading={loading} 
            disabled={!content.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{uploadProgress > 0 ? "Uploading..." : "Processing..."}</span>
              </div>
            ) : isEditing ? (
              <div className="flex items-center gap-2">
                <FiEdit /> 
                <span>Update Post</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FiUpload /> 
                <span>Share Post</span>
              </div>
            )}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};

export default CreateCommunityPostModal;