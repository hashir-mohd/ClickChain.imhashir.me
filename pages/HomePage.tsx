
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Trace } from '../types'; // Span removed as it's not directly used here for type def
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
  // Assuming spans are ordered or the first one is representative
  return trace.spans[0].operationName;
};

const traceHasError = (trace: Trace): boolean => {
  return trace.spans.some(span => span.tags.error === true || String(span.tags.error) === 'true' || span.tags['otel.status_code'] === 'ERROR');
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
    isLoadingServices,
    servicesError,
    fetchServices,
    selectedService,
    setSelectedService,
    traces,
    isLoading: isLoadingTraces, // Renamed to avoid conflict
    error: tracesError, // Renamed to avoid conflict
    clearError: clearTracesError,
    fetchTraces,
  } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Services are fetched by AppContext now, but if you need to re-trigger:
    // if (services.length === 0 && !isLoadingServices) {
    //   fetchServices();
    // }
  }, [services, isLoadingServices, fetchServices]);


  useEffect(() => {
    return () => {
      clearTracesError();
    };
  }, [selectedService, clearTracesError]);

  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = event.target.value;
    const service = services.find(s => s.id === serviceId) || null;
    setSelectedService(service);
  };

  const handleFetchTraces = () => {
    if (selectedService) {
      fetchTraces(selectedService.id); // Pass service ID, AppContext will use service.name
    }
  };

  const handleTraceClick = (traceID: string) => {
    navigate(`/app/trace/${traceID}`);
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
    visible: (i: number) => ({
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
      className="space-y-10"
    >
      <motion.div
        variants={itemVariants}
        className="clay-element p-6 sm:p-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--clay-text)] mb-3">Trace Explorer</h1>
        <p className="text-[var(--clay-text-light)] mb-8 text-sm sm:text-base">Select a service to view its recent traces. Click on a trace to see its detailed timeline and interact with Gemini AI.</p>

        {isLoadingServices && <div className="flex justify-center py-5"><LoadingSpinner message="Loading services..." /></div>}
        {servicesError && <ErrorMessage error={servicesError} onClear={() => useAppContext().clearError()} />} {/* Assuming clearError can clear serviceError or add clearServicesError */}

        {!isLoadingServices && !servicesError && (
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
                disabled={services.length === 0}
              >
                <option value="" disabled className="text-[var(--clay-text-light)]">-- Choose a service --</option>
                {services.map(service => (
                  <option key={service.id} value={service.id} className="text-[var(--clay-text)] bg-[var(--clay-bg)]">{service.name}</option>
                ))}
              </motion.select>
            </div>
            <motion.button
              onClick={handleFetchTraces}
              disabled={!selectedService || isLoadingTraces}
              whileHover={{ scale: 1.05, y: -2, boxShadow: "-8px -8px 16px var(--clay-shadow-light), 8px 8px 16px var(--clay-shadow-dark)" }}
              whileTap={{ scale: 0.95, boxShadow: "var(--clay-shadow-inset)" }}
              className="w-full sm:w-auto px-6 py-3 bg-[var(--clay-accent-primary)] text-white font-semibold clay-element clay-element-sm-shadow disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[var(--clay-bg-darker)] disabled:shadow-[var(--clay-shadow-inset)] disabled:text-[var(--clay-text-light)]"
            >
              {isLoadingTraces ? 'Fetching...' : 'Fetch Traces'}
            </motion.button>
          </div>
        )}
        {tracesError && <ErrorMessage error={tracesError} onClear={clearTracesError} />}
      </motion.div>

      {isLoadingTraces && <div className="flex justify-center py-10"><LoadingSpinner message="Loading traces..." /></div>}

      {!isLoadingTraces && traces.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }} 
          initial="hidden"
          animate="visible"
        >
          {traces.map((trace, index) => (
            <motion.div
              key={trace.traceID}
              custom={index}
              variants={traceCardVariants}
              onClick={() => handleTraceClick(trace.traceID)}
              whileHover={{ y: -5, scale: 1.02, boxShadow: "-8px -8px 16px var(--clay-shadow-light), 8px 8px 16px var(--clay-shadow-dark)" }}
              whileTap={{ scale: 0.98, boxShadow: "var(--clay-shadow-inset)" }}
              className={`clay-element p-0 overflow-hidden cursor-pointer flex flex-col`}
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
                  <span className="font-medium text-[var(--clay-text)]">Start:</span> {trace.spans[0]?.startTime ? formatTimestamp(trace.spans[0].startTime) : 'N/A'}
                </p>
                <p className="text-sm text-[var(--clay-text-light)] mt-1">
                  <span className="font-medium text-[var(--clay-text)]">Spans:</span> {trace.spans.length}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      {!isLoadingTraces && traces.length === 0 && selectedService && !tracesError && (
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
       {!isLoadingServices && !selectedService && services.length > 0 && !servicesError && (
         <motion.div 
          variants={itemVariants} 
          className="text-center py-12 clay-element p-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--clay-text-light)" className="w-20 h-20 mx-auto mb-5 opacity-70">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 6.75V5.25m0 1.5V8.25m0 0H6.75m1.5 0H8.25m1.5 0H12m1.5 0H15m0 0h1.5m-1.5 0H15m0 0v1.5m0-1.5V5.25m0 1.5V8.25m7.5-1.5h-1.5M15 13.5h.008v.008H15v-.008zm0 0H12m3 0h3M15 13.5v2.25m0-2.25v-2.25m0 2.25h-3m3-3.75H15m0-2.25h.008v.008H15v-.008zM15 9.75v-2.25m0 2.25v2.25m0-2.25H12m3 0h3M7.5 13.5h7.5M7.5 13.5v2.25m0-2.25v-2.25m0 2.25H6m1.5 0H9m-1.5-3.75H7.5m0-2.25h.008v.008H7.5v-.008zM7.5 9.75v-2.25m0 2.25v2.25m0-2.25H6m1.5 0H9" />
          </svg>
          <p className="text-[var(--clay-text)] text-xl mb-2">Please select a service.</p>
          <p className="text-[var(--clay-text-light)] text-sm">Choose a service from the dropdown above to view its traces.</p>
        </motion.div>
       )}
    </motion.div>
  );
};

export default HomePage;
