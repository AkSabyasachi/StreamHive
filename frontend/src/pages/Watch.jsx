// src/pages/Watch.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Watch = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVideo = async () => {
    try {
      const { data } = await axios.get(`/api/v1/videos/${videoId}`);
      setVideo(data?.data);
    } catch (error) {
      console.error("Error fetching video:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  return (
    <div className="py-6">
      {loading ? (
        <p>Loading...</p>
      ) : video ? (
        <div>
          <video
            controls
            className="w-full max-h-[500px] rounded-lg"
            src={video.videoFile.url}
          />
          <h1 className="text-xl font-semibold mt-4">{video.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{video.description}</p>
        </div>
      ) : (
        <p className="text-red-500">Video not found.</p>
      )}
    </div>
  );
};

export default Watch;
