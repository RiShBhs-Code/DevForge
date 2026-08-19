import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-display font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-md';

  const variantStyles = {
    primary: 'bg-[#A8FF00] text-[#080808] hover:bg-[#b8ff33] active:bg-[#96e600] shadow-sm hover-signal-glow',
    secondary: 'bg-transparent border border-[#242424] text-[#e3e2e2] hover:border-[#ffffff] hover:bg-[#1b1c1c]',
    ghost: 'bg-transparent text-[#c0caad] hover:text-[#ffffff] hover:bg-[#1f2020]',
    danger: 'bg-[#93000a] text-[#ffdad6] border border-[#ffb4ab]/20 hover:bg-[#b3000f]',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2.5 min-h-[40px]',
    lg: 'text-base px-6 py-3 min-h-[48px]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
