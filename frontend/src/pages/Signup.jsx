// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { FaEye, FaEyeSlash, FaUser, FaImage, FaSun, FaMoon } from "react-icons/fa";
import { Play } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    avatar: null,       // required
    coverImage: null,   // optional
  });

  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));
      
      // Create preview for images
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === "avatar") {
          setAvatarPreview(reader.result);
        } else if (name === "coverImage") {
          setCoverPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields (frontend level) - exactly like working code
    if (!form.fullname || !form.username || !form.email || !form.password || !form.avatar) {
      setError("Please fill all required fields and upload avatar");
      return;
    }

    // Create FormData exactly like working code
    const formData = new FormData();
    formData.append("fullname", form.fullname);
    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("avatar", form.avatar); // ✅ required

    if (form.coverImage) {
      formData.append("coverimage", form.coverImage); // ✅ optional - exact same as working code
    }

    const result = await signup(formData);

    if (result.success) {
      navigate("/"); // redirect to homepage or dashboard
    } else {
      setError(result.message || "Signup failed");
    }
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
            <Link to="/" className="flex items-center group">
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
            </Link>
          </div>
          <p className={`text-center text-lg ${secondaryTextColor}`}>
            Join our community of creators and viewers. Share your world.
          </p>
        </div>
        
        <div className="mt-12">
          <p className={`text-center text-sm ${secondaryTextColor}`}>
            Start your streaming journey today
          </p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className={`w-full md:w-3/5 flex items-center justify-center p-6 ${rightPanelBg}`}>
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className={`text-3xl font-bold ${textColor} mb-2`}>Create Your Account</h2>
            <p className={secondaryTextColor}>
              Join StreamHive to start your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className={`${theme === 'dark' ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-100 border-red-300 text-red-700'} border px-4 py-3 rounded-lg text-sm`}>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${secondaryTextColor} mb-1`}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FaUser className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="fullname"
                    placeholder="John Doe"
                    value={form.fullname}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${textColor} placeholder-gray-400 transition-all`}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${secondaryTextColor} mb-1`}>
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <span className="text-sm">@</span>
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="john_doe"
                    value={form.username}
                    onChange={handleChange}
                    className={`w-full pl-8 pr-4 py-3 ${inputBg} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${textColor} placeholder-gray-400 transition-all`}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${secondaryTextColor} mb-1`}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${textColor} placeholder-gray-400 transition-all`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${secondaryTextColor} mb-1`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 ${inputBg} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${textColor} placeholder-gray-400 transition-all`}
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

            <div className="space-y-4">
              <div className={`${inputBg} p-4 rounded-lg border ${inputBorder}`}>
                <label className={`block text-sm font-medium ${secondaryTextColor} mb-3`}>
                  <span className="flex items-center">
                    <FaUser className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    Avatar (required)
                  </span>
                </label>
                <div className="flex flex-col items-center">
                  {avatarPreview ? (
                    <div className="mb-4">
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow-md"
                      />
                    </div>
                  ) : (
                    <div className={`w-24 h-24 rounded-full ${theme === 'dark' ? 'bg-slate-600' : 'bg-gray-200'} border-2 border-dashed ${theme === 'dark' ? 'border-slate-500' : 'border-gray-400'} flex items-center justify-center mb-4`}>
                      <FaUser className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <label className={`cursor-pointer ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-lg transition-all flex items-center`}>
                    <FaImage className="mr-2" />
                    Choose Avatar
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              </div>
              
              <div className={`${inputBg} p-4 rounded-lg border ${inputBorder}`}>
                <label className={`block text-sm font-medium ${secondaryTextColor} mb-3`}>
                  <span className="flex items-center">
                    <FaImage className="mr-2 text-gray-400" />
                    Cover Image (optional)
                  </span>
                </label>
                <div className="flex flex-col items-center">
                  {coverPreview ? (
                    <div className="mb-4 w-full">
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-full h-32 rounded-md object-cover border border-blue-500"
                      />
                    </div>
                  ) : (
                    <div className={`w-full h-32 rounded-md ${theme === 'dark' ? 'bg-slate-600' : 'bg-gray-200'} border-2 border-dashed ${theme === 'dark' ? 'border-slate-500' : 'border-gray-400'} flex items-center justify-center mb-4`}>
                      <FaImage className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <label className={`cursor-pointer ${theme === 'dark' ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-200 hover:bg-gray-300'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} px-4 py-2 rounded-lg transition-all flex items-center`}>
                    <FaImage className="mr-2" />
                    Choose Cover
                    <input
                      type="file"
                      name="coverImage"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              Create Account
            </button>

            <div className="mt-6 text-center text-sm">
              <p className={secondaryTextColor}>
                Already have an account?{" "}
                <a 
                  href="#" 
                  className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;