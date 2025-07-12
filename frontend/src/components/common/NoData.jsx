import React from "react";

const NoData = ({ message = "No data available." }) => {
  return (
    <div className="text-center text-gray-500 py-10 dark:text-gray-400">
      {message}
    </div>
  );
};

export default NoData;
