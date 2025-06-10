
import React, { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom'; // Import NavLink
import { useAppContext } from '../context/AppContext'; 
import { motion } from 'framer-motion';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { clearError } = useAppContext();

  const navLinkClasses = "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out";
  const activeNavLinkClasses = "clay-inset text-[var(--clay-accent-primary)]"; // Clay inset for active link
  const inactiveNavLinkClasses = "text-[var(--clay-text-light)] hover:text-[var(--clay-text)] hover:bg-[var(--clay-bg-darker)]";


  return (
    <div className="min-h-screen flex flex-col bg-[var(--clay-bg)]">
      <motion.header 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
        className="sticky top-0 z-50 clay-element rounded-none rounded-b-2xl mb-1"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link 
              to="/app" // Updated Link
              className="text-3xl font-bold tracking-tight text-[var(--clay-text)] hover:opacity-80 transition-opacity" 
              onClick={clearError}
            >
              Otel<span className="font-light text-[var(--clay-text-light)]">Viz</span> 
              <span className="text-sm font-normal text-[var(--clay-text-light)] ml-2"> & Gemini Assistant</span>
            </Link>
            <nav className="flex items-center space-x-2 sm:space-x-4">
               <NavLink
                to="/app" // Updated Link
                end // Add end prop for more precise active matching for root-like app paths
                onClick={clearError}
                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
              >
                Home
              </NavLink>
              <NavLink 
                to="/app/error-analytics" // Keep this as is, assuming it's part of the app
                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
              >
                Error Analytics
              </NavLink>
            </nav>
          </div>
        </div>
      </motion.header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <motion.footer 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        className="text-center p-5 text-sm text-[var(--clay-text-light)] mt-auto"
      >
        © {new Date().getFullYear()} OpenTelemetry Trace Visualizer. For educational purposes.
      </motion.footer>
    </div>
  );
};

export default Layout;