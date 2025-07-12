// src/components/common/FormTextarea.jsx
import React from "react";

const FormTextarea = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  rows = 4,
  ...rest
}) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        {...rest}
        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-blue-400"
        } dark:bg-gray-800 dark:text-white`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormTextarea;
