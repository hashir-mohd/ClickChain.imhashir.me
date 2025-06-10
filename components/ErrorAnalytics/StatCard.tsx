
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  colorClass?: string;
  index?: number; // For staggered animation
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass = 'text-[var(--clay-accent-primary)]', index = 0 }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 14, delay: index * 0.1 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className="clay-element p-5 rounded-xl flex flex-col items-start justify-between min-h-[120px]" // Ensure min height for consistency
    >
      <div className="flex items-center justify-between w-full">
        <h3 className="text-sm font-medium text-[var(--clay-text-light)] uppercase tracking-wider">{title}</h3>
        {icon && <div className={`p-2 rounded-lg clay-inset-sm ${colorClass} opacity-70`}>{icon}</div>}
      </div>
      <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{value}</p>
    </motion.div>
  );
};

export default StatCard;
