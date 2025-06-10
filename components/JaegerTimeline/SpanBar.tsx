import React from 'react';
import { Span } from '../../types';
import { motion } from 'framer-motion';

interface SpanBarProps {
  span: Span;
  leftPercent: number;
  widthPercent: number;
  color: string;
  barHeight: number;
  minBarWidthPx: number;
  onHover: (span: Span | null, event?: React.MouseEvent) => void;
  onClick: () => void;
  traceDurationMs: number; // For calculating minimum width correctly
}

const formatDurationForBar = (microseconds: number): string => {
  if (microseconds < 1000) return `${microseconds}µs`;
  if (microseconds < 1000000) return `${(microseconds / 1000).toFixed(0)}ms`; // Show integer ms for brevity on bar
  return `${(microseconds / 1000000).toFixed(1)}s`;
};

const SpanBar: React.FC<SpanBarProps> = ({
  span,
  leftPercent,
  widthPercent,
  color,
  barHeight,
  minBarWidthPx,
  onHover,
  onClick,
  traceDurationMs
}) => {
  // Ensure widthPercent results in at least minBarWidthPx if the timeline width is known
  // This is tricky without knowing the parent's actual pixel width for the timeline content area.
  // A simpler approach for min width: use min() in CSS width, or a transform scale for very small bars.
  // For now, we'll ensure widthPercent isn't ridiculously small if duration is tiny.
  const actualWidthPercent = Math.max(widthPercent, (minBarWidthPx / (traceDurationMs > 0 ? traceDurationMs : 1000)) * 100 * 0.1); // Heuristic for very small percentage


  return (
    <motion.div
      className="absolute rounded group cursor-pointer clay-element"
      style={{
        left: `${leftPercent}%`,
        width: `${actualWidthPercent}%`,
        minWidth: `${minBarWidthPx}px`, // Apply CSS min-width
        height: `${barHeight}px`,
        backgroundColor: color,
        boxShadow: `var(--clay-shadow-extrude-sm), inset 0 -2px 4px rgba(0,0,0,0.1)`, // Add subtle inset for depth
      }}
      onMouseEnter={(e) => onHover(span, e)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      whileHover={{ scaleY: 1.1, y: - (barHeight * 0.05), filter: 'brightness(1.15)', transition: {duration: 0.1} }}
      initial={{ opacity: 0.7, scaleX: 0.9 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      title={`${span.operationName} - ${formatDurationForBar(span.duration)}`}
    >
      <div 
        className="absolute inset-0 flex items-center px-1.5 overflow-hidden"
      >
        <span className="text-white text-[10px] font-medium whitespace-nowrap truncate group-hover:text-shadow-md">
          {span.operationName} ({formatDurationForBar(span.duration)})
        </span>
      </div>
       {/* Error indicator stripe for very small bars */}
      {color === 'var(--clay-accent-error)' && widthPercent < 1 && (
         <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-red-300 opacity-70 rounded-r"></div>
      )}
    </motion.div>
  );
};

export default SpanBar;