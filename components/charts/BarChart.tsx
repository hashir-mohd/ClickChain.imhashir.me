
import React from 'react';
import { motion } from 'framer-motion';
import { ErrorHeatmapDataItem } from '../../types';
import { CHART_COLORS } from '../../constants';

interface BarChartProps {
  data: ErrorHeatmapDataItem[];
  title?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title = "Error Frequencies" }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-[var(--clay-text-light)] py-4">No data for bar chart.</p>;
  }

  const maxValue = Math.max(...data.map(item => item.frequency), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
    }
  };

  const barVariants = {
    hidden: { opacity: 0, y: 30, height: 0 },
    visible: (custom: { height: string, delay: number }) => ({
      opacity: 1,
      y: 0,
      height: custom.height,
      transition: { type: "spring", stiffness: 100, damping: 12, delay: custom.delay }
    })
  };
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="clay-element p-6 rounded-xl w-full h-full flex flex-col"
    >
      <h3 className="text-lg font-semibold text-[var(--clay-text)] mb-6 text-center">{title}</h3>
      <motion.div 
        variants={containerVariants}
        className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 items-end min-h-[250px]" // Responsive grid
      >
        {data.map((item, index) => (
          <motion.div 
            key={item.error} 
            className="flex flex-col items-center group"
          >
            <motion.div
              custom={{ 
                height: maxValue > 0 ? `${(item.frequency / maxValue) * 80}%` : '0%',
                delay: index * 0.05
              }}
              variants={barVariants}
              style={{ minHeight: '20px', backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
              className="w-full rounded-t-md relative clay-element-sm-shadow"
              title={`${item.error}: ${item.frequency}`}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-[var(--clay-text)] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[var(--clay-bg)] px-1.5 py-0.5 rounded clay-element-sm-shadow">
                {item.frequency}
              </span>
            </motion.div>
            <p className="text-xs text-[var(--clay-text-light)] mt-2 text-center truncate w-full px-1" title={item.error}>
              {item.error}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default BarChart;
