import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fullContent'; // Added 'fullContent'
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-3xl',
    fullContent: 'max-w-[90vw] w-[90vw]' // For very wide content like Jaeger timeline
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 25, duration: 0.3 } 
    },
    exit: { y: 50, opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-[var(--clay-bg)] bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={onClose} 
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`clay-element ${sizeClasses[size]} w-full overflow-hidden flex flex-col max-h-[90vh]`} // Adjusted max-h
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--clay-bg-darker)] shrink-0">
              <h2 className="text-xl font-semibold text-[var(--clay-text)]">{title}</h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-[var(--clay-text-light)] hover:text-[var(--clay-text)] transition-colors p-1 rounded-full hover:bg-[var(--clay-bg-darker)]"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            {/* The children container should be scrollable if content overflows */}
            <div className="flex-grow overflow-auto"> 
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;