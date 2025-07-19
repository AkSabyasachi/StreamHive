import React from "react";
import { Link } from "react-router-dom";
import { 
  FaTwitter, 
  FaYoutube, 
  FaDiscord, 
  FaInstagram,
  FaTiktok,
  FaTwitch
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { Play } from "lucide-react";

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/streamhive", icon: <FaTwitter className="w-5 h-5" /> },
    { name: "YouTube", href: "https://youtube.com/streamhive", icon: <FaYoutube className="w-5 h-5" /> },
    { name: "Discord", href: "https://discord.gg/streamhive", icon: <FaDiscord className="w-5 h-5" /> },
    { name: "Instagram", href: "https://instagram.com/streamhive", icon: <FaInstagram className="w-5 h-5" /> },
    { name: "TikTok", href: "https://tiktok.com/@streamhive", icon: <FaTiktok className="w-5 h-5" /> },
    { name: "Twitch", href: "https://twitch.tv/streamhive", icon: <FaTwitch className="w-5 h-5" /> },
  ];

  // Theme-based styling
  const footerBg = theme === 'dark' 
    ? 'bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-800/95' 
    : 'bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95';
    
  const borderStyle = theme === 'dark' 
    ? 'border-t border-gray-700/30' 
    : 'border-t border-gray-200/50';
    
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const glassEffect = 'backdrop-blur-xl backdrop-saturate-150';

  return (
    <footer className={`${footerBg} ${borderStyle} ${glassEffect} ${textColor} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Enhanced Logo - Matches Header */}
          <Link to="/" className="flex items-center mb-6 md:mb-0 group">
            <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
              <Play size={20} className="text-white ml-0.5" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            </div>
            <div className="ml-3">
              <div className="text-xl font-bold">
                <span className="text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 bg-clip-text">
                  Stream
                </span>
                <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                  Hive
                </span>
              </div>
              <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Where creators thrive
              </div>
            </div>
          </Link>
          
          {/* Social Links with enhanced hover effects */}
          <div className="flex flex-wrap justify-center gap-4 mb-6 md:mb-0">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  p-2 rounded-full transition-all duration-300 transform hover:scale-110
                  ${theme === 'dark' 
                    ? 'bg-gray-800/50 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30' 
                    : 'bg-gray-100 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80'}
                `}
                aria-label={social.name}
              >
                <div className={`transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  {social.icon}
                </div>
              </a>
            ))}
          </div>
          
          {/* Copyright and links */}
          <div className={`text-center md:text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-sm mb-2">
              © {currentYear} StreamHive. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <Link to="/terms" className="hover:text-purple-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-purple-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/contact" className="hover:text-purple-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;