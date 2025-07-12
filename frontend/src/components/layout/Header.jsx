import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { Sun, Moon } from "lucide-react";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 bg-gray-900 text-white shadow-md">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">S</span>
        </div>
        <span className="text-xl font-bold text-red-500">StreamHive</span>
      </Link>

      <div className="flex-1 max-w-xl mx-4">
        <input
          type="text"
          placeholder="Search videos..."
          className="w-full py-2 px-4 rounded-full bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="hover:text-yellow-400 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <Link to="/login" className="px-4 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition">
          Login
        </Link>
        <Link to="/register" className="px-4 py-1 rounded-md bg-red-600 hover:bg-red-700 transition text-white">
          Sign Up
        </Link>
      </div>
    </header>
  );
};

export default Header;
