
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedLineGraph: React.FC = () => {
  const points = [
    { x: 50, y: 180 }, { x: 150, y: 120 }, { x: 250, y: 150 },
    { x: 350, y: 90 }, { x: 450, y: 110 }, { x: 550, y: 60 },
    { x: 650, y: 100 }, { x: 750, y: 130 }
  ];

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaD = `${pathD} V 220 H ${points[0].x} Z`;

  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number } | null>(null);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { duration: 2, ease: "easeInOut", delay: 0.3 } 
    }
  };
  
  const areaVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut", delay: 1.5 } }
  };

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 200, damping: 10, delay: 1 + i * 0.15 }
    })
  };

  const gridLineProps = {
    stroke: 'var(--clay-dark-text-secondary)',
    strokeWidth: "0.5",
    opacity: 0.15,
    strokeDasharray: "4 4"
  };

  return (
    <motion.div 
      className="dark-clay-lp-element p-6 sm:p-8 !rounded-2xl w-full max-w-4xl mx-auto"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="overflow-x-auto">
        <svg viewBox="0 0 800 250" className="min-w-[700px] w-full h-auto">
          {/* Grid Lines */}
          {[50, 100, 150, 200].map(y => (
            <motion.line key={`grid-y-${y}`} x1="30" y1={y} x2="770" y2={y} {...gridLineProps} 
              initial={{opacity:0}} animate={{opacity:0.15}} transition={{delay: y/100 + 0.5}}/>
          ))}
          {points.map((p,i) => (
             <motion.line key={`grid-x-${i}`} x1={p.x} y1="30" x2={p.x} y2="220" {...gridLineProps} 
              initial={{opacity:0}} animate={{opacity:0.15}} transition={{delay: i*0.1 + 0.8}}/>
          ))}
          
          {/* Area under path */}
          <motion.path
            d={areaD}
            fill="url(#areaGradient)"
            variants={areaVariants}
          />
          
          {/* Line Path */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="var(--clay-dark-lp-accent-teal)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
          />

          {/* Circles for data points */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="6"
              fill="var(--clay-dark-lp-accent-teal)"
              stroke="var(--clay-dark-element-bg)"
              strokeWidth="2"
              custom={index}
              variants={circleVariants}
              onMouseEnter={() => setHoveredPoint({ ...point, value: 220 - point.y })}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            />
          ))}

          {/* Axis labels (decorative) */}
          <text x="10" y="215" fontSize="12" fill="var(--clay-dark-text-secondary)" className="font-mono">0</text>
          <text x="10" y="35" fontSize="12" fill="var(--clay-dark-text-secondary)" className="font-mono">200</text>
          {points.map((p, i) => (
             <text key={`label-x-${i}`} x={p.x - 10} y="240" fontSize="12" fill="var(--clay-dark-text-secondary)" className="font-mono">Day {i+1}</text>
          ))}
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'var(--clay-dark-lp-accent-teal)', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'var(--clay-dark-lp-accent-teal)', stopOpacity: 0.01 }} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute dark-clay-lp-element text-xs !rounded-md px-2.5 py-1.5 pointer-events-none shadow-lg"
            style={{
              left: hoveredPoint.x + 5, // Adjust positioning as needed
              top: hoveredPoint.y - 40, // Adjust positioning as needed
              transform: 'translateX(-50%)' // Center tooltip
            }}
          >
            Value: <span className="font-bold text-[var(--clay-dark-lp-accent-teal)]">{hoveredPoint.value}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="text-center text-xs text-[var(--clay-dark-text-secondary)] mt-4">
        *Illustrative data. Performance metrics may vary.
      </p>
    </motion.div>
  );
};

export default AnimatedLineGraph;
