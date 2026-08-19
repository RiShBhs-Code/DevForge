import React from 'react';

interface CardProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  level = 1,
  className = '',
  header,
  footer,
}) => {
  const levelStyles = {
    1: 'surface-level-1',
    2: 'surface-level-2',
    3: 'surface-level-high',
  };

  return (
    <div
      className={`rounded-lg p-6 ${levelStyles[level]} transition-all duration-200 ${className}`}
    >
      {header && <div className="mb-4 pb-3 border-b border-[#242424]">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-3 border-t border-[#242424]">{footer}</div>}
    </div>
  );
};
