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
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="font-mono-tag text-xs text-[#8b947a]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-[#121414] border ${
          error ? 'border-[#ffb4ab]' : 'border-[#242424]'
        } text-[#e3e2e2] placeholder-[#656464] rounded-md px-3.5 py-2.5 text-sm transition-all duration-200 focus-neon-glow ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-[#ffb4ab] mt-0.5">{error}</span>
      )}
      {!error && helperText && (
        <span className="text-xs text-[#656464] mt-0.5">{helperText}</span>
      )}
    </div>
  );
};
