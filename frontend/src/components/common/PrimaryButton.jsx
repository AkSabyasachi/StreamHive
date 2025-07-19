import React from "react";
import { Link } from "react-router-dom";

const PrimaryButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
  className = "",
  to = null,
  gradient = "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
  icon,
  Icon,
  iconPosition = "left",
  ...props
}) => {
  const iconNode = icon
    ? <span className="text-lg">{icon}</span>
    : Icon
    ? <Icon size={18} />
    : null;

  const baseStyles = `
    bg-gradient-to-r ${gradient}
    text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg
    transition-all duration-300
    disabled:opacity-70 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
    ${className}
  `;

  const content = isLoading ? (
    <>
      <span className="h-3 w-3 bg-white rounded-full animate-pulse"></span>
      Processing...
    </>
  ) : (
    <>
      {iconNode && iconPosition === "left" && iconNode}
      {children}
      {iconNode && iconPosition === "right" && iconNode}
    </>
  );

  // 🔁 Renders as Link / <a> / <button> depending on 'to'
  if (to) {
    const isExternal = typeof to === "string" && to.startsWith("http");
    return isExternal ? (
      <a href={to} target="_blank" rel="noopener noreferrer" className={baseStyles} {...props}>
        {content}
      </a>
    ) : (
      <Link to={to} className={baseStyles} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={baseStyles}
      {...props}
    >
      {content}
    </button>
  );
};

export default PrimaryButton;
