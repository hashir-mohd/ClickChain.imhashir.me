import React, { useMemo, useState, useRef } from 'react';
import { Trace, Span } from '../../types';
import SpanBar from './SpanBar';
import { motion, AnimatePresence } from 'framer-motion';

interface JaegerTimelineViewProps {
  trace: Trace;
  onSpanSelect: (span: Span) => void; // To potentially open SpanDetailView
}

const MIN_BAR_WIDTH_PX = 2; // Minimum pixel width for a span bar
const ROW_HEIGHT_PX = 40; // Height of each span row including padding/margin
const LABEL_WIDTH_PX = 200; // Width of the span label column
const TIMELINE_PADDING_PX = 20; // Padding around the timeline content
const TICK_COUNT = 10; // Desired number of ticks on the time axis

// Utility to format duration for display (e.g., in tooltips or on bars)
const formatDuration = (microseconds: number): string => {
  if (microseconds < 1000) return `${microseconds}µs`;
  if (microseconds < 1000000) return `${(microseconds / 1000).toFixed(1)}ms`;
  return `${(microseconds / 1000000).toFixed(2)}s`;
};

const JaegerTimelineView: React.FC<JaegerTimelineViewProps> = ({ trace, onSpanSelect }) => {
  const [hoveredSpanDetails, setHoveredSpanDetails] = useState<{ span: Span; x: number; y: number } | null>(null);
  const timelineWrapperRef = useRef<HTMLDivElement>(null);

  const {
    sortedSpans,
    traceStartTime,
    traceEndTime,
    totalTraceDurationMs,
  } = useMemo(() => {
    if (!trace || trace.spans.length === 0) {
      return { sortedSpans: [], traceStartTime: 0, traceEndTime: 0, totalTraceDurationMs: 0 };
    }
    const spans = [...trace.spans].sort((a, b) => a.startTime - b.startTime);
    const startTime = spans[0].startTime;
    const endTime = Math.max(...spans.map(s => s.startTime + s.duration / 1000));
    return {
      sortedSpans: spans,
      traceStartTime: startTime,
      traceEndTime: endTime,
      totalTraceDurationMs: Math.max(1, endTime - startTime), // Ensure duration is at least 1ms to avoid division by zero
    };
  }, [trace]);

  if (!trace || sortedSpans.length === 0) {
    return <p className="text-[var(--clay-text-light)] text-center py-8">No spans available in this trace to display.</p>;
  }

  const timeTicks = useMemo(() => {
    if (totalTraceDurationMs === 0) return [];
    const ticks = [];
    const interval = totalTraceDurationMs / TICK_COUNT;
    for (let i = 0; i <= TICK_COUNT; i++) {
      const timeMs = i * interval;
      const percent = (timeMs / totalTraceDurationMs) * 100;
      ticks.push({ timeMs, percent });
    }
    return ticks;
  }, [totalTraceDurationMs]);

  const handleSpanHover = (span: Span | null, event?: React.MouseEvent) => {
    if (span && event && timelineWrapperRef.current) {
        const rect = timelineWrapperRef.current.getBoundingClientRect();
        setHoveredSpanDetails({
            span,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        });
    } else {
        setHoveredSpanDetails(null);
    }
  };


  const timelineContainerHeight = sortedSpans.length * ROW_HEIGHT_PX + 60; // 60 for time axis and padding

  return (
    <div className="w-full h-[75vh] flex flex-col bg-[var(--clay-bg)] clay-inset-sm p-1 rounded-lg" ref={timelineWrapperRef}>
      {/* Time Axis Header */}
      <div
        className="sticky top-0 z-10 flex bg-[var(--clay-bg)] pt-2 pb-1 pr-2"
        style={{ paddingLeft: `${LABEL_WIDTH_PX + TIMELINE_PADDING_PX}px`}}
      >
        {timeTicks.map(tick => (
          <div
            key={`tick-${tick.timeMs}`}
            className="absolute top-0 text-[var(--clay-text-light)] text-[10px] transform -translate-x-1/2"
            style={{ left: `${tick.percent}%`, paddingTop: '4px' }}
          >
            {formatDuration(tick.timeMs * 1000)} {/* Convert ms to µs for formatter */}
            <div className="h-2 w-px bg-[var(--clay-text-light)] opacity-50 mt-0.5"></div>
          </div>
        ))}
        <div className="w-full h-px bg-[var(--clay-text-light)] opacity-30 absolute bottom-0 left-0" style={{top: '25px'}} />
      </div>

      {/* Scrollable Timeline Content */}
      <div className="flex-grow overflow-auto relative">
        <div style={{ width: '100%', height: `${timelineContainerHeight}px`, position: 'relative', padding: `${TIMELINE_PADDING_PX}px` }}>
          {/* Background Grid - Vertical Time Grid Lines */}
          {timeTicks.slice(1,-1).map(tick => ( // Exclude first and last to avoid doubling border
            <div
              key={`grid-line-${tick.timeMs}`}
              className="absolute top-0 bottom-0 w-px bg-[var(--clay-text-light)] opacity-15"
              style={{ left: `calc(${LABEL_WIDTH_PX + TIMELINE_PADDING_PX}px + ${tick.percent}%)`, top: `${TIMELINE_PADDING_PX}px`, bottom: `${TIMELINE_PADDING_PX}px` }}
            />
          ))}

          {sortedSpans.map((span, index) => {
            const leftPercent = ((span.startTime - traceStartTime) / totalTraceDurationMs) * 100;
            const widthPercent = ((span.duration / 1000) / totalTraceDurationMs) * 100;
            
            // Calculate actual width in pixels to apply min-width
            // This requires knowing the width of the timeline content area
            // For now, let's assume a large enough default width or handle min-width visually in SpanBar

            const isError = span.tags.error === true || String(span.tags.error).toLowerCase() === 'true' || span.tags['otel.status_code'] === 'ERROR';
            const color = isError ? 'var(--clay-accent-error)' : 'var(--clay-accent-primary)';

            return (
              <motion.div
                key={span.spanID}
                className="flex items-center"
                style={{ height: `${ROW_HEIGHT_PX}px`, position: 'absolute', top: `${index * ROW_HEIGHT_PX + TIMELINE_PADDING_PX + 30 /* for time axis */}px`, left: `${TIMELINE_PADDING_PX}px`, right: `${TIMELINE_PADDING_PX}px` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                {/* Span Label */}
                <div
                  className="w-full max-w-[180px] pr-2 text-[var(--clay-text)] text-xs truncate shrink-0"
                  title={span.operationName}
                  style={{ width: `${LABEL_WIDTH_PX}px`}}
                >
                  {span.operationName}
                </div>

                {/* Span Bar Track (relative positioning for the bar) */}
                <div className="relative flex-grow h-full">
                   <SpanBar
                    span={span}
                    leftPercent={leftPercent}
                    widthPercent={widthPercent}
                    color={color}
                    barHeight={ROW_HEIGHT_PX * 0.6} // e.g. 60% of row height
                    minBarWidthPx={MIN_BAR_WIDTH_PX}
                    onHover={handleSpanHover}
                    onClick={() => onSpanSelect(span)}
                    traceDurationMs={totalTraceDurationMs}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <AnimatePresence>
        {hoveredSpanDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y:10 }}
            animate={{ opacity: 1, scale: 1, y:0 }}
            exit={{ opacity: 0, scale: 0.9, y:10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="fixed p-2.5 text-xs rounded-lg pointer-events-none z-[1000] clay-element shadow-xl bg-[var(--clay-bg)]"
            style={{
              left: `${hoveredSpanDetails.x + 15}px`,
              top: `${hoveredSpanDetails.y + 15}px`,
              maxWidth: '250px'
            }}
          >
            <strong className="block text-[var(--clay-text)] mb-1">{hoveredSpanDetails.span.operationName}</strong>
            <p className="text-[var(--clay-text-light)]">
              Start: <span className="font-medium text-[var(--clay-text)]">{(hoveredSpanDetails.span.startTime - traceStartTime).toFixed(2)}ms</span>
            </p>
            <p className="text-[var(--clay-text-light)]">
              Duration: <span className="font-medium text-[var(--clay-text)]">{formatDuration(hoveredSpanDetails.span.duration)}</span>
            </p>
             {Object.keys(hoveredSpanDetails.span.tags).length > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-[var(--clay-bg-darker)]">
                {Object.entries(hoveredSpanDetails.span.tags).slice(0, 3).map(([key, value]) => (
                  <p key={key} className="text-[var(--clay-text-light)] truncate">
                    {key}: <span className="font-medium text-[var(--clay-text)]">{String(value)}</span>
                  </p>
                ))}
                {Object.keys(hoveredSpanDetails.span.tags).length > 3 && <p className="text-[var(--clay-text-light)] text-[10px]">...and more tags</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JaegerTimelineView;