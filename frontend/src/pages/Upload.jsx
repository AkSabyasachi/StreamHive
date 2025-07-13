import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const Upload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
    setPreviewVideo(URL.createObjectURL(file));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    setPreviewThumbnail(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title || !videoFile || !thumbnail) {
      return setMessage("❗ Title, video file, and thumbnail are required.");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("visibility", visibility);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnail);

    try {
      setUploading(true);
      const { data } = await axiosInstance.post("/api/v1/videos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("✅ Upload successful!");
      console.log("Uploaded:", data);

      // Reset form
      setTitle("");
      setDescription("");
      setVisibility("public");
      setVideoFile(null);
      setThumbnail(null);
      setPreviewVideo(null);
      setPreviewThumbnail(null);
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="py-6 max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-6">Upload Video</h1>

      <form className="space-y-6" onSubmit={handleUpload}>
        <div>
          <label className="block text-sm font-medium mb-1">Video File</label>
          <input type="file" accept="video/*" onChange={handleVideoChange} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
            placeholder="Write something about the video..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>

      {message && <p className="mt-4 text-center text-sm text-blue-600">{message}</p>}

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">Preview</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-1/2">
            {previewVideo ? (
              <video src={previewVideo} controls className="rounded w-full" />
            ) : (
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            {previewThumbnail ? (
              <img src={previewThumbnail} alt="Thumbnail Preview" className="rounded w-full" />
            ) : (
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
