
import React, { useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import StatCard from '../components/ErrorAnalytics/StatCard';
import { motion } from 'framer-motion';
import { CHART_COLORS } from '../constants';
import { ErrorHeatmapDataItem } from '../types';

// Icons for StatCards
const TotalErrorsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" /></svg>;
const UniqueErrorsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25l-1.25-2.25L13.5 11l2.25-1.25L17 7.5l1.25 2.25L20.5 11l-2.25 1.25z" /></svg>;
const AvgFrequencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>;
const MaxFrequencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;


const ErrorAnalyticsPage: React.FC = () => {
  const {
    errorHeatmapData,
    errorStats,
    topErrors,
    isAnalyticsLoading,
    fetchErrorAnalyticsData,
    analyticsError,
    clearAnalyticsError,
  } = useAppContext();

  useEffect(() => {
    fetchErrorAnalyticsData();
    return () => {
      clearAnalyticsError();
    };
  }, [fetchErrorAnalyticsData, clearAnalyticsError]);

  const pageContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren:0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale:0.95 },
    visible: { opacity: 1, y: 0, scale:1, transition: { type: "spring", stiffness:100, damping:15 }}
  };

  const chartDataWithColors = useMemo(() => {
    return errorHeatmapData.map((item, index) => ({
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [errorHeatmapData]);

  const topErrorsForPie = useMemo(() => {
    if (topErrors.length === 0) return [];
    
    const coloredTopErrors = topErrors.map((item, index) => ({
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
    }));

    if(errorStats && errorStats.totalOccurrences > 0 && topErrors.length < chartDataWithColors.length) {
        const topErrorsSum = topErrors.reduce((sum, item) => sum + item.frequency, 0);
        const othersFrequency = errorStats.totalOccurrences - topErrorsSum;
        if (othersFrequency > 0) {
            return [
                ...coloredTopErrors,
                {
                    error: 'Others',
                    frequency: othersFrequency,
                    percentage: ((othersFrequency / errorStats.totalOccurrences) * 100).toFixed(2),
                    color: CHART_COLORS[topErrors.length % CHART_COLORS.length]
                }
            ];
        }
    }
    return coloredTopErrors;
  }, [topErrors, errorStats, chartDataWithColors.length]);


  if (isAnalyticsLoading && (!errorHeatmapData || errorHeatmapData.length === 0)) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><LoadingSpinner message="Loading error analytics..." size="lg"/></div>;
  }

  if (analyticsError) {
    return <ErrorMessage error={analyticsError} onClear={clearAnalyticsError} />;
  }

  if (!isAnalyticsLoading && (!errorHeatmapData || errorHeatmapData.length === 0) && !analyticsError) {
     return (
        <motion.div 
        variants={pageContainerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}
        className="text-center py-12 clay-element p-8 sm:p-12"
      >
        <motion.div variants={itemVariants}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--clay-text-light)" className="w-20 h-20 mx-auto mb-6 opacity-70">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </motion.div>
        <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-semibold text-[var(--clay-text)] mb-3">No Error Data Available</motion.h2>
        <motion.p variants={itemVariants} className="text-[var(--clay-text-light)] mb-8">There is currently no error data to display. Check back later or try fetching again if applicable.</motion.p>
      </motion.div>
     );
  }


  return (
    <motion.div 
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--clay-text)] mb-2">Error Analytics Dashboard</h1>
        <p className="text-[var(--clay-text-light)] text-sm sm:text-base">Overview of error occurrences and distributions.</p>
      </motion.div>

      {errorStats && (
        <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard index={0} title="Total Occurrences" value={errorStats.totalOccurrences.toLocaleString()} icon={<TotalErrorsIcon />} colorClass="text-[var(--clay-accent-error)]" />
          <StatCard index={1} title="Unique Errors" value={errorStats.totalUniqueErrors.toLocaleString()} icon={<UniqueErrorsIcon />} colorClass="text-[var(--clay-accent-info)]"/>
          <StatCard index={2} title="Avg Frequency" value={errorStats.avgFrequency.toFixed(2)} icon={<AvgFrequencyIcon />} colorClass="text-[var(--clay-accent-secondary)]"/>
          <StatCard index={3} title="Max Frequency" value={errorStats.maxFrequency.toLocaleString()} icon={<MaxFrequencyIcon />} colorClass="text-[var(--clay-accent-primary)]"/>
        </motion.div>
      )}
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <PieChart data={topErrorsForPie} title="Top Errors Distribution"/>
        <BarChart data={chartDataWithColors.slice(0, 8)} title="Top 8 Error Frequencies"/> {/* Show top 8 for bar chart for brevity */}
      </motion.div>

      <motion.div variants={itemVariants} className="clay-element p-6 rounded-xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--clay-text)] mb-6">All Errors List</h2>
        <div className="overflow-x-auto clay-inset rounded-lg">
          <table className="w-full min-w-[600px] text-sm text-left text-[var(--clay-text)]">
            <thead className="text-xs text-[var(--clay-text-light)] uppercase bg-[var(--clay-bg-darker)]/50">
              <tr>
                <th scope="col" className="px-6 py-3">Error Message</th>
                <th scope="col" className="px-6 py-3 text-right">Frequency</th>
                <th scope="col" className="px-6 py-3 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {chartDataWithColors.map((item, index) => (
                <motion.tr 
                  key={item.error}
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: index * 0.03, duration:0.3 }}
                  className="bg-[var(--clay-bg)] border-b border-[var(--clay-bg-darker)] hover:bg-[var(--clay-bg-darker)]/30 transition-colors duration-150"
                >
                  <td className="px-6 py-4 font-medium text-[var(--clay-text)] whitespace-nowrap">
                    <div className="flex items-center">
                       <span className="w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0" style={{backgroundColor: item.color}}></span>
                       {item.error}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">{item.frequency.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">{item.percentage}%</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
         {isAnalyticsLoading && <div className="pt-4"><LoadingSpinner message="Updating data..." size="sm"/></div>}
      </motion.div>
    </motion.div>
  );
};

export default ErrorAnalyticsPage;
