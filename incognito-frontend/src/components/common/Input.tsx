import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 sm:px-4 sm:py-3 bg-[#131313] border rounded-lg
          text-sm sm:text-base text-white placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-white/10'}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};