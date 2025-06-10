import React, { useMemo, useState } from 'react';
import { Trace, Span } from '../../types';
import SpanNode from './SpanNode';
import { motion, AnimatePresence } from 'framer-motion';

interface TraceTimelineProps {
  trace: Trace;
  onSpanSelect: (span: Span) => void;
}

const formatDurationForDisplay = (microseconds: number): string => {
  if (microseconds < 1000) return `${microseconds}µs`;
  if (microseconds < 1000000) return `${(microseconds / 1000).toFixed(1)}ms`;
  return `${(microseconds / 1000000).toFixed(2)}s`;
};

const TraceTimeline: React.FC<TraceTimelineProps> = ({ trace, onSpanSelect }) => {
  const [hoveredSpanInfo, setHoveredSpanInfo] = useState<{ text: string, x: number, y: number } | null>(null);

  const sortedSpans = useMemo(() => {
    return [...trace.spans].sort((a, b) => a.startTime - b.startTime);
  }, [trace.spans]);

  const longestDurationSpanId = useMemo(() => {
    if (!sortedSpans || sortedSpans.length === 0) return null;
    return sortedSpans.reduce((longest, current) => 
      current.duration > longest.duration ? current : longest
    ).spanID;
  }, [sortedSpans]);

  const handleSpanHover = (span: Span | null, event?: React.MouseEvent<HTMLDivElement>) => {
    if (span && event) {
      setHoveredSpanInfo({
        text: `${span.operationName} (${formatDurationForDisplay(span.duration)})`,
        x: event.clientX,
        y: event.clientY,
      });
    } else {
      setHoveredSpanInfo(null);
    }
  };
  
  if (!trace || !sortedSpans || sortedSpans.length === 0) {
    return <p className="text-[var(--clay-text-light)] text-center py-4">No spans available for this trace.</p>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Slightly more pronounced stagger
      },
    },
  };

  return (
    <div className="relative w-full overflow-x-auto pb-8"> {/* Removed custom scrollbar classes, relying on global */}
      <motion.div 
        className="flex items-center space-x-3 p-4 min-w-max" // Increased space-x for better separation
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sortedSpans.map((span, index) => (
          <React.Fragment key={span.spanID}>
            <SpanNode
              span={span}
              isLongest={span.spanID === longestDurationSpanId}
              onClick={() => onSpanSelect(span)}
              onHover={handleSpanHover}
            />
            {index < sortedSpans.length - 1 && (
              <motion.div 
                initial={{ opacity: 0, scaleX: 0, x: -10 }} 
                animate={{ opacity: 1, scaleX: 1, x: 0 }} 
                transition={{ delay: index * 0.08 + 0.15, duration:0.35, type: "spring", stiffness:100, damping:12 }}
                className="flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--clay-text-light)" className="w-7 h-7 opacity-60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </motion.div>
      
      <AnimatePresence>
      {hoveredSpanInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.85 }}
          transition={{type: "spring", stiffness: 250, damping: 20}}
          className="fixed p-2.5 clay-element clay-element-sm-shadow text-[var(--clay-text)] text-xs rounded-lg pointer-events-none z-[150]" // Claymorphic tooltip
          style={{ top: hoveredSpanInfo.y + 25, left: hoveredSpanInfo.x + 20 }}
        >
          {hoveredSpanInfo.text}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default TraceTimeline;