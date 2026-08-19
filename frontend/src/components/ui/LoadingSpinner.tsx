import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading DevForge...',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div className={`${sizeMap[size]} border-2 border-[#242424] border-t-[#A8FF00] rounded-full animate-spin`} />
      {label && (
        <span className="font-mono-tag text-xs text-[#8b947a] tracking-wider animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};
