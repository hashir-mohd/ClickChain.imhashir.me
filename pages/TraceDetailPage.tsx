
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Span, GeminiSummaryResponse, ApiError, GeminiOptimizeResponse } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import TraceTimeline from '../components/TraceTimeline/TraceTimeline';
import SpanDetailView from '../components/SpanDetailView';
import * as apiService from '../services/apiService';
import { motion } from 'framer-motion';

const TraceDetailPage: React.FC = () => {
  const { traceID } = useParams<{ traceID: string }>();
  const navigate = useNavigate();
  const { currentTrace, setCurrentTraceById, isLoading: contextIsLoading, error: contextError, clearError } = useAppContext();

  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<GeminiSummaryResponse | null>(null);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
  const [optimizationTipsData, setOptimizationTipsData] = useState<GeminiOptimizeResponse | null>(null);
  const [isFetchingOptimizationTips, setIsFetchingOptimizationTips] = useState(false);

  const [pageError, setPageError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (traceID) {
      setCurrentTraceById(traceID);
    }
    return () => {
      clearError(); 
      setPageError(null); 
    };
  }, [traceID, setCurrentTraceById, clearError]);

  const handleSelectSpan = useCallback((span: Span) => {
    setSelectedSpan(span);
  }, []);

  const handleCloseSpanDetail = useCallback(() => {
    setSelectedSpan(null);
  }, []);

  const handleGetTraceSummary = async () => {
    if (!currentTrace || isFetchingSummary || isFetchingOptimizationTips) return;
    setIsFetchingSummary(true);
    setPageError(null); // Clear page error before new request
    try {
      const summary = await apiService.getTraceSummary(currentTrace);
      setSummaryData(summary);
      setIsSummaryModalOpen(true);
    } catch (err) {
      setPageError(err as ApiError);
      setSummaryData(null); // Clear old data on error
    } finally {
      setIsFetchingSummary(false);
    }
  };

  const handleGetOptimizationTips = async () => {
    if (!currentTrace || isFetchingOptimizationTips || isFetchingSummary) return;
    setIsFetchingOptimizationTips(true);
    setPageError(null); // Clear page error before new request
    try {
      const tips = await apiService.getOptimizationTips(currentTrace);
      setOptimizationTipsData(tips);
      setIsOptimizationModalOpen(true);
    } catch (err) {
      setPageError(err as ApiError);
      setOptimizationTipsData(null); // Clear old data on error
    } finally {
      setIsFetchingOptimizationTips(false);
    }
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut", staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };


  if (contextIsLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner message="Loading trace details..." /></div>;
  }

  // Show general context error if no specific modal is targeted by the error
  const showGeneralPageError = pageError && !isSummaryModalOpen && !isOptimizationModalOpen;

  if (contextError) {
    return <ErrorMessage error={contextError} onClear={clearError} />;
  }
  
  if (showGeneralPageError) {
     return <ErrorMessage error={pageError} onClear={() => setPageError(null)} />;
  }


  if (!currentTrace && !contextIsLoading) {
    return (
      <motion.div 
        variants={pageVariants} initial="initial" animate="animate" exit="exit"
        className="text-center py-10 clay-element p-8 sm:p-12"
      >
        <motion.div variants={itemVariants}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--clay-text-light)" className="w-20 h-20 mx-auto mb-6 opacity-70">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </motion.div>
        <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-semibold text-[var(--clay-text)] mb-3">Trace Not Found</motion.h2>
        <motion.p variants={itemVariants} className="text-[var(--clay-text-light)] mb-8">The trace with ID '{traceID}' could not be loaded or doesn't exist.</motion.p>
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/app')} // Updated path
          whileHover={{ scale: 1.05, y: -2, boxShadow: "-8px -8px 16px var(--clay-shadow-light), 8px 8px 16px var(--clay-shadow-dark)" }}
          whileTap={{ scale: 0.95, boxShadow: "var(--clay-shadow-inset)" }}
          className="px-8 py-3 bg-[var(--clay-accent-info)] text-white font-semibold clay-element clay-element-sm-shadow"
        >
          Back to Home
        </motion.button>
      </motion.div>
    );
  }
  
  if (!currentTrace) return null; 

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8" 
    >
      <motion.div variants={itemVariants} className="clay-element p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--clay-text)]">Trace Detail</h1>
            <p className="text-sm text-[var(--clay-text-light)] truncate" title={currentTrace.traceID}>ID: {currentTrace.traceID}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <motion.button
              onClick={handleGetTraceSummary}
              disabled={isFetchingSummary || isFetchingOptimizationTips}
              whileHover={{ scale: 1.05, y: -2, boxShadow: (isFetchingSummary || isFetchingOptimizationTips) ? undefined : "-7px -7px 14px var(--clay-shadow-light), 7px 7px 14px var(--clay-shadow-dark)" }}
              whileTap={{ scale: 0.95, boxShadow: (isFetchingSummary || isFetchingOptimizationTips) ? undefined : "var(--clay-shadow-inset-sm)" }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[var(--clay-accent-secondary)] text-white font-medium clay-element clay-element-sm-shadow disabled:opacity-70 disabled:bg-[var(--clay-bg-darker)] disabled:text-[var(--clay-text-light)] disabled:shadow-[var(--clay-shadow-inset)] flex items-center justify-center min-w-[200px]"
            >
              {isFetchingSummary ? (
                <LoadingSpinner size="sm" colorClass='border-[var(--clay-text-light)]' /> 
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                  <path d="M10 3.75a2 2 0 100 4 2 2 0 000-4zM8.125 7.344A2.002 2.002 0 006.14 9.25H4.875a.75.75 0 000 1.5h1.266a2.002 2.002 0 001.985 1.906A2.003 2.003 0 0010 14.25a2.003 2.003 0 001.875-1.594c.95-.283 1.713-.941 1.984-1.906h1.266a.75.75 0 000-1.5H13.86a2.002 2.002 0 00-1.985-1.906A2 2 0 0010 3.75H8.125zM10 6.25a.75.75 0 100 1.5.75.75 0 000-1.5z" />
                  <path d="M3.5 9.25a.75.75 0 000 1.5h.383c.059.407.16.797.298 1.162A3.5 3.5 0 003.5 14.25H2.75a.75.75 0 000 1.5h.75a3.5 3.5 0 006.441-2.066A3.482 3.482 0 0010.25 12H12a2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5h-1.75a3.482 3.482 0 00-.309-1.316A3.5 3.5 0 006.5 3.75H3.5a.75.75 0 000 1.5h3a3.5 3.5 0 000 7H3.5z" />
                </svg>
              )}
              <span className={isFetchingSummary ? 'ml-2' : ''}>{isFetchingSummary ? "Fetching..." : "Get Trace Summary"}</span>
            </motion.button>
            <motion.button
              onClick={handleGetOptimizationTips}
              disabled={isFetchingOptimizationTips || isFetchingSummary}
              whileHover={{ scale: 1.05, y: -2, boxShadow: (isFetchingOptimizationTips || isFetchingSummary) ? undefined : "-7px -7px 14px var(--clay-shadow-light), 7px 7px 14px var(--clay-shadow-dark)" }}
              whileTap={{ scale: 0.95, boxShadow: (isFetchingOptimizationTips || isFetchingSummary) ? undefined : "var(--clay-shadow-inset-sm)" }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[var(--clay-accent-success)] text-white font-medium clay-element clay-element-sm-shadow disabled:opacity-70 disabled:bg-[var(--clay-bg-darker)] disabled:text-[var(--clay-text-light)] disabled:shadow-[var(--clay-shadow-inset)] flex items-center justify-center min-w-[200px]"
            >
              {isFetchingOptimizationTips ? (
                <LoadingSpinner size="sm" colorClass='border-[var(--clay-text-light)]' /> 
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                    <path d="M10 3.5a5.5 5.5 0 00-5.438 6.407A5.002 5.002 0 004 13.5V15a1 1 0 001 1h10a1 1 0 001-1v-1.5a5.002 5.002 0 00-.562-2.093A5.5 5.5 0 0010 3.5zM8.5 14.5V13h3v1.5h-3z" />
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75V1a.75.75 0 010 1.5V2A.75.75 0 0110 2zM13.465 3.785a.75.75 0 10-1.06-1.06L11.5 3.25a.75.75 0 001.06 1.06l.905-.905zM3.785 6.535a.75.75 0 001.06-1.06L3.25 4.565a.75.75 0 00-1.06 1.06l.905.905zM16.215 6.535a.75.75 0 101.06-1.06l-.905-.905a.75.75 0 00-1.06 1.06l.905.905zM6.535 16.215a.75.75 0 10-1.06 1.06l.905.905a.75.75 0 001.06-1.06l-.905-.905zM17.28 13.465a.75.75 0 00-1.06 1.06l.905.905a.75.75 0 101.06-1.06l-.905-.905z" clipRule="evenodd" />
                  </svg>
              )}
              <span className={isFetchingOptimizationTips ? 'ml-2' : ''}>{isFetchingOptimizationTips ? "Fetching..." : "Get Optimization Tips"}</span>
            </motion.button>
          </div>
        </div>
         {showGeneralPageError && <ErrorMessage error={pageError} onClear={() => setPageError(null)} />}
      </motion.div>
      
      <motion.div variants={itemVariants} className="clay-element p-4 sm:p-6 min-h-[300px]">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--clay-text)] mb-6">Span Timeline</h2>
        <TraceTimeline trace={currentTrace} onSpanSelect={handleSelectSpan} />
      </motion.div>

      <SpanDetailView
        span={selectedSpan}
        traceId={currentTrace.traceID}
        isOpen={!!selectedSpan}
        onClose={handleCloseSpanDetail}
      />

      <Modal
        isOpen={isSummaryModalOpen}
        onClose={() => { setIsSummaryModalOpen(false); if(pageError) setPageError(null); }}
        title="Trace Summary from Gemini"
        size="lg"
      >
        {isFetchingSummary && <div className="flex justify-center p-4"><LoadingSpinner message="Generating summary..."/></div>}
        {summaryData && !isFetchingSummary && (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--clay-text)]">{summaryData.summary}</div>
        )}
        {pageError && isSummaryModalOpen && <ErrorMessage error={pageError} onClear={() => setPageError(null)}/>}
      </Modal>

      <Modal
        isOpen={isOptimizationModalOpen}
        onClose={() => { setIsOptimizationModalOpen(false); if(pageError) setPageError(null); }}
        title="Optimization Tips from Gemini"
        size="lg"
      >
        {isFetchingOptimizationTips && <div className="flex justify-center p-4"><LoadingSpinner message="Generating optimization tips..."/></div>}
        {optimizationTipsData && !isFetchingOptimizationTips && (
          <pre className="whitespace-pre-wrap bg-[var(--clay-bg-darker)] p-3 rounded-lg text-sm font-mono text-[var(--clay-text)] clay-inset-sm">{optimizationTipsData.tips}</pre>
        )}
        {pageError && isOptimizationModalOpen && <ErrorMessage error={pageError} onClear={() => setPageError(null)}/>}
      </Modal>
    </motion.div>
  );
};

export default TraceDetailPage;
