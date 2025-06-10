import React from 'react';
import { Span } from '../../types';
import { motion } from 'framer-motion';

interface SpanNodeProps {
  span: Span;
  isLongest: boolean;
  onClick: () => void;
  onHover: (span: Span | null, event?: React.MouseEvent<HTMLDivElement>) => void;
}

const formatDurationForNode = (microseconds: number): string => {
  if (microseconds < 1000) return `${microseconds}µs`;
  if (microseconds < 1000000) return `${(microseconds / 1000).toFixed(0)}ms`;
  return `${(microseconds / 1000000).toFixed(1)}s`;
};

const SpanNode: React.FC<SpanNodeProps> = ({ span, isLongest, onClick, onHover }) => {
  const isError = span.tags.error === true || span.tags['otel.status_code'] === 'ERROR';
  
  let bgColor = 'bg-[var(--clay-bg)]'; // Base clay background
  let textColor = 'text-[var(--clay-text)]';
  let accentColor = 'border-[var(--clay-accent-info)]'; // Default accent
  let iconColor = 'text-[var(--clay-accent-info)]';
  let iconSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 mr-2 flex-shrink-0 ${iconColor} opacity-80`}>
      <path d="M10 3.75a2 2 0 100 4 2 2 0 000-4zM8.125 7.344A2.002 2.002 0 006.14 9.25H4.875a.75.75 0 000 1.5h1.266a2.002 2.002 0 001.985 1.906A2.003 2.003 0 0010 14.25a2.003 2.003 0 001.875-1.594c.95-.283 1.713-.941 1.984-1.906h1.266a.75.75 0 000-1.5H13.86a2.002 2.002 0 00-1.985-1.906A2 2 0 0010 3.75H8.125zM10 6.25a.75.75 0 100 1.5.75.75 0 000-1.5z" />
    </svg>
  );

  if (isError) {
    accentColor = 'border-[var(--clay-accent-error)]';
    iconColor = 'text-[var(--clay-accent-error)]';
    iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 mr-2 flex-shrink-0 ${iconColor}`}>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    );
  } else if (isLongest) {
    accentColor = 'border-[var(--clay-accent-secondary)]';
    iconColor = 'text-[var(--clay-accent-secondary)]';
     iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 mr-2 flex-shrink-0 ${iconColor}`}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
      </svg>
    );
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 130, damping: 14 } },
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, scale:1.02, boxShadow: "-5px -5px 10px var(--clay-shadow-light), 5px 5px 10px var(--clay-shadow-dark)" }}
      whileTap={{ scale: 0.98, boxShadow: "var(--clay-shadow-inset-sm)" }}
      className={`p-3.5 rounded-xl cursor-pointer min-w-[200px] max-w-[300px] flex-shrink-0 clay-element clay-element-sm-shadow border-l-4 ${accentColor} ${bgColor} ${textColor}`}
      onClick={onClick}
      onMouseEnter={(e) => onHover(span, e)}
      onMouseLeave={() => onHover(null)}
      title={`${span.operationName}\nDuration: ${formatDurationForNode(span.duration)}\nStart Time: ${new Date(span.startTime).toLocaleTimeString()}`}
    >
      <div className="flex items-center text-sm font-semibold mb-1.5">
        {iconSvg}
        <span className="truncate" style={{maxWidth: 'calc(100% - 24px)'}}>{span.operationName}</span>
      </div>
      <div className="text-xs opacity-80 text-[var(--clay-text-light)]">
        {formatDurationForNode(span.duration)}
      </div>
    </motion.div>
  );
};

export default SpanNode;