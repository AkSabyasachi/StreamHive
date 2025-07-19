import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  LogIn,
  UserPlus,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Hide sidebar on Watch pages AND mobile devices
  const isWatchPage = pathname.includes("/watch");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => pathname === path;

  const menuItems = [
    { path: "/", label: "Home", icon: <Home size={20} /> },
    { path: "/subscriptions", label: "Subscriptions", icon: <Users size={20} /> },
    { divider: true },

    ...(user
      ? [
          { path: "/dashboard", label: "Dashboard", icon: <User2 size={20} /> },
          { path: "/history", label: "History", icon: <History size={20} /> },
          { path: "/playlists", label: "Playlists", icon: <ListVideo size={20} /> },
          { path: "/community", label: "My Posts", icon: <Layers size={20} /> },
          { path: "/your-videos", label: "Your Videos", icon: <Video size={20} /> },
          { path: "/liked", label: "Liked Videos", icon: <ThumbsUp size={20} /> },
        ]
      : []),
    
    // Theme toggle button
    {
      path: "#theme-toggle",
      label: theme === 'light' ? "Dark Mode" : "Light Mode",
      icon: theme === 'light' ? <Moon size={20} /> : <Sun size={20} />,
      action: toggleTheme
    },
    
    { divider: true },

    ...(user
      ? [
          {
            path: "#logout",
            label: "Logout",
            icon: <LogOut size={20} />,
            action: handleLogout,
            isLogout: true
          },
        ]
      : [
          { path: "/login", label: "Login", icon: <LogIn size={20} /> },
          { path: "/signup", label: "Sign Up", icon: <UserPlus size={20} /> },
        ]),
  ];

  // Don't render sidebar on Watch pages OR mobile devices
  if (isWatchPage || isMobile) {
    return null;
  }

  // Enhanced theme-based colors
  const bgColor = theme === 'dark' 
    ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
    : 'bg-gradient-to-b from-white to-gray-50';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const hoverBg = theme === 'dark' 
    ? 'hover:bg-gray-700/50 hover:backdrop-blur-sm' 
    : 'hover:bg-gray-100/80 hover:backdrop-blur-sm';
  const activeBg = theme === 'dark' 
    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25' 
    : 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25';
  const activeText = 'text-white';
  const iconColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <aside
      className={`fixed top-16 h-[calc(100vh-64px)] z-50 ${bgColor} border-r ${borderColor} transition-all duration-300 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent ${
        isCollapsed ? "w-16" : "w-64"
      } shadow-xl`}
    >
      {/* Header */}
      <div
        className={`flex items-center p-4 border-b ${borderColor} backdrop-blur-sm ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <h2 className={`text-lg font-bold ${textColor} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
            Navigation
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg ${hoverBg} transition-all duration-200 ${iconColor} hover:scale-105 active:scale-95`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 px-3 py-4">
        {menuItems.map((item, index) =>
          item.divider ? (
            <div key={`divider-${index}`} className={`border-t ${borderColor} my-3 opacity-50`} />
          ) : (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`w-full text-left flex items-center p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive(item.path)
                    ? `${activeBg} ${activeText} font-semibold transform scale-105`
                    : item.isLogout
                    ? `${hoverBg} ${textColor} hover:text-red-500`
                    : `${hoverBg} ${textColor} hover:transform hover:scale-105`
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                {/* Background effect for active item */}
                {isActive(item.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl"></div>
                )}
                
                {/* Icon with animation */}
                <span className={`relative z-10 transition-all duration-200 ${
                  isActive(item.path) 
                    ? activeText 
                    : item.isLogout 
                    ? 'group-hover:text-red-500' 
                    : iconColor
                } ${hoveredItem === index ? 'transform scale-110' : ''}`}>
                  {item.icon}
                </span>
                
                {/* Label with slide animation */}
                {!isCollapsed && (
                  <span className={`ml-4 truncate relative z-10 transition-all duration-200 ${
                    hoveredItem === index ? 'transform translate-x-1' : ''
                  }`}>
                    {item.label}
                  </span>
                )}
                
                {/* Hover indicator */}
                {!isActive(item.path) && hoveredItem === index && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full transition-all duration-200"></div>
                )}
              </button>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && hoveredItem === index && (
                <div className={`absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-white border border-gray-600' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  {item.label}
                  <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 ${
                    theme === 'dark' ? 'bg-gray-800 border-l border-b border-gray-600' : 'bg-white border-l border-b border-gray-200'
                  }`}></div>
                </div>
              )}
            </div>
          )
        )}
      </nav>

      {/* Footer */}
      {user && !isCollapsed && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${borderColor} backdrop-blur-sm`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User2 size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${textColor} truncate`}>
                {user.fullName || user.username}
              </p>
              <p className={`text-xs ${iconColor} truncate`}>
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;