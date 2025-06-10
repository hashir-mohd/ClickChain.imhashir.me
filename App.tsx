
import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TraceDetailPage from './pages/TraceDetailPage';
import ErrorAnalyticsPage from './pages/ErrorAnalyticsPage';
import Layout from './components/Layout';
import ChatWidget from './components/Chat/ChatWidget';
import LandingPage from './pages/LandingPage';

// Component to decide if Layout and ChatWidget should be rendered
const AppContent: React.FC = () => {
  const location = useLocation();
  const isLandingPath = location.pathname === '/' || location.pathname === '/welcome';

  if (isLandingPath) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/welcome" element={<LandingPage />} />
         {/* Optional: Redirect any other non-app path to landing, or let it 404 */}
      </Routes>
    );
  }

  // Check if the path starts with /app for main application routes
  if (location.pathname.startsWith('/app')) {
    return (
      <Layout>
        <Routes>
          <Route path="/app" element={<HomePage />} />
          <Route path="/app/trace/:traceID" element={<TraceDetailPage />} />
          <Route path="/app/error-analytics" element={<ErrorAnalyticsPage />} />
          {/* Catch-all for /app/* if no other route matches, could be a 404 specific to the app section */}
          <Route path="/app/*" element={<Navigate to="/app" replace />} />
        </Routes>
        <ChatWidget />
      </Layout>
    );
  }

  // Fallback for any other path not matching landing or /app/*, redirect to landing.
  // This handles cases like old bookmarks to /trace/xyz directly.
  return <Navigate to="/" replace />;
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;