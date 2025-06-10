
import React from 'react';
import { motion } from 'framer-motion';
import { ErrorHeatmapDataItem } from '../../types';
import { CHART_COLORS } from '../../constants';

interface PieChartProps {
  data: ErrorHeatmapDataItem[];
  title?: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, title = "Error Distribution" }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-[var(--clay-text-light)] py-4">No data for pie chart.</p>;
  }

  const totalValue = data.reduce((sum, item) => sum + item.frequency, 0);
  
  let cumulativePercentage = 0;
  const gradientSegments = data.map((item, index) => {
    const percentage = (item.frequency / totalValue) * 100;
    const color = item.color || CHART_COLORS[index % CHART_COLORS.length];
    const startAngle = cumulativePercentage;
    cumulativePercentage += percentage;
    const endAngle = cumulativePercentage;
    return `${color} ${startAngle}% ${endAngle}%`;
  });

  const conicGradient = `conic-gradient(${gradientSegments.join(', ')})`;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, scale: 1,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="clay-element p-6 rounded-xl w-full h-full flex flex-col"
    >
      <h3 className="text-lg font-semibold text-[var(--clay-text)] mb-4 text-center">{title}</h3>
      <div className="flex flex-col md:flex-row items-center justify-around gap-6 flex-grow">
        <motion.div 
          className="w-40 h-40 sm:w-48 sm:h-48 rounded-full clay-element-sm-shadow"
          style={{ background: conicGradient }}
          aria-label={`Pie chart showing ${title}`}
          role="img"
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
        />
        <div className="w-full md:w-auto max-w-xs text-xs space-y-1.5">
          {data.map((item, index) => (
            <motion.div 
              key={item.error} 
              variants={itemVariants}
              className="flex items-center"
            >
              <span 
                className="w-3 h-3 rounded-sm mr-2.5 flex-shrink-0" 
                style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-[var(--clay-text)] truncate" title={item.error}>{item.error}</span>
              <span className="ml-auto text-[var(--clay-text-light)] font-medium">
                {((item.frequency / totalValue) * 100).toFixed(1)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PieChart;
