// components/common/FormInput.jsx
import React from 'react';

const FormInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required, 
  disabled, 
  showCount, 
  maxLength,
  type = "text"
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
      />
      {showCount && maxLength && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default FormInput;