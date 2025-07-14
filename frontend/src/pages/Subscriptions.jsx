import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axiosInstance";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";

const ITEMS_PER_PAGE = 6;

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSubscribedChannels = useCallback(async () => {
    try {
      const { data: userRes } = await axios.get("/users/current-user");
      const userId = userRes?.data?._id;

      const { data: subsRes } = await axios.get(`/subscription/u/${userId}`);
      setChannels(subsRes?.data || []);
    } catch (error) {
      console.error("Error fetching subscribed channels:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribedChannels();
  }, [fetchSubscribedChannels]);

  const handleUnsubscribe = async (channelId) => {
    try {
      await axios.post(`/subscription/ch/${channelId}`);
      setChannels((prev) => prev.filter((ch) => ch.channel._id !== channelId));
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(channels.length / ITEMS_PER_PAGE);
  const paginatedChannels = channels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="py-6 px-4 min-h-[80vh]">
      <h1 className="text-2xl font-semibold mb-6">Your Subscriptions</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : paginatedChannels.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedChannels.map(({ channel }) => (
              <div
                key={channel._id}
                className="border rounded-xl bg-white dark:bg-gray-900 hover:shadow-md transition duration-200 p-4 flex flex-col gap-3"
              >
                <Link
                  to={`/channel/${channel.username}`}
                  className="flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                    {channel.avatar ? (
                      <img
                        src={channel.avatar}
                        alt={channel.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white hover:text-indigo-600">
                      @{channel.username}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {channel.fullname}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {channel.subscriberCount} subscribers
                    </div>
                  </div>
                </Link>
                <SecondaryButton
                  onClick={() => handleUnsubscribe(channel._id)}
                  className="w-fit ml-auto text-xs"
                >
                  Unsubscribe
                </SecondaryButton>
              </div>
            ))}
          </div>

          {/* Pagination Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded border bg-white dark:bg-gray-800 hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded border bg-white dark:bg-gray-800 hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          You're not subscribed to any channels yet.
        </p>
      )}
    </div>
  );
};

export default Subscriptions;