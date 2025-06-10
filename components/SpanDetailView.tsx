
import React, { useState } from 'react';
import { Span, ApiError, GeminiResourcesResponse, GeminiFixResponse, GeminiOptimizeResponse, GeminiExplainResponse, SpanException } from '../types';
import * as apiService from '../services/apiService';
import Modal from './Modal'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { motion, AnimatePresence } from 'framer-motion';
// GENERIC_OPTIMIZATION_CONTEXT import removed as it's no longer used here

interface SpanDetailViewProps {
  span: Span | null;
  traceId: string;
  isOpen: boolean;
  onClose: () => void;
}

const formatTimestampDetail = (ms: number): string => {
  return new Date(ms).toISOString();
};

const formatDurationDetail = (microseconds: number): string => {
  if (microseconds < 1000) return `${microseconds}µs`;
  if (microseconds < 1000000) return `${(microseconds / 1000).toFixed(3)}ms`;
  return `${(microseconds / 1000000).toFixed(3)}s`;
};

const Section: React.FC<{title: string, children: React.ReactNode, defaultOpen?: boolean}> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-[var(--clay-bg-darker)] py-3 last-of-type:border-b">
      <motion.button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-left text-sm font-semibold text-[var(--clay-text)] hover:text-[var(--clay-accent-primary)] transition-colors py-1"
        whileHover={{ x: 2 }}
      >
        {title}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[var(--clay-text-light)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.div>
      </motion.button>
      <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div 
          key="content"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { opacity: 1, height: "auto", marginTop: '8px' },
            collapsed: { opacity: 0, height: 0, marginTop: '0px' }
          }}
          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
          <div className="text-xs text-[var(--clay-text-light)] space-y-1.5 pr-2">{children}</div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};


