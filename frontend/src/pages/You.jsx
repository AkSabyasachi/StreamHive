import React, { useEffect, useState } from "react";
import axios from "axios";

const You = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [{ data: userRes }, { data: statsRes }] = await Promise.all([
        axios.get("/api/v1/users/me", { withCredentials: true }),
        axios.get("/api/v1/dashboard/stats", { withCredentials: true }),
      ]);

      setUser(userRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-6">Your Channel</h1>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-40 w-full bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      ) : user ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar?.url || "/default-avatar.png"}
              alt={user.fullName}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold">{user.fullName}</h2>
              <p className="text-gray-500 dark:text-gray-400">
                @{user.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.subscribersCount} subscribers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Total Videos</p>
              <p className="text-xl font-bold">{stats.totalVideos}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Total Views</p>
              <p className="text-xl font-bold">{stats.totalViews}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Total Watch Time</p>
              <p className="text-xl font-bold">{stats.totalWatchTime} mins</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-red-500">Could not load user data.</p>
      )}
    </div>
  );
};

export default You;
