import React, { useEffect, useState } from "react";
import axios from "axios";
import PlaylistCard from "../components/common/PlaylistCard";
import VideoSkeleton from "../components/common/videoSkeleton";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = async () => {
    try {
      const { data } = await axios.get("/api/v1/playlist/user", {
        withCredentials: true,
      });
      setPlaylists(data?.data || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-6">Your Playlists</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <p className="text-gray-500">No playlists found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist._id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;
