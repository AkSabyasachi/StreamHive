import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import PrimaryButton from "../components/common/PrimaryButton";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Card from "../components/common/Card";
import ProgressBar from "../components/common/ProgressBar";
import FileUpload from "../components/common/FileUpload";
import FormInput from "../components/common/FormInput";
import FormTextarea from "../components/common/FormTextarea";
import RadioCard from "../components/common/RadioCard";
import SecondaryButton from "../components/common/SecondaryButton";
import ErrorMessage from "../components/common/ErrorMessage";
import toast from "react-hot-toast";
import { FiVideo, FiImage, FiInfo, FiGlobe, FiLock, FiLink } from "react-icons/fi";

const Upload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video file size should be less than 500MB");
        return;
      }
      setVideoFile(file);
      setPreviewVideo(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Thumbnail file size should be less than 5MB");
        return;
      }
      setThumbnail(file);
      setPreviewThumbnail(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVisibility("public");
    setVideoFile(null);
    setThumbnail(null);
    setPreviewVideo(null);
    setPreviewThumbnail(null);
    setMessage({ text: "", type: "" });
  };

  const cancelUpload = () => {
    // Implementation for canceling upload would go here
    setUploading(false);
    setProgress(0);
    setMessage({ text: "Upload cancelled", type: "error" });
  };

  const handleUpload = async () => {
    if (!title || !description || !videoFile || !thumbnail) {
      setMessage({ text: "Title, description, video, and thumbnail are required.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("visibility", visibility);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnail);

    try {
      setUploading(true);
      setProgress(0);
      setMessage({ text: "", type: "" });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const { data } = await axiosInstance.post("/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setProgress(100);
      
      toast.success("✅ Upload successful!");
      setMessage({ text: "Video uploaded successfully!", type: "success" });
      console.log("Uploaded:", data);

      // Reset form after successful upload
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err) {
      console.error("Upload failed:", err);
      const errorMessage = err?.response?.data?.message || "Upload failed";
      toast.error(errorMessage);
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Share Your Creativity with the World
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload your video to reach millions of viewers. Your content deserves to be seen.
          </p>
        </div>

        <Card className="rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Bar */}
          {uploading && (
            <ProgressBar progress={progress} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Upload Areas */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Upload Content
                </h2>
                
                {/* Video Upload */}
                <FileUpload
                  type="video"
                  label="Video File"
                  description="MP4, MOV, AVI up to 500MB"
                  accept="video/*"
                  maxSize={500 * 1024 * 1024}
                  onFileChange={handleVideoChange}
                  previewUrl={previewVideo}
                  onRemove={() => {
                    setVideoFile(null);
                    setPreviewVideo(null);
                  }}
                  disabled={uploading}
                />
                
                {/* Thumbnail Upload */}
                <div className="mt-6">
                  <FileUpload
                    type="image"
                    label="Video Thumbnail"
                    description="JPG, PNG up to 5MB"
                    accept="image/*"
                    maxSize={5 * 1024 * 1024}
                    onFileChange={handleThumbnailChange}
                    previewUrl={previewThumbnail}
                    onRemove={() => {
                      setThumbnail(null);
                      setPreviewThumbnail(null);
                    }}
                    disabled={uploading}
                  />
                </div>
              </div>
              
              {/* Preview Section */}
              {(previewVideo || previewThumbnail) && (
                <Card className="border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Preview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Video Preview
                      </h3>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        {previewVideo ? (
                          <video 
                            src={previewVideo} 
                            controls 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            No video selected
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Thumbnail Preview
                      </h3>
                      <div className="aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {previewThumbnail ? (
                          <img 
                            src={previewThumbnail} 
                            alt="Thumbnail preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-500">No thumbnail selected</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
            
            {/* Right Column - Form */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                  className={`pb-3 px-4 font-medium ${
                    activeTab === "details"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  Video Details
                </button>
                <button
                  className={`pb-3 px-4 font-medium ${
                    activeTab === "visibility"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("visibility")}
                >
                  Visibility
                </button>
              </div>
              
              <div className="space-y-6">
                {activeTab === "details" ? (
                  <>
                    <FormInput
                      label="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter video title"
                      required
                      disabled={uploading}
                      showCount
                      maxLength={100}
                    />
                    
                    <FormTextarea
                      label="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your video..."
                      rows={5}
                      required
                      disabled={uploading}
                    />
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Visibility Settings
                    </label>
                    <div className="space-y-3">
                      <RadioCard
                        value="public"
                        label="Public"
                        description="Anyone can view this video"
                        checked={visibility === "public"}
                        onChange={setVisibility}
                        name="visibility"
                        icon={FiGlobe}
                      />
                      <RadioCard
                        value="unlisted"
                        label="Unlisted"
                        description="Only people with the link can view"
                        checked={visibility === "unlisted"}
                        onChange={setVisibility}
                        name="visibility"
                        icon={FiLink}
                      />
                      <RadioCard
                        value="private"
                        label="Private"
                        description="Only you can view this video"
                        checked={visibility === "private"}
                        onChange={setVisibility}
                        name="visibility"
                        icon={FiLock}
                      />
                    </div>
                  </div>
                )}
                
                {/* Status Message */}
                {message.text && (
                  <ErrorMessage type={message.type}>
                    {message.text}
                  </ErrorMessage>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <SecondaryButton
                    onClick={resetForm}
                    disabled={uploading}
                    className="flex-1"
                  >
                    Clear Form
                  </SecondaryButton>
                  
                  {uploading ? (
                    <div className="flex-1 flex gap-3">
                      <SecondaryButton
                        onClick={cancelUpload}
                        variant="danger"
                        className="flex-1"
                      >
                        Cancel Upload
                      </SecondaryButton>
                      <div className="flex-1 flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-lg font-medium">
                        <span className="flex items-center gap-2">
                          <LoadingSpinner />
                          Uploading {progress}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <PrimaryButton
                      onClick={handleUpload}
                      disabled={!videoFile || !thumbnail}
                      className="flex-1"
                    >
                      Publish Video
                    </PrimaryButton>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </Card>
        
        {/* Tips Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-900/50">
            <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <FiVideo size={20} /> Video Quality
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Upload in HD (720p or higher) for the best viewing experience. Use landscape orientation for optimal results.
            </p>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-100 dark:border-green-900/50">
            <h3 className="font-bold text-lg text-green-700 dark:text-green-300 flex items-center gap-2">
              <FiImage size={20} /> Thumbnail Tips
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Use high-contrast images with minimal text. Recommended size: 1280x720 pixels. Bright, engaging thumbnails get more clicks.
            </p>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 border border-purple-100 dark:border-purple-900/50">
            <h3 className="font-bold text-lg text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <FiInfo size={20} /> Best Practices
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Use clear, descriptive titles. Add relevant tags after upload. Keep intros under 10 seconds. Engage viewers in the first 30 seconds.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;