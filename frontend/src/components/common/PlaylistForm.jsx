import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

const PlaylistForm = ({ initialData = {}, onSubmit, onClose, loading }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (initialData && (initialData.name || initialData.description)) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData?._id]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {initialData?._id ? "Edit Playlist" : "Create New Playlist"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Playlist Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors`}
              placeholder="Enter playlist name"
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-3 rounded-xl border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors`}
            placeholder="Add an optional description..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <SecondaryButton
            type="button"
            onClick={onClose}
            className="px-5 py-2.5"
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            disabled={loading}
            icon={loading ? null : <Plus size={18} />}
            className="px-5 py-2.5"
          >
            {loading ? (
              initialData?._id ? "Updating..." : "Creating..."
            ) : initialData?._id ? (
              "Update Playlist"
            ) : (
              "Create Playlist"
            )}
          </PrimaryButton>
        </div>
      </form>
    </motion.div>
  );
};

export default PlaylistForm;