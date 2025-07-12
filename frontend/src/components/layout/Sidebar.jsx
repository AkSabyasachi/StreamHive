import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  History,
  ListVideo,
  User2,
  ThumbsUp,
  Layers,
  LogOut,
  Video,
  Users,
} from "lucide-react";

const Sidebar = () => {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const matches = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(matches);
      if (matches) setIsCollapsed(true);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    { path: "/", label: "Home", icon: <Home size={20} /> },
    { path: "/subscriptions", label: "Subscriptions", icon: <Users size={20} /> },
    { divider: true },
    { path: "/you", label: "Your Channel", icon: <User2 size={20} /> },
    { path: "/history", label: "History", icon: <History size={20} /> },
    { path: "/playlists", label: "Playlists", icon: <ListVideo size={20} /> },
    { path: "/your-videos", label: "Your Videos", icon: <Video size={20} /> },
    { divider: true },
    { path: "/liked", label: "Liked Videos", icon: <ThumbsUp size={20} /> },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside
        className={`fixed top-16 h-[calc(100vh-64px)] z-30 bg-white dark:bg-gray-900 border-r dark:border-gray-700 transition-all duration-300 overflow-y-auto ${
          isCollapsed ? "w-16" : "w-64"
        } ${isMobile ? `${isCollapsed ? "-translate-x-full" : "translate-x-0"}` : ""}`}
      >
        <div
          className={`flex items-center p-4 border-b dark:border-gray-700 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && <h2 className="text-lg font-semibold dark:text-white">Menu</h2>}

          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? "»" : "«"}
            </button>
          )}
        </div>

        <nav className="space-y-1 px-2 py-4">
          {menuItems.map((item, index) =>
            item.divider ? (
              <div key={`divider-${index}`} className="border-t dark:border-gray-700 my-2" />
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-4">{item.label}</span>}
              </Link>
            )
          )}
        </nav>
      </aside>

      {/* Mobile Toggle */}
      {isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed bottom-4 left-4 z-50 md:hidden bg-red-600 p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isCollapsed ? "☰" : "✕"}
        </button>
      )}
    </>
  );
};

export default Sidebar;
