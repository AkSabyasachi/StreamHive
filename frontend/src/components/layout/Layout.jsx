import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import Footer from "./Footer.jsx";
import { useTheme } from "../../context/ThemeContext";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const isWatchPage = pathname.includes("/watch");

  // Theme-based background colors
  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';

  return (
    <div className={`flex flex-col min-h-screen ${bgColor} ${textColor}`}>
      <Header />
      
      <div className="flex flex-1 pt-16 z-10">
        {/* Sidebar - Only visible on desktop (md+) and when not on watch page */}
        {!isWatchPage && <Sidebar />}
        
        {/* Main Content */}
        <main className={`flex-1 px-4 pb-6 ${
          isWatchPage 
            ? "w-full" 
            : "w-full lg:ml-64" // Full width on mobile/tablet, leave space for sidebar on large screens
        }`}>
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}