import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className="mb-1 text-sm font-medium text-textPrimary">
          {label}
        </label>
      )}
      <input
        className={`px-3 py-2 border rounded outline-none transition-colors
          ${error ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}
          disabled:bg-surface disabled:text-gray-500`}
        {...props}
      />
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};
