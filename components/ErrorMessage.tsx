import React from 'react';
import { ApiError } from '../types';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  error: ApiError | string | null;
  onClear?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onClear }) => {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="clay-element p-4 my-4 border-l-4 border-[var(--clay-accent-error)] bg-[var(--clay-bg)]" // Clay element with error accent
      role="alert"
    >
      <div className="flex">
        <div className="py-1">
          <svg className="fill-current h-6 w-6 text-[var(--clay-accent-error-dark)] mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM10 14a1 1 0 0 0 1-1V7a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1zm0-10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-[var(--clay-accent-error-dark)]">Error</p>
          <p className="text-sm text-[var(--clay-text)]">{message}</p>
        </div>
        {onClear && (
          <motion.button 
            onClick={onClear} 
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="ml-auto text-[var(--clay-accent-error)] hover:text-[var(--clay-accent-error-dark)] text-2xl font-bold transition-colors p-1 rounded-full"
            aria-label="Clear error"
          >
            &times;
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorMessage;