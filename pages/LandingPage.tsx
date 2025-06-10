
import React, { useEffect, useState, useRef, ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useMotionValue, useTransform, Variants } from 'framer-motion';
import AnimatedLineGraph from '../components/LandingPage/AnimatedLineGraph';

// Helper: Icon components
const ZapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25l-1.25-2.25L13.5 11l2.25-1.25L17 7.5l1.25 2.25L20.5 11l-2.25 1.25z" />
  </svg>
);
const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CodeBracketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const DebuggingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.056 3 12s4.03 8.25 9 8.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v3.75m0-9A3.375 3.375 0 008.625 12a3.375 3.375 0 003.375 3.375A3.375 3.375 0 0015.375 12a3.375 3.375 0 00-3.375-3.375M12 12h.008v.008H12V12z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM21 21l-2.25-2.25" />
  </svg>
);

const AISolutionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M8.25 21v-1.5M12 10.5a1.5 1.5 0 00-1.5 1.5v.75a.75.75 0 01-1.5 0v-.75a3 3 0 116 0v.75a.75.75 0 01-1.5 0v-.75a1.5 1.5 0 00-1.5-1.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75A.75.75 0 0110.5 6h3a.75.75 0 01.75.75v3.75a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75V6.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8.25 8.25 0 005.728-2.205 8.216 8.216 0 000-11.59A8.25 8.25 0 003.013 12c0 2.23.883 4.256 2.315 5.728A8.204 8.204 0 0012 21zm0 0v.001z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="m15.364 13.636l1.06-1.06M10.06 13.636l-1.06-1.06" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" />
</svg>
);

const LearningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214l-2.072 1.372a5.25 5.25 0 00-3.58 4.962V21M9 3.75H6.375m3 0V2.25M6.375 3.75A2.25 2.25 0 004.125 6H2.25V4.125c0-.966.784-1.75 1.75-1.75H6M3 21v-1.125c0-.966.784-1.75 1.75-1.75H6M21 21v-1.125c0-.966-.784-1.75-1.75-1.75H18m2.625-15.75A2.25 2.25 0 0018.375 6H15.75V4.125c0-.966.784-1.75 1.75-1.75H21M18 3.75v1.5" />
  </svg>
);

interface Particle {
  id: string;
  x: string; // percentage
  y: string; // percentage
  size: number;
  color: string;
  opacity: number;
  type: 'dot' | 'circle' | 'square'; // Simplified types
}

