import React, { useState } from "react";

const Upload = () => {
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState(null);

  return (
    <div className="py-6 max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-6">Upload Video</h1>

      <form className="space-y-6">
        {/* Video File */}
        <div>
          <label className="block text-sm font-medium mb-1">Video File</label>
          <input
            type="file"
            accept="video/*"
            className="block w-full text-sm"
            disabled
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm"
            disabled
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
            placeholder="Enter title"
            disabled
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows="4"
            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
            placeholder="Write something about the video..."
            disabled
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium mb-1">Visibility</label>
          <select
            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
            disabled
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Upload (Disabled for now)
          </button>
        </div>
      </form>

      {/* Preview (optional) */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">Preview (Mock)</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-1/2">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-3 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
