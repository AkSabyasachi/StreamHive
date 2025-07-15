import React, { useState, useEffect } from "react";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";

const PlaylistForm = ({ initialData = {}, onSubmit, onClose, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Prevent infinite re-render when editing
  useEffect(() => {
    if (initialData && (initialData.name || initialData.description)) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData?._id]); // Only run when playlistId changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Playlist Name"
        name="name"
        placeholder="Enter playlist name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <FormTextarea
        label="Description"
        name="description"
        placeholder="Optional description..."
        value={formData.description}
        onChange={handleChange}
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {loading ? (initialData?._id ? "Updating..." : "Creating...") : initialData?._id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default PlaylistForm;
