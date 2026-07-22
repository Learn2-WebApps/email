import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  const hasBg = /\bbg-\S+/.test(className);
  const hasBorder = /\bborder-\S+/.test(className);
  const bgClass = hasBg ? "" : "bg-white";
  const borderClass = hasBorder ? "" : "border-border";

  return (
    <div className={`${bgClass} ${borderClass} rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
};
