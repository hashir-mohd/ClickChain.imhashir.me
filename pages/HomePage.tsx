import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Trace, Span } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { motion } from 'framer-motion';

// Helper functions (could be moved to a utils file)
const calculateTraceDuration = (trace: Trace): number => {
  if (!trace.spans || trace.spans.length === 0) return 0;
  let minStartTime = trace.spans[0].startTime;
  let maxEndTime = trace.spans[0].startTime + trace.spans[0].duration / 1000;

  trace.spans.forEach(span => {
    minStartTime = Math.min(minStartTime, span.startTime);
    const spanEndTime = span.startTime + span.duration / 1000;
    maxEndTime = Math.max(maxEndTime, spanEndTime);
  });
  return (maxEndTime - minStartTime) * 1000; 
};

const getRootSpanOperationName = (trace: Trace): string => {
  if (!trace.spans || trace.spans.length === 0) return 'Unknown Operation';
  return trace.spans[0].operationName;
};

const traceHasError = (trace: Trace): boolean => {
  return trace.spans.some(span => span.tags.error === true || span.tags['otel.status_code'] === 'ERROR');
};

const formatDuration = (microseconds: number): string => {
  if (microseconds < 1000) return `${microseconds}µs`;
  if (microseconds < 1000000) return `${(microseconds / 1000).toFixed(2)}ms`;
  return `${(microseconds / 1000000).toFixed(2)}s`;
};

const formatTimestamp = (ms: number): string => {
  return new Date(ms).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });
};


const HomePage: React.FC = () => {
  const {
    services,
    selectedService,
    setSelectedService,
    traces,
    isLoading,
    error,
    clearError,
    fetchTraces,
  } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [selectedService, clearError]);

  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = event.target.value;
    const service = services.find(s => s.id === serviceId) || null;
    setSelectedService(service);
  };

  const handleFetchTraces = () => {
    if (selectedService) {
      fetchTraces(selectedService.id);
    }
  };

  const handleTraceClick = (traceID: string) => {
    navigate(`/app/trace/${traceID}`); // Updated path
  };

  const pageContainerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 }
    }
  };
  
  const traceCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i:number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.07,
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    })
  };

  return (
    <motion.div 
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="space-y-10" // Increased spacing
    >
      <motion.div 
        variants={itemVariants}
        className="clay-element p-6 sm:p-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--clay-text)] mb-3">Trace Explorer</h1>
        <p className="text-[var(--clay-text-light)] mb-8 text-sm sm:text-base">Select a service to view its recent traces. Click on a trace to see its detailed timeline and interact with Gemini AI.</p>
        
        <div className="flex flex-col sm:flex-row items-end gap-4 sm:gap-6 mb-6">
          <div className="flex-grow w-full sm:w-auto">
            <label htmlFor="service-select" className="block text-sm font-medium text-[var(--clay-text)] mb-1.5">
              Select Service
            </label>
            <motion.select
              id="service-select"
              value={selectedService?.id || ''}
              onChange={handleServiceChange}
              whileHover={{ scale: 1.02 }}
              className="block w-full p-3 clay-inset text-[var(--clay-text)] rounded-xl focus:ring-2 focus:ring-[var(--clay-accent-primary)] focus:outline-none appearance-none"
            >
              <option value="" disabled className="text-[var(--clay-text-light)]">-- Choose a service --</option>
              {services.map(service => (
                <option key={service.id} value={service.id} className="text-[var(--clay-text)] bg-[var(--clay-bg)]">{service.name}</option>
              ))}
            </motion.select>
          </div>
          <motion.button
            onClick={handleFetchTraces}
            disabled={!selectedService || isLoading}
            whileHover={{ scale: 1.05, y: -2, boxShadow: "-8px -8px 16px var(--clay-shadow-light), 8px 8px 16px var(--clay-shadow-dark)" }}
            whileTap={{ scale: 0.95, boxShadow: "var(--clay-shadow-inset)" }}
            className="w-full sm:w-auto px-6 py-3 bg-[var(--clay-accent-primary)] text-white font-semibold clay-element clay-element-sm-shadow disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[var(--clay-bg-darker)] disabled:shadow-[var(--clay-shadow-inset)] disabled:text-[var(--clay-text-light)]"
          >
            {isLoading ? 'Fetching...' : 'Fetch Traces'}
          </motion.button>
        </div>
        {error && <ErrorMessage error={error} onClear={clearError} />}
      </motion.div>

      {isLoading && <div className="flex justify-center py-10"><LoadingSpinner message="Loading traces..." /></div>}
      
      {!isLoading && traces.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={{ visible: { transition: { staggerChildren: 0.05 }}}} /* Stagger children for grid */
          initial="hidden"
          animate="visible"
        >
          {traces.map((trace, index) => (
            <motion.div
              key={trace.traceID}
              custom={index}
              variants={traceCardVariants}
              onClick={() => handleTraceClick(trace.traceID)}
              whileHover={{ y: -5, scale:1.02, boxShadow: "-8px -8px 16px var(--clay-shadow-light), 8px 8px 16px var(--clay-shadow-dark)" }}
              whileTap={{ scale: 0.98, boxShadow: "var(--clay-shadow-inset)" }}
              className={`clay-element p-0 overflow-hidden cursor-pointer flex flex-col`} // Ensure consistent height by flex
            >
              <div className={`p-5 border-l-4 ${traceHasError(trace) ? 'border-[var(--clay-accent-error)]' : 'border-[var(--clay-accent-success)]'} flex-grow`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-[var(--clay-accent-primary)] truncate" title={trace.traceID}>
                    Trace ID: {trace.traceID.substring(0, 12)}...
                  </h3>
                  {traceHasError(trace) && (
                    <span className="text-[var(--clay-accent-error)]" title="This trace contains errors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--clay-text-light)] mb-1">
                  <span className="font-medium text-[var(--clay-text)]">Root Op:</span> {getRootSpanOperationName(trace)}
                </p>
                <p className="text-sm text-[var(--clay-text-light)] mb-1">
                  <span className="font-medium text-[var(--clay-text)]">Duration:</span> {formatDuration(calculateTraceDuration(trace))}
                </p>
                <p className="text-sm text-[var(--clay-text-light)]">
                  <span className="font-medium text-[var(--clay-text)]">Start:</span> {formatTimestamp(trace.spans[0]?.startTime)}
                </p>
                <p className="text-sm text-[var(--clay-text-light)] mt-1">
                  <span className="font-medium text-[var(--clay-text)]">Spans:</span> {trace.spans.length}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      {!isLoading && traces.length === 0 && selectedService && !error && (
        <motion.div 
          variants={itemVariants}
          className="text-center py-12 clay-element p-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--clay-text-light)" className="w-20 h-20 mx-auto mb-5 opacity-70">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
          </svg>
          <p className="text-[var(--clay-text)] text-xl mb-2">No traces found for {selectedService.name}.</p>
          <p className="text-[var(--clay-text-light)] text-sm">Try fetching again or select a different service.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomePage;