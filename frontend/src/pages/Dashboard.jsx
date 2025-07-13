import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

// Common components
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import VideoCard from "../components/common/VideoCard";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, videosRes] = await Promise.all([
        axios.get("/dashboard/stats"),
        axios.get("/dashboard/videos"),
      ]);

      setStats(statsRes.data.data);
      setVideos(videosRes.data.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="py-6 px-4 min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Videos" value={stats?.totalVideos || 0} />
        <StatCard label="Total Views" value={stats?.totalViews || 0} />
        <StatCard label="Total Likes" value={stats?.totalLikes || 0} />
        <StatCard label="Subscribers" value={stats?.totalSubscribers || 0} />
      </div>

      {/* Videos Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Videos</h2>
        {videos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            You haven’t uploaded any videos yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 📊 Reusable StatCard Component
const StatCard = ({ label, value }) => (
  <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 text-center">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
  </div>
);

export default Dashboard;
