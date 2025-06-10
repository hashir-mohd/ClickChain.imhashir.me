import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  colorClass?: string; // Allow custom color, defaults to clay accent
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message, colorClass }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4',
  };

  const finalColorClass = colorClass || 'border-[var(--clay-accent-primary)]';

  return (
    <div className="flex flex-col items-center justify-center p-4 text-[var(--clay-text)]">
      <div 
        className={`${sizeClasses[size]} ${finalColorClass} border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
      </div>
      {message && <p className="mt-3 text-[var(--clay-text-light)] text-sm">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;