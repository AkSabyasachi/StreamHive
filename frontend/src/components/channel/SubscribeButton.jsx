import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const SubscribeButton = ({ channelId }) => {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkSubscriptionStatus = async () => {
    try {
      const { data } = await axios.get(`/api/v1/subscription/ch/${channelId}/status`, {
        withCredentials: true,
      });
      setSubscribed(data?.data?.subscribed || false);
    } catch (err) {
      console.error("Error checking subscription status:", err);
    }
  };

  const toggleSubscribe = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/v1/subscription/ch/${channelId}`, {}, { withCredentials: true });
      setSubscribed((prev) => !prev);
    } catch (err) {
      console.error("Subscription toggle failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) checkSubscriptionStatus();
  }, [user, channelId]);

  if (!user || user._id === channelId) return null;

  return (
    <button
      className={`px-4 py-2 rounded-md text-white font-medium ${
        subscribed ? "bg-gray-500" : "bg-red-600 hover:bg-red-700"
      }`}
      onClick={toggleSubscribe}
      disabled={loading}
    >
      {loading ? "..." : subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
};

export default SubscribeButton;