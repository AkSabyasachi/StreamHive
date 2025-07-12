// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
        Oops! The page you're looking for doesn’t exist.
      </p>
      <Link
        to="/"
        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
