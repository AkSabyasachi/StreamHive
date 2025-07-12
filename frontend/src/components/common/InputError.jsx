import React from "react";

const InputError = ({ error }) => {
  if (!error) return null;

  return (
    <p className="text-sm text-red-500 mt-1 dark:text-red-400">{error}</p>
  );
};

export default InputError;
