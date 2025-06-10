import React, { useMemo, useState } from 'react';
import { Trace, Span } from '../../types';
import SpanNode from './SpanNode'; // Adjusted import path assuming SpanNode is in the same directory
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

  const timelineContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, 
      },
    },
  };

  const timelineNodeItemVariants = {
    hidden: { opacity: 0, x: -20 }, // Slide in from left
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }
  };

  return (
    <motion.div
      className="relative w-full max-h-[450px] overflow-y-auto p-1 rounded-lg scroll-smooth" // Added max-h and overflow-y-auto
      variants={timelineContainerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Trace span timeline"
    >
      <div className="relative pr-2 py-4 pl-6"> {/* Padding: pl-6 for track, pr-2 for scrollbar, py-4 for top/bottom space */}
        {/* The continuous vertical track line */}
        <div
          className="absolute top-0 left-[10px] w-0.5 bg-[var(--clay-text-light)] h-full rounded-full opacity-40"
          aria-hidden="true"
        ></div>

        {sortedSpans.map((span) => {
          const isError = span.tags.error === true || String(span.tags.error).toLowerCase() === 'true' || span.tags['otel.status_code'] === 'ERROR';
          const isLongest = span.spanID === longestDurationSpanId;
          
          let dotBgClass = 'bg-[var(--clay-accent-primary)]'; // Default dot color (using primary for better contrast)
          if (isError) {
            dotBgClass = 'bg-[var(--clay-accent-error-dark)]';
          } else if (isLongest) {
            dotBgClass = 'bg-[var(--clay-accent-secondary-dark)]';
          }

          return (
            <motion.div
              key={span.spanID}
              className="relative flex items-start mb-5 last:mb-0" // mb-5 for spacing between nodes
              variants={timelineNodeItemVariants}
            >
              {/* Dot on the timeline track */}
              <div
                className={`absolute left-[4px] w-3.5 h-3.5 rounded-full z-10
                  ${dotBgClass}
                  border-2 border-[var(--clay-bg)] clay-element-sm-shadow`}
                title={span.operationName}
                style={{ top: '20px' }} // Aligns dot near the top of SpanNode content (approx 1.25rem or 20px if base font is 16px)
                aria-hidden="true"
              ></div>

              {/* Container for SpanNode, offset from the track */}
                <div className="ml-8 min-w-0 flex-1 z-200">{/* ml-8 (32px) for space from track. min-w-0 and flex-1 for proper sizing. */}
                <SpanNode
                  span={span}
                  isLongest={isLongest} // Pass isLongest, not just isLongest based on ID
                  onClick={() => onSpanSelect(span)}
                  onHover={handleSpanHover}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {hoveredSpanInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="fixed p-2.5 clay-element clay-element-sm-shadow text-[var(--clay-text)] text-xs rounded-lg pointer-events-none z-[150]"
            style={{ top: hoveredSpanInfo.y + 25, left: hoveredSpanInfo.x + 20 }}
            role="tooltip"
          >
            {hoveredSpanInfo.text}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TraceTimeline;