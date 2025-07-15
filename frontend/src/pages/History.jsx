import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import VideoCard from "../components/common/VideoCard";
import VideoSkeleton from "../components/common/videoSkeleton";
import { motion } from "framer-motion";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWatchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/users/watch-history");
      setHistory(data?.data || []);
    } catch (err) {
      console.error("Error fetching watch history:", err);
      setError("Unable to load watch history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchHistory();
  }, [fetchWatchHistory]);

  return (
    <div className="py-6 px-4 min-h-[80vh]">
      <motion.h1
        className="text-2xl font-bold mb-6 text-center sm:text-left"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Watch History
      </motion.h1>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">
          <p>{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          No videos in your history yet.
        </div>
      ) : (
        <motion.div
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {history
            // Pitfall: Videos may be null if deleted after viewing
            .filter((video) => video)
            .map((video, index) => (
              <motion.div
                key={video._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <VideoCard video={video} />
              </motion.div>
            ))}
        </motion.div>
      )}
    </div>
  );
};

export default History;