import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaYoutube, FaDiscord, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/streamhive", icon: <FaTwitter className="w-5 h-5" /> },
    { name: "YouTube", href: "https://youtube.com/streamhive", icon: <FaYoutube className="w-5 h-5" /> },
    { name: "Discord", href: "https://discord.gg/streamhive", icon: <FaDiscord className="w-5 h-5" /> },
    { name: "Instagram", href: "https://instagram.com/streamhive", icon: <FaInstagram className="w-5 h-5" /> },
  ];

  return (
    <footer className="mt-auto bg-gray-900 text-gray-300 border-t border-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <span className="text-lg font-bold text-white">StreamHive</span>
            </Link>
          </div>

          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-700"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 dark:border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} StreamHive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;