// src/components/common/EmptyState.jsx
import React from "react";
import { motion } from "framer-motion";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

const EmptyState = ({
  icon,
  title = "Nothing here yet",
  description,
  actions,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full h-24 w-24 mb-6 shadow-lg">
        {icon || (
          <div className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none">
              <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h2>
      
      {description && (
        <p className="text-gray-600 dark:text-gray-300 max-w-md mb-8 text-lg">
          {description}
        </p>
      )}
      
      {actions && (
        <div className="flex flex-wrap justify-center gap-3">
          {actions}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;