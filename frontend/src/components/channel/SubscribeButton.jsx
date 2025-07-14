import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const SubscribeButton = ({ channelId, isSubscribed, onToggle }) => {
  const [subscribed, setSubscribed] = useState(isSubscribed);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/subscription/ch/${channelId}`);
      setSubscribed(true);
      if (onToggle) onToggle();
    } catch (err) {
      console.error("Failed to subscribe", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/subscription/ch/${channelId}`);
      setSubscribed(false);
      if (onToggle) onToggle();
    } catch (err) {
      console.error("Failed to unsubscribe", err);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {subscribed ? (
        <>
          <button
            disabled={loading}
            onClick={() => setShowConfirm(true)}
            className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            {loading ? "..." : "Subscribed"}
          </button>

          {/* Confirmation Dialog */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-lg border dark:border-gray-600">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                  Unsubscribe?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Are you sure you want to unsubscribe from this channel?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-sm px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUnsubscribe}
                    className="text-sm px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Unsubscribe
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <button
          disabled={loading}
          onClick={handleSubscribe}
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      )}
    </>
  );
};

export default SubscribeButton;