const SpanDetailView: React.FC<SpanDetailViewProps> = ({ span, traceId, isOpen, onClose }) => {
  const [geminiModalOpen, setGeminiModalOpen] = useState(false);
  const [geminiModalTitle, setGeminiModalTitle] = useState('');
  const [geminiResponse, setGeminiResponse] = useState<string | React.ReactNode | null>(null);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [geminiError, setGeminiError] = useState<ApiError | null>(null);

  if (!span) return null;

  const isErrorSpan = span.tags.error === true || 
                      String(span.tags.error).toLowerCase() === 'true' || 
                      span.tags['otel.status_code'] === 'ERROR';
  const errorMessageForGemini = span.tags['otel.status_description'] || span.errorContext || (isErrorSpan ? 'An unspecified error occurred in this span.' : '');
  const currentSpanExceptions = span.exceptions && span.exceptions.length > 0 ? span.exceptions : undefined;

  const handleGeminiAction = async (action: () => Promise<any>, title: string) => {
    setIsLoadingGemini(true);
    setGeminiError(null);
    setGeminiModalTitle(title);
    setGeminiModalOpen(true);
    try {
      const result = await action();
      if (typeof result.links === 'object') { 
        const res = result as GeminiResourcesResponse;
        setGeminiResponse(
          <ul className="space-y-3 list-disc list-inside text-[var(--clay-text)]">
            {res.links.map(link => (
              <li key={link.link}>
                <a href={link.link} target="_blank" rel="noopener noreferrer" className="text-[var(--clay-accent-info)] hover:underline font-medium">{link.title}</a>
                <p className="text-xs text-[var(--clay-text-light)] ml-4">{link.snippet}</p>
              </li>
            ))}
          </ul>
        );
      } else if (typeof result.fix === 'string') {
        setGeminiResponse(<pre className="whitespace-pre-wrap bg-[var(--clay-bg-darker)] p-3 rounded-lg text-xs font-mono text-[var(--clay-text)] clay-inset-sm">{ (result as GeminiFixResponse).fix }</pre>);
      } else if (typeof result.tips === 'string') { // This case will now be handled by TraceDetailPage
        setGeminiResponse(<pre className="whitespace-pre-wrap bg-[var(--clay-bg-darker)] p-3 rounded-lg text-xs font-mono text-[var(--clay-text)] clay-inset-sm">{ (result as GeminiOptimizeResponse).tips }</pre>);
      } else if (typeof result.explanation === 'string') {
        setGeminiResponse(<p className="whitespace-pre-wrap text-[var(--clay-text)]">{ (result as GeminiExplainResponse).explanation }</p>);
      } else {
         setGeminiResponse(<span className="text-[var(--clay-text-light)]">Received an unexpected response format.</span>);
      }
    } catch (err) {
      setGeminiError(err as ApiError);
      setGeminiResponse(null); 
    } finally {
      setIsLoadingGemini(false);
    }
  };

  const canGetErrorResources = isErrorSpan || !!span.errorContext;
  const canGetErrorFix = !!span.errorContext;
  const canExplainError = !!span.tags['otel.status_description'] || !!span.errorContext || isErrorSpan;

  const sidebarVariants = {
    closed: { x: "100%", opacity: 0.8 },
    open: { x: "0%", opacity: 1 }
  };
  
  const actionButtonVariants = {
    rest: { scale: 1, boxShadow: "var(--clay-shadow-extrude-sm)" },
    hover: { scale: 1.03, y: -1, boxShadow: "-4px -4px 8px var(--clay-shadow-light), 4px 4px 8px var(--clay-shadow-dark)" },
    tap: { scale: 0.97, boxShadow: "var(--clay-shadow-inset-sm)" }
  };


  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-[var(--clay-bg)] bg-opacity-50 backdrop-blur-xs z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
      {isOpen && span && (
        <motion.div
          key={`span-detail-${span.spanID}`}
          variants={sidebarVariants}
          initial="closed"
          animate="open"
          exit="closed"
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="clay-element fixed top-0 right-0 h-full w-full max-w-lg shadow-2xl z-[70] flex flex-col rounded-l-2xl rounded-r-none" // Clay element for sidebar
        >
          <div className="flex items-center justify-between p-5 border-b border-[var(--clay-bg-darker)]">
            <h2 className="text-lg font-semibold text-[var(--clay-text)] truncate" title={span.operationName}>
              Span: {span.operationName}
            </h2>
            <motion.button 
              onClick={onClose} 
              className="text-[var(--clay-text-light)] hover:text-[var(--clay-text)] p-1.5 rounded-full hover:bg-[var(--clay-bg-darker)]"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <div className="flex-grow overflow-y-auto p-5 text-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-4 p-4 clay-inset rounded-xl">
              <div><strong className="text-[var(--clay-text)]">Span ID:</strong> <span className="text-[var(--clay-text-light)] block truncate" title={span.spanID}>{span.spanID}</span></div>
              <div><strong className="text-[var(--clay-text)]">Trace ID:</strong> <span className="text-[var(--clay-text-light)] block truncate" title={traceId}>{traceId}</span></div>
              <div><strong className="text-[var(--clay-text)]">Start Time:</strong> <span className="text-[var(--clay-text-light)] block">{formatTimestampDetail(span.startTime)}</span></div>
              <div><strong className="text-[var(--clay-text)]">Duration:</strong> <span className="text-[var(--clay-text-light)] block">{formatDurationDetail(span.duration)}</span></div>
            </div>

            {span.errorContext && (
              <Section title="Error Context" defaultOpen={true}>
                <pre className="whitespace-pre-wrap bg-[var(--clay-accent-error)] bg-opacity-10 p-3 rounded-lg text-[var(--clay-accent-error-dark)] font-mono text-xs clay-inset-sm border border-[var(--clay-accent-error)]/30">{span.errorContext}</pre>
              </Section>
            )}
            
            <Section title="Tags">
              {Object.entries(span.tags).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[auto,1fr] gap-2 items-baseline py-0.5">
                  <strong className="truncate text-[var(--clay-text)] font-medium" title={key}>{key}:</strong> 
                  <span className="truncate text-[var(--clay-text-light)]" title={String(value)}>{String(value)}</span>
                </div>
              ))}
            </Section>

            {span.exceptions && span.exceptions.length > 0 && (
              <Section title="Exceptions" defaultOpen={isErrorSpan}>
                {span.exceptions.map((ex, index) => (
                  <div key={index} className="mb-2 p-3 bg-[var(--clay-bg)] clay-element-sm-shadow rounded-lg border border-[var(--clay-bg-darker)]">
                    <p><strong className="text-[var(--clay-text)]">Type:</strong> {ex['exception.type']}</p>
                    <p><strong className="text-[var(--clay-text)]">Message:</strong> {ex['exception.message']}</p>
                    <p><strong className="text-[var(--clay-text)]">Timestamp:</strong> {formatTimestampDetail(ex.timestamp)}</p>
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-[var(--clay-accent-info)] text-xs hover:underline">Stacktrace</summary>
                      <pre className="whitespace-pre-wrap bg-[var(--clay-bg-darker)] p-2 mt-1 rounded text-xs font-mono max-h-32 overflow-y-auto clay-inset-sm">{ex['exception.stacktrace']}</pre>
                    </details>
                  </div>
                ))}
              </Section>
            )}
            
            <Section title="Gemini AI Actions" defaultOpen={true}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {[
                  { 
                    label: "Get Error Resources", 
                    action: () => apiService.getErrorResources({ errorMessage: errorMessageForGemini, exceptions: currentSpanExceptions }), 
                    disabled: !canGetErrorResources || isLoadingGemini, 
                    color: "bg-[var(--clay-accent-info)] hover:bg-[var(--clay-accent-info)]/80" 
                  },
                  { 
                    label: "Get Error Fix", 
                    action: () => apiService.getErrorFix({ errorContext: span.errorContext || "No specific context for fix", exceptions: currentSpanExceptions }), 
                    disabled: !canGetErrorFix || isLoadingGemini, 
                    color: "bg-[var(--clay-accent-success)] hover:bg-[var(--clay-accent-success)]/80" 
                  },
                  { 
                    label: "Explain Error", 
                    action: () => apiService.explainError({ errorMessage: errorMessageForGemini, exceptions: currentSpanExceptions }), 
                    disabled: !canExplainError || isLoadingGemini, 
                    color: "bg-[var(--clay-accent-error)] hover:bg-[var(--clay-accent-error)]/80" 
                  }
                ].map(btn => (
                  <motion.button
                    key={btn.label}
                    variants={actionButtonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleGeminiAction(btn.action, btn.label)}
                    disabled={btn.disabled}
                    className={`px-3 py-2.5 text-xs text-white rounded-xl text-center transition-colors clay-element ${btn.color} disabled:bg-[var(--clay-bg-darker)] disabled:text-[var(--clay-text-light)] disabled:shadow-[var(--clay-shadow-inset)] disabled:opacity-70`}
                  >
                    {btn.label}
                  </motion.button>
                ))}
              </div>
            </Section>

          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <Modal isOpen={geminiModalOpen} onClose={() => setGeminiModalOpen(false)} title={geminiModalTitle} size="lg">
        {isLoadingGemini && <div className="flex justify-center p-8"><LoadingSpinner message="Consulting Gemini..." /></div>}
        {geminiError && !isLoadingGemini && <ErrorMessage error={geminiError} onClear={() => setGeminiError(null)}/>}
        {!isLoadingGemini && !geminiError && geminiResponse && <div className="text-[var(--clay-text)]">{geminiResponse}</div>}
      </Modal>
    </>
  );
};

export default SpanDetailView;
