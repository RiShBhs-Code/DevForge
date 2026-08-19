import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'signal' | 'neutral' | 'admin' | 'leader' | 'member';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles = {
    signal: 'border-[#A8FF00] text-[#A8FF00] bg-[#A8FF00]/10',
    neutral: 'border-[#414a34] text-[#8b947a] bg-[#1b1c1c]',
    admin: 'border-[#ffb4ab] text-[#ffb4ab] bg-[#93000a]/20',
    leader: 'border-[#A8FF00] text-[#A8FF00] bg-[#A8FF00]/15',
    member: 'border-[#8b947a] text-[#e3e2e2] bg-[#292a2a]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[11px] font-mono-tag rounded ${variantStyles[variant]} ${className}`}
    >
      {(variant === 'signal' || variant === 'leader') && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#A8FF00] animate-pulse"></span>
      )}
      {children}
    </span>
  );
};
