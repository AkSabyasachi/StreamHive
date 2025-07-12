// src/pages/Search.jsx
import React, { useState } from "react";

const Search = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="py-6 px-4">
      <h1 className="text-2xl font-semibold mb-6">Search</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for videos or channels..."
        className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      {query && (
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          Showing results for: <strong>{query}</strong>
        </p>
      )}

      {/* In real case, this is where results would render */}
      <div className="mt-6 text-center text-gray-400">Search results will appear here...</div>
    </div>
  );
};

export default Search;