const generateParticles = (count: number, type: Particle['type'], color: string, sizeRange: [number, number], opacityRange: [number, number]): Particle[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${type}-${i}-${Math.random().toString(36).substring(7)}`, // Ensure more unique ID
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
    color: color,
    opacity: Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0],
    type: type,
  }));
};


const LandingPage: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      mouseX.set(event.clientX - rect.left - rect.width / 2);
      mouseY.set(event.clientY - rect.top - rect.height / 2);
    }
  };
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      document.body.classList.add('landing-page-body');
    }
    return () => {
      if (isClient) {
        document.body.classList.remove('landing-page-body');
      }
    };
  }, [isClient]);

  const controls = useAnimation();
  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  // Parallax layers
  const parallaxLayer1Particles = useMemo(() => generateParticles(50, 'dot', 'var(--clay-dark-text-secondary)', [1, 3], [0.1, 0.3]), []);
  const parallaxLayer2Particles = useMemo(() => generateParticles(30, 'circle', 'var(--clay-dark-lp-accent-teal)', [3, 6], [0.2, 0.5]), []);
  const parallaxLayer3Particles = useMemo(() => generateParticles(20, 'square', 'var(--clay-dark-lp-accent-magenta)', [5, 10], [0.3, 0.6]), []);


  const layer1X = useTransform(mouseX, (val) => val * 0.05);
  const layer1Y = useTransform(mouseY, (val) => val * 0.05);
  const layer2X = useTransform(mouseX, (val) => val * 0.1);
  const layer2Y = useTransform(mouseY, (val) => val * 0.1);
  const layer3X = useTransform(mouseX, (val) => -val * 0.15); 
  const layer3Y = useTransform(mouseY, (val) => -val * 0.15);

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99], staggerChildren: 0.2 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };
  
  const featureCardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y:30 },
    visible: (i:number) => ({
      opacity: 1,
      scale: 1,
      y:0,
      transition: {
        delay: i * 0.15,
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    })
  };

  const navItemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type:'spring', stiffness:120, damping:12 } }
  };
  
  const [isNavScrolled, setIsNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <motion.div 
      className="flex flex-col min-h-screen text-[var(--clay-dark-text-primary)] scroll-smooth"
      initial="hidden"
      animate={controls}
    >
      {/* Header */}
      <motion.header 
         className={`sticky top-0 z-50 transition-all duration-300 ${isNavScrolled ? 'py-3 bg-[var(--clay-dark-element-bg)]/80 backdrop-blur-lg dark-clay-lp-element-sm-shadow !rounded-none !rounded-b-xl' : 'py-5 bg-transparent'}`}
      >
        <div className="container mx-auto px-6 lg:px-8 flex justify-between items-center">
          <motion.div variants={navItemVariants}>
            <Link to="/" className="text-3xl font-bold">
              Otel<span className="text-[var(--clay-dark-lp-accent-teal)]">Viz</span>
            </Link>
          </motion.div>
          <motion.nav variants={{visible: {transition: {staggerChildren: 0.1}}}} className="space-x-3 sm:space-x-5">
            {['Features', 'Benefits', 'Visualize'].map((item) => (
              <motion.a 
                key={item} 
                variants={navItemVariants}
                href={`#${item.toLowerCase()}`} 
                className="text-sm sm:text-base text-[var(--clay-dark-text-secondary)] hover:text-[var(--clay-dark-lp-accent-teal)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--clay-dark-element-bg)]/50"
              >
                {item}
              </motion.a>
            ))}
            <motion.div variants={navItemVariants} className="inline-block">
              <Link to="/app" className="text-sm sm:text-base bg-[var(--clay-dark-lp-accent-teal)] text-[var(--clay-dark-bg)] px-4 py-2.5 rounded-lg font-semibold dark-clay-lp-element-sm-shadow hover:brightness-110 transition-all duration-200 hover:shadow-[0_0_20px_var(--clay-dark-lp-accent-teal_/_50%)]">
                Launch App
              </Link>
            </motion.div>
          </motion.nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative flex-grow flex items-center justify-center py-20 md:py-32 overflow-hidden min-h-[calc(100vh-80px)]"
        variants={sectionVariants}
      >
        {/* Parallax Background Layers */}
        {[
          { particles: parallaxLayer1Particles, x: layer1X, y: layer1Y, zIndex: 1, keyPrefix: 'layer1-dots' },
          { particles: parallaxLayer2Particles, x: layer2X, y: layer2Y, zIndex: 2, keyPrefix: 'layer2-circles' },
          { particles: parallaxLayer3Particles, x: layer3X, y: layer3Y, zIndex: 3, keyPrefix: 'layer3-squares' },
        ].map((pLayerConfig) => (
          <motion.div
            key={`parallax-${pLayerConfig.keyPrefix}`}
            className="absolute inset-0 pointer-events-none" // pointer-events-none so it doesn't interfere with text selection
            style={{ x: pLayerConfig.x, y: pLayerConfig.y, zIndex: pLayerConfig.zIndex }}
          >
            {pLayerConfig.particles.map(particle => (
              <motion.div
                key={particle.id}
                className="absolute"
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  opacity: particle.opacity,
                  borderRadius: particle.type === 'circle' || particle.type === 'dot' ? '50%' : (particle.type === 'square' ? '4px' : '0px'),
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: particle.opacity, scale: 1 }}
                transition={{ delay: Math.random() * 0.5, duration: 0.5 + Math.random() * 0.5 }}
              />
            ))}
          </motion.div>
        ))}

        <div className="relative container mx-auto px-6 lg:px-8 text-center z-10">
          <motion.h1 
            variants={itemVariants} 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
          >
            Navigate <span className="text-[var(--clay-dark-lp-accent-teal)]">Complexity</span>.
            <br />
            Illuminate <span className="text-[var(--clay-dark-lp-accent-magenta)]">Insights</span>.
          </motion.h1>
          <motion.p 
            variants={itemVariants} 
            className="text-lg sm:text-xl md:text-2xl text-[var(--clay-dark-text-secondary)] max-w-3xl mx-auto mb-10"
          >
            Transform raw telemetry data into actionable understanding with our intelligent trace visualizer and integrated Gemini AI assistant.
          </motion.p>
          <motion.div variants={itemVariants} className="space-x-4">
            <Link 
              to="#features"
              className="px-8 py-4 bg-[var(--clay-dark-lp-accent-teal)] text-[var(--clay-dark-bg)] text-lg font-semibold rounded-xl dark-clay-lp-element-sm-shadow hover:brightness-110 transition-all duration-200 transform hover:scale-105 hover:shadow-[0_0_25px_var(--clay-dark-lp-accent-teal_/_60%)]"
            >
              Discover Features
            </Link>
            <Link 
              to="/app"
              className="px-8 py-4 bg-[var(--clay-dark-element-bg)] text-[var(--clay-dark-lp-accent-sky-blue)] text-lg font-semibold rounded-xl dark-clay-lp-element-sm-shadow hover:bg-[var(--clay-dark-bg)] border-2 border-[var(--clay-dark-lp-accent-sky-blue)] transition-all duration-200 transform hover:scale-105 hover:shadow-[0_0_20px_var(--clay-dark-lp-accent-sky-blue_/_40%)]"
            >
              Launch Demo App
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        variants={sectionVariants}
        className="py-16 sm:py-24 bg-[var(--clay-dark-bg)] dark-clay-lp-inset"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-center mb-4">Why OtelViz?</motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-[var(--clay-dark-text-secondary)] text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
            Unlock unprecedented clarity in your distributed systems. OtelViz is designed for developers and students alike.
          </motion.p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: EyeIcon, title: "Seamless Trace Visualization", description: "Intuitive timelines make complex trace data easy to follow and understand.", color: "var(--clay-dark-lp-accent-teal)" },
              { icon: SparklesIcon, title: "Gemini AI Copilot", description: "Get AI-powered summaries, explanations, and optimization tips directly in your workflow.", color: "var(--clay-dark-lp-accent-magenta)" },
              { icon: ZapIcon, title: "Intelligent Error Analytics", description: "Quickly identify, analyze, and understand error patterns with powerful analytics.", color: "var(--clay-dark-lp-accent-amber)" },
              { icon: CodeBracketIcon, title: "Developer-Centric Design", description: "Built with developers in mind for a smooth, productive, and insightful experience.", color: "var(--clay-dark-lp-accent-sky-blue)" }
            ].map((feature, i) => (
              <motion.div 
                key={feature.title} 
                custom={i}
                variants={featureCardVariants}
                className="dark-clay-lp-element p-6 !rounded-xl text-center flex flex-col items-center hover:scale-[1.03] hover:-translate-y-1 transition-all duration-250"
                style={{'--feature-color': feature.color} as React.CSSProperties}
              >
                <div className="p-3 mb-4 rounded-full dark-clay-lp-inset inline-block" style={{ boxShadow: `var(--clay-dark-shadow-inset), 0 0 15px -5px ${feature.color}`}}>
                  <feature.icon className="w-8 h-8" style={{color: feature.color}}/>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{color: feature.color}}>{feature.title}</h3>
                <p className="text-sm text-[var(--clay-dark-text-secondary)] flex-grow">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      
      {/* Benefits Section */}
      <motion.section id="benefits" variants={sectionVariants} className="py-16 sm:py-24">
        <div className="container mx-auto px-6 lg:px-8">
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-center mb-16">
                Supercharge Your Understanding
            </motion.h2>
            {[
                { title: "Effortless Debugging", description: "Rapidly pinpoint issues and bottlenecks. Our clear visualizations and AI assistance cut through the noise, guiding you directly to the root cause.", icon: DebuggingIcon, imageSide: 'left', color: 'var(--clay-dark-lp-accent-sky-blue)' },
                { title: "AI-Driven Solutions & Explanations", description: "Don't just find errors, understand them. Gemini provides contextual explanations, suggests potential fixes, and offers optimization strategies.", icon: AISolutionIcon, imageSide: 'right', color: 'var(--clay-dark-lp-accent-magenta)' },
                { title: "Accelerated Learning Curve", description: "Perfect for students and those new to microservices. Grasp complex system interactions and observability concepts with an interactive, AI-enhanced learning experience.", icon: LearningIcon, imageSide: 'left', color: 'var(--clay-dark-lp-accent-amber)' }
            ].map((benefit, index) => (
                <motion.div 
                    key={benefit.title} 
                    variants={itemVariants}
                    className={`flex flex-col md:flex-row items-center gap-8 lg:gap-12 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} mb-12 sm:mb-20`}
                >
                    <div className="md:w-1/2 dark-clay-lp-element !rounded-xl p-6 sm:p-8 flex items-center justify-center min-h-[250px] aspect-video">
                        <benefit.icon className="w-24 h-24 sm:w-32 sm:h-32 opacity-80" style={{color: benefit.color}}/>
                    </div>
                    <div className="md:w-1/2">
                        <h3 className="text-2xl sm:text-3xl font-semibold mb-3" style={{color: benefit.color}}>{benefit.title}</h3>
                        <p className="text-md sm:text-lg text-[var(--clay-dark-text-secondary)] leading-relaxed">{benefit.description}</p>
                    </div>
                </motion.div>
            ))}
        </div>
      </motion.section>

      {/* Visualize Performance Section */}
      <motion.section 
        id="visualize"
        variants={sectionVariants}
        className="py-16 sm:py-24 bg-[var(--clay-dark-bg)] dark-clay-lp-inset"
      >
        <div className="container mx-auto px-6 lg:px-8 text-center">
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold mb-4">Visualize Your Performance</motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-[var(--clay-dark-text-secondary)] mb-12 max-w-2xl mx-auto">
                Gain insights at a glance. Our platform not only visualizes traces but also provides tools to understand system health and error trends.
            </motion.p>
            <motion.div variants={itemVariants}>
              <AnimatedLineGraph />
            </motion.div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section variants={sectionVariants} className="py-20 sm:py-28 text-center">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Dive Deeper?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-[var(--clay-dark-text-secondary)] max-w-xl mx-auto mb-10">
            Start exploring your traces with unparalleled clarity and AI assistance today.
            OtelViz is free for educational use.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link 
              to="/app"
              className="px-10 py-5 bg-[var(--clay-dark-lp-accent-magenta)] text-white text-xl font-semibold rounded-xl dark-clay-lp-element-sm-shadow hover:brightness-110 transition-all duration-200 transform hover:scale-105 hover:shadow-[0_0_30px_var(--clay-dark-lp-accent-magenta_/_60%)]"
            >
              Get Started with OtelViz
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        variants={itemVariants} 
        className="text-center p-8 text-sm text-[var(--clay-dark-text-secondary)] border-t border-[var(--clay-dark-element-bg)]/50 mt-auto"
      >
        © {new Date().getFullYear()} OtelViz. An OpenTelemetry Visualizer & Gemini Assistant.
        <br />
        Designed for learning and exploration. Not for production use without review.
      </motion.footer>
    </motion.div>
  );
};

export default LandingPage;
