// src/components/layout/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  LogOut,
  Upload,
  Search,
  User,
  Video,
  Menu,
  X,
  Star,
  List,
  Home,
  Play,
  Settings,
  History,
  ListVideo,
  User2,
  ThumbsUp,
  Layers,
  Users,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowMobileSearch(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => (document.body.style.overflow = "auto");
  }, [isMobileMenuOpen]);

  // Enhanced theme-based styling to match sidebar
  const headerBg =
    theme === "dark"
      ? "bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-800/95"
      : "bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95";

  const headerBorder =
    theme === "dark"
      ? "border-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20"
      : "border-gray-200/50";

  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const textColorSecondary =
    theme === "dark" ? "text-gray-300" : "text-gray-600";
  const textColorMuted = theme === "dark" ? "text-gray-400" : "text-gray-500";

  const navItemBg =
    theme === "dark"
      ? "bg-gradient-to-r from-gray-800/30 to-gray-700/30"
      : "bg-gradient-to-r from-gray-100/50 to-gray-200/50";

  const navItemHover =
    theme === "dark"
      ? "hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20"
      : "hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80";

  const searchBg =
    theme === "dark"
      ? "bg-gradient-to-r from-gray-800/60 to-gray-700/60"
      : "bg-gradient-to-r from-white/80 to-gray-50/80";

  const searchBorder =
    theme === "dark" ? "border-gray-600/50" : "border-gray-300/50";

  const dropdownBg =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-900/98 to-slate-800/98"
      : "bg-gradient-to-br from-white/98 to-gray-50/98";

  const glassMorphism = "backdrop-blur-xl backdrop-saturate-150";

  // Sidebar-style hover effects for dropdown items
  const hoverBg =
    theme === "dark"
      ? "hover:bg-gray-700/50 hover:backdrop-blur-sm"
      : "hover:bg-gray-100/80 hover:backdrop-blur-sm";

  const dropdownItems = [
    {
      path: `/channel/${user?.username}`,
      label: "Your Channel",
      icon: <User size={16} />,
      gradient: "from-purple-500 to-blue-500",
    },
    {
      path: "/settings",
      label: "Settings",
      icon: <Settings size={16} />,
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <>
      {/* Enhanced Header with Gradient Design */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 ${headerBg} ${glassMorphism} border-b border-gray-700/30 shadow-xl`}
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 pointer-events-none" />

        <div className="relative flex items-center gap-6 w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 h-full">
          {/* Premium Logo with Gradient */}
          <Link
            to="/"
            className="flex items-center gap-3 group flex-shrink-0 relative"
            onClick={() => setIsMobileMenuOpen(false)}
            onMouseEnter={() => setHoveredItem("logo")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div
              className={`relative w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-500 ${
                hoveredItem === "logo"
                  ? "scale-110 rotate-12 shadow-purple-500/30"
                  : "group-hover:scale-105"
              }`}
            >
              <Play size={20} className="text-white ml-0.5" />
              {hoveredItem === "logo" && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-xl blur opacity-50 -z-10" />
              )}
            </div>
            <span
              className={`text-xl font-bold transition-all duration-300 ${
                hoveredItem === "logo" ? "transform scale-105" : ""
              }`}
            >
              <span className="text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 bg-clip-text">
                Stream
              </span>
              <span
                className={theme === "dark" ? "text-white" : "text-gray-900"}
              >
                Hive
              </span>
            </span>
          </Link>

          {/* Enhanced Navigation with Gradient Pills */}
          <nav className="hidden md:flex items-center gap-2 ml-6">
            {[
              {
                path: "/",
                label: "Home",
                icon: <Home size={16} />,
                gradient: "from-purple-500 to-blue-500",
              },
              {
                path: "/subscriptions",
                label: "Subscriptions",
                icon: <Star size={16} />,
                gradient: "from-blue-500 to-indigo-500",
              },
              {
                path: "/playlists",
                label: "Playlists",
                icon: <List size={16} />,
                gradient: "from-indigo-500 to-purple-500",
              },
            ].map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${textColorSecondary} overflow-hidden group`}
                onMouseEnter={() => setHoveredItem(`nav-${index}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}
                />

                <span
                  className={`relative z-10 transition-all duration-300 ${
                    hoveredItem === `nav-${index}`
                      ? `transform scale-110 text-transparent bg-gradient-to-r ${item.gradient} bg-clip-text`
                      : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`relative z-10 text-sm font-medium transition-all duration-300 ${
                    hoveredItem === `nav-${index}`
                      ? `text-transparent bg-gradient-to-r ${item.gradient} bg-clip-text`
                      : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Premium Search Bar with Gradient Focus */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-8"
          >
            <div className="relative w-full group">
              <div
                className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                  isSearchFocused ? "opacity-100 scale-105" : ""
                }`}
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search videos, channels, and more..."
                className={`relative w-full py-3 pl-12 pr-24 rounded-full ${searchBg} ${glassMorphism} border ${searchBorder} focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 focus:shadow-lg text-sm ${textColor} placeholder-gray-400`}
                aria-label="Search videos"
              />

              <Search
                size={18}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  isSearchFocused ? "text-purple-400" : textColorMuted
                }`}
              />

              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 hover:from-purple-500 hover:to-blue-500 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Mobile Search Toggle */}
            <button
              className={`md:hidden p-2.5 rounded-lg ${textColorSecondary} hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 transition-all duration-300 hover:scale-105 hover:text-purple-400`}
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Enhanced Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-all duration-500 transform hover:scale-105 ${
                theme === "dark"
                  ? "text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-400/20 hover:to-orange-400/20 hover:shadow-yellow-400/20"
                  : "text-slate-600 hover:bg-gradient-to-r hover:from-slate-600/20 hover:to-gray-600/20"
              } hover:shadow-lg`}
              aria-label="Toggle theme"
              onMouseEnter={() => setHoveredItem("theme")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {theme === "dark" ? (
                <Sun
                  size={18}
                  className={`transition-all duration-500 ${
                    hoveredItem === "theme"
                      ? "transform rotate-180 scale-110"
                      : ""
                  }`}
                />
              ) : (
                <Moon
                  size={18}
                  className={`transition-all duration-500 ${
                    hoveredItem === "theme"
                      ? "transform -rotate-12 scale-110"
                      : ""
                  }`}
                />
              )}
            </button>

            {/* Premium Upload Button */}
            {user && (
              <Link
                to="/upload"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 active:scale-95 hover:from-purple-500 hover:to-blue-500 relative overflow-hidden group"
                onMouseEnter={() => setHoveredItem("upload")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Upload
                  size={16}
                  className={`relative z-10 transition-all duration-300 ${
                    hoveredItem === "upload"
                      ? "transform -translate-y-0.5 scale-110"
                      : ""
                  }`}
                />
                <span className="relative z-10">Upload</span>
              </Link>
            )}

            {/* Enhanced User Profile */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="focus:outline-none flex items-center gap-2 group transition-all duration-300 hover:scale-105 relative"
                  aria-label="User menu"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="relative w-9 h-9 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-0.5 shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover border border-white/20 transition-all duration-300 group-hover:border-white/40"
                    />
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-gray-800" />
                  </div>
                </button>

                {/* Enhanced Dropdown with Sidebar-style Hover Effects */}
                {isDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-3 ${dropdownBg} ${glassMorphism} rounded-xl shadow-2xl w-72 overflow-hidden z-50 border border-gray-700/30 transform transition-all duration-300 scale-100 opacity-100`}
                  >
                    {/* Header with gradient */}
                    <div className="relative px-5 py-4 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 border-b border-gray-700/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-0.5 shadow-lg">
                          <img
                            src={user.avatar || "/default-avatar.png"}
                            alt={user.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-semibold truncate ${textColor}`}
                          >
                            {user.fullName}
                          </p>
                          <p className="text-xs text-purple-400 truncate font-medium">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items with Sidebar-style Hover Effects */}
                    <div className="py-2">
                      {dropdownItems.map((item, index) => (
                        <div
                          key={index}
                          className="relative"
                          onMouseEnter={() => setHoveredDropdownItem(index)}
                          onMouseLeave={() => setHoveredDropdownItem(null)}
                        >
                          <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-5 py-3 text-sm ${textColor} ${hoverBg} transition-all duration-300 transform group relative overflow-hidden ${
                              hoveredDropdownItem === index
                                ? "scale-105 translate-x-1"
                                : ""
                            }`}
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            {/* Background effect */}
                            <div
                              className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                            />

                            <div
                              className={`w-8 h-8 bg-gradient-to-r ${
                                item.gradient
                              } rounded-lg flex items-center justify-center transition-transform duration-300 ${
                                hoveredDropdownItem === index ? "scale-110" : ""
                              }`}
                            >
                              <span className="text-white relative z-10">
                                {item.icon}
                              </span>
                            </div>
                            <span
                              className={`font-medium relative z-10 transition-all duration-300 ${
                                hoveredDropdownItem === index
                                  ? `text-transparent bg-gradient-to-r ${item.gradient} bg-clip-text`
                                  : ""
                              }`}
                            >
                              {item.label}
                            </span>

                            {/* Hover indicator */}
                            {hoveredDropdownItem === index && (
                              <div
                                className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${item.gradient} rounded-r-full transition-all duration-200`}
                              ></div>
                            )}
                          </Link>
                        </div>
                      ))}

                      <div className="mx-2 my-2 h-px bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20" />

                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredDropdownItem("logout")}
                        onMouseLeave={() => setHoveredDropdownItem(null)}
                      >
                        <button
                          onClick={handleLogout}
                          className={`w-full text-left flex items-center gap-3 px-5 py-3 text-sm transition-all duration-300 transform group relative overflow-hidden ${
                            hoveredDropdownItem === "logout"
                              ? "scale-105 translate-x-1"
                              : ""
                          } ${
                            theme === "dark"
                              ? "hover:text-red-400 hover:bg-gray-700/50"
                              : "hover:text-red-600 hover:bg-gray-100/80"
                          }`}
                        >
                          {/* Background effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <div
                            className={`w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center transition-transform duration-300 ${
                              hoveredDropdownItem === "logout"
                                ? "scale-110"
                                : ""
                            }`}
                          >
                            <LogOut
                              size={16}
                              className="text-white relative z-10"
                            />
                          </div>
                          <span
                            className={`font-medium relative z-10 transition-all duration-300 ${
                              hoveredDropdownItem === "logout"
                                ? "text-transparent bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text"
                                : ""
                            }`}
                          >
                            Sign Out
                          </span>

                          {/* Hover indicator */}
                          {hoveredDropdownItem === "logout" && (
                            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-pink-500 rounded-r-full transition-all duration-200"></div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-white hover:from-gray-700/80 hover:to-gray-600/80"
                      : "bg-gradient-to-r from-gray-100/80 to-gray-200/80 text-gray-900 hover:from-gray-200/80 hover:to-gray-300/80"
                  } hover:shadow-lg`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 hover:from-purple-500 hover:to-blue-500 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className={`md:hidden p-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 mobile-menu-button ${textColorSecondary} hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 hover:text-purple-400`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className={`fixed top-16 left-0 right-0 bottom-0 ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-900/98 via-slate-900/98 to-gray-800/98"
              : "bg-gradient-to-br from-white/98 via-gray-50/98 to-white/98"
          } ${glassMorphism} z-40 p-4 overflow-y-auto md:hidden`}
        >
          <div className="flex flex-col space-y-4 max-w-md mx-auto">
            {/* User Profile Section */}
            {user ? (
              <div className="p-5 mb-4 border border-gray-700/30 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-0.5 shadow-lg">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`${textColor} font-semibold text-base`}>
                      {user.fullName}
                    </p>
                    <p className="text-purple-400 font-medium text-sm">
                      @{user.username}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 mb-6">
                <Link
                  to="/login"
                  className={`flex-1 text-center px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-white hover:from-gray-700/80 hover:to-gray-600/80"
                      : "bg-gradient-to-r from-gray-100/80 to-gray-200/80 text-gray-900 hover:from-gray-200/80 hover:to-gray-300/80"
                  } hover:shadow-lg`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 text-center px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Enhanced Navigation Links - All Sidebar Items */}
            <div className="space-y-3">
              {[
                {
                  path: "/",
                  label: "Home",
                  icon: <Home size={22} />,
                  gradient: "from-purple-500 to-blue-500",
                },
                {
                  path: "/subscriptions",
                  label: "Subscriptions",
                  icon: <Users size={22} />,
                  gradient: "from-blue-500 to-indigo-500",
                },
                ...(user
                  ? [
                      {
                        path: "/dashboard",
                        label: "Dashboard",
                        icon: <User2 size={22} />,
                        gradient: "from-cyan-500 to-blue-500",
                      },
                      {
                        path: "/history",
                        label: "History",
                        icon: <History size={22} />,
                        gradient: "from-amber-500 to-orange-500",
                      },
                      {
                        path: "/playlists",
                        label: "Playlists",
                        icon: <ListVideo size={22} />,
                        gradient: "from-indigo-500 to-purple-500",
                      },
                      {
                        path: "/community",
                        label: "My Posts",
                        icon: <Layers size={22} />,
                        gradient: "from-green-500 to-teal-500",
                      },
                      {
                        path: "/your-videos",
                        label: "Your Videos",
                        icon: <Video size={22} />,
                        gradient: "from-red-500 to-pink-500",
                      },
                      {
                        path: "/liked",
                        label: "Liked Videos",
                        icon: <ThumbsUp size={22} />,
                        gradient: "from-pink-500 to-rose-500",
                      },
                      {
                        path: "/upload",
                        label: "Upload Video",
                        icon: <Upload size={22} />,
                        gradient: "from-teal-500 to-emerald-500",
                      },
                      {
                        path: `/channel/${user?.username}`,
                        label: "Your Channel",
                        icon: <User size={22} />,
                        gradient: "from-purple-500 to-blue-500",
                      },
                    ]
                  : []),
                // Theme toggle button
                {
                  path: "#theme-toggle",
                  label: theme === "light" ? "Dark Mode" : "Light Mode",
                  icon:
                    theme === "light" ? <Moon size={22} /> : <Sun size={22} />,
                  gradient: "from-yellow-500 to-amber-500",
                  action: toggleTheme,
                },
                ...(user
                  ? [
                      {
                        path: "#logout",
                        label: "Sign Out",
                        icon: <LogOut size={22} />,
                        gradient: "from-red-500 to-pink-500",
                        action: handleLogout,
                      },
                    ]
                  : [
                      {
                        path: "/login",
                        label: "Login",
                        icon: <LogIn size={22} />,
                        gradient: "from-blue-500 to-indigo-500",
                      },
                      {
                        path: "/signup",
                        label: "Sign Up",
                        icon: <UserPlus size={22} />,
                        gradient: "from-purple-500 to-pink-500",
                      },
                    ]),
              ].map((item, index) => (
                <div key={index}>
                  {item.path.startsWith("#") ? (
                    <button
                      onClick={() => {
                        if (item.action) item.action();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`relative flex items-center gap-4 px-5 py-4 rounded-xl ${navItemBg} ${glassMorphism} border ${searchBorder} transition-all duration-300 group overflow-hidden w-full text-left`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      />
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                      >
                        <span className="text-white">{item.icon}</span>
                      </div>
                      <span
                        className={`text-base font-medium ${textColor} transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${item.gradient}`}
                      >
                        {item.label}
                      </span>
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`relative flex items-center gap-4 px-5 py-4 rounded-xl ${navItemBg} ${glassMorphism} border ${searchBorder} transition-all duration-300 group overflow-hidden`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      />
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                      >
                        <span className="text-white">{item.icon}</span>
                      </div>
                      <span
                        className={`text-base font-medium ${textColor} transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${item.gradient}`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;