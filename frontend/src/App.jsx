import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { Toaster } from "react-hot-toast";

// Pages
import Home from "./pages/Home";
import Subscriptions from "./pages/Subscriptions";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Playlists from "./pages/Playlists";
import Liked from "./pages/Liked";
import Channel from "./pages/Channel";
import Watch from "./pages/Watch";
import YourVideos from "./pages/YourVideos";
import Upload from "./pages/Upload";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PlaylistDetail from "./pages/PlaylistDetail";
import MyCommunityPosts from "./pages/MyCommunityPosts";

// 🔐 PrivateRoute wrapper
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Layout>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/watch/:videoId" element={<Watch />} />
          <Route path="/channel/:username" element={<Channel />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/subscriptions"
            element={
              <PrivateRoute>
                <Subscriptions />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <PrivateRoute>
                <Playlists />
              </PrivateRoute>
            }
          />
          <Route
            path="/playlists/:playlistId"
            element={
              <PrivateRoute>
                <PlaylistDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/community"
            element={
              <PrivateRoute>
                <MyCommunityPosts />
              </PrivateRoute>
            }
          />

          <Route
            path="/liked"
            element={
              <PrivateRoute>
                <Liked />
              </PrivateRoute>
            }
          />
          <Route
            path="/your-videos"
            element={
              <PrivateRoute>
                <YourVideos />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <Upload />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
