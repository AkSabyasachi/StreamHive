// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { FaEye, FaEyeSlash, FaSun, FaMoon } from "react-icons/fa";
import { Play } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [credentials, setCredentials] = useState({ emailOrUsername: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = credentials.emailOrUsername.includes("@")
      ? { email: credentials.emailOrUsername, password: credentials.password }
      : { username: credentials.emailOrUsername, password: credentials.password };

    const response = await login(payload.email || payload.username, payload.password);

    if (response.success) {
      navigate("/");
    } else {
      setError(response.message || "Login failed");
    }
    setLoading(false);
  };

  // Theme-based colors
  const leftPanelBg = theme === 'dark' 
    ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900' 
    : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
  
  const rightPanelBg = theme === 'dark' 
    ? 'bg-slate-800' 
    : 'bg-gray-50';
  
  const inputBg = theme === 'dark' 
    ? 'bg-slate-700' 
    : 'bg-white';
  
  const inputBorder = theme === 'dark' 
    ? 'border-slate-600' 
    : 'border-gray-300';
  
  const textColor = theme === 'dark' 
    ? 'text-white' 
    : 'text-gray-800';
  
  const secondaryTextColor = theme === 'dark' 
    ? 'text-gray-300' 
    : 'text-gray-500';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-10 p-3 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-sm hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <FaSun className="text-yellow-300" /> : <FaMoon className="text-indigo-700" />}
      </button>

      {/* Left Side - Branding Section */}
      <div className={`w-full md:w-2/5 flex flex-col justify-center items-center p-8 ${leftPanelBg} ${textColor}`}>
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center group">
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                <Play size={20} className="text-white ml-0.5" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </div>
              <div className="ml-3">
                <div className="text-4xl font-bold">
                  <span className="text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 bg-clip-text">
                    Stream
                  </span>
                  <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                    Hive
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className={`text-center text-lg ${secondaryTextColor}`}>
            Welcome back! Sign in to continue your streaming journey.
          </p>
        </div>
        
        <div className="mt-12">
          <p className={`text-center text-sm ${secondaryTextColor}`}>
            Join millions of creators and viewers
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={`w-full md:w-3/5 flex items-center justify-center p-6 ${rightPanelBg}`}>
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className={`text-3xl font-bold ${textColor} mb-2`}>Welcome Back</h2>
            <p className={secondaryTextColor}>
              Sign in to your StreamHive account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`${theme === 'dark' ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-100 border-red-300 text-red-700'} border px-4 py-3 rounded-lg text-sm`}>
                {error}
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${secondaryTextColor} mb-2`}>
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="emailOrUsername"
                  value={credentials.emailOrUsername}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${textColor} placeholder-gray-400 transition-all`}
                  placeholder="Enter your username or email"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${secondaryTextColor} mb-2`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 ${inputBg} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${textColor} placeholder-gray-400 transition-all`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${secondaryTextColor} hover:text-blue-500`}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className={`rounded ${inputBorder} ${inputBg} text-blue-500 focus:ring-blue-500 focus:ring-offset-0`}
                />
                <span className={`ml-2 text-sm ${secondaryTextColor}`}>Remember me</span>
              </label>
              <a href="#" className={`text-sm text-blue-500 hover:text-blue-400 transition-colors`}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="mt-6 text-center text-sm">
              <p className={secondaryTextColor}>
                Don't have an account?{" "}
                <a 
                  href="#" 
                  className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/signup");
                  }}
                >
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;