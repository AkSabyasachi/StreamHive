import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

import Home from "./pages/Home";
import Subscriptions from "./pages/Subscriptions";
import You from "./pages/You";
import History from "./pages/History";
import Playlists from "./pages/Playlists";
import Liked from "./pages/Liked";
import Channel from "./pages/Channel";
import Watch from "./pages/Watch";
import YourVideos from "./pages/YourVideos";
import Upload from "./pages/Upload";


function App() {
  return (
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:videoId" element={<Watch />} />
            <Route path="/channel/:username" element={<Channel />} />

            {/* Protected/User Routes */}
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/you" element={<You />} />
            <Route path="/history" element={<History />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/liked" element={<Liked />} />
            <Route path="/your-videos" element={<YourVideos />} />
            <Route path="/upload" element={<Upload />} />

          </Routes>
        </Layout>
      </Router>
  )
}

export default App