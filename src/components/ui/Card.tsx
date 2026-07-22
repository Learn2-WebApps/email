import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  const hasBg = className.includes('bg-');
  const hasBorder = className.includes('border-');
  const defaultClasses = `${hasBg ? '' : 'bg-white'} ${hasBorder ? '' : 'border border-border'}`;

  return (
    <div className={`${defaultClasses} rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
};
