// components/common/RadioCard.jsx
import React from 'react';

const RadioCard = ({ 
  value, 
  label, 
  description, 
  checked, 
  onChange, 
  name, 
  icon: Icon 
}) => {
  return (
    <label className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
      checked 
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
    }`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
      <Icon className={`mt-0.5 ${checked ? "text-blue-500" : "text-gray-400"}`} size={20} />
      <div className="flex-1">
        <div className={`font-medium ${checked ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
          {label}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </div>
      </div>
    </label>
  );
};

export default RadioCard;