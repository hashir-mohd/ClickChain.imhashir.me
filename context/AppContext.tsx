
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Trace, Service, ChatMessage, ApiError, ErrorHeatmapDataItem, ErrorStatsData } from '../types';
import { MOCK_SERVICES } from '../constants';
import * as apiService from '../services/apiService';

interface AppContextType {
  services: Service[];
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  traces: Trace[];
  setTraces: React.Dispatch<React.SetStateAction<Trace[]>>;
  currentTrace: Trace | null;
  setCurrentTraceById: (traceId: string | null) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: ApiError | null;
  setError: React.Dispatch<React.SetStateAction<ApiError | null>>;
  fetchTraces: (serviceId: string) => Promise<void>;
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  conversationId: string | undefined;
  setConversationId: React.Dispatch<React.SetStateAction<string | undefined>>;
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  clearError: () => void;

  // Error Analytics
  errorHeatmapData: ErrorHeatmapDataItem[];
  errorStats: ErrorStatsData | null;
  topErrors: ErrorHeatmapDataItem[];
  isAnalyticsLoading: boolean;
  fetchErrorAnalyticsData: () => Promise<void>;
  analyticsError: ApiError | null;
  clearAnalyticsError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services] = useState<Service[]>(MOCK_SERVICES);
  const [selectedService, setSelectedServiceState] = useState<Service | null>(null);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [currentTrace, setCurrentTraceState] = useState<Trace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Error Analytics State
  const [errorHeatmapData, setErrorHeatmapData] = useState<ErrorHeatmapDataItem[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStatsData | null>(null);
  const [topErrors, setTopErrors] = useState<ErrorHeatmapDataItem[]>([]);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);
  const [analyticsError, setAnalyticsError] = useState<ApiError | null>(null);


  const clearError = useCallback(() => setError(null), []);
  const clearAnalyticsError = useCallback(() => setAnalyticsError(null), []);

  const setSelectedService = (service: Service | null) => {
    setSelectedServiceState(service);
    setTraces([]); 
    setCurrentTraceState(null); 
    clearError();
  };
  
  const setCurrentTraceById = useCallback((traceId: string | null) => {
    if (!traceId) {
      setCurrentTraceState(null);
      return;
    }
    const trace = traces.find(t => t.traceID === traceId);
    setCurrentTraceState(trace || null);
    clearError();
  }, [traces, clearError]);

  const fetchTraces = async (serviceId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTraces = await apiService.fetchTracesForService(serviceId);
      setTraces(fetchedTraces);
    } catch (err) {
      setError({ message: (err as Error).message || 'Failed to fetch traces' });
      setTraces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const fetchErrorAnalyticsData = useCallback(async () => {
    setIsAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const [heatmapRes, statsRes, topErrorsRes] = await Promise.all([
        apiService.fetchErrorHeatmapData(),
        apiService.fetchErrorStats(),
        apiService.fetchTopErrors(5) // Fetch top 5 errors for pie chart
      ]);
      
      if (heatmapRes.success) setErrorHeatmapData(heatmapRes.data);
      else throw new Error(heatmapRes.message || 'Failed to fetch heatmap data');
      
      if (statsRes.success) setErrorStats(statsRes.data);
      else throw new Error(statsRes.message || 'Failed to fetch error stats');

      if (topErrorsRes.success) setTopErrors(topErrorsRes.data);
      else throw new Error(topErrorsRes.message || 'Failed to fetch top errors');

    } catch (err) {
      setAnalyticsError({ message: (err as Error).message || 'Failed to fetch error analytics' });
      setErrorHeatmapData([]);
      setErrorStats(null);
      setTopErrors([]);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, [setIsAnalyticsLoading, setAnalyticsError, setErrorHeatmapData, setErrorStats, setTopErrors]); // Add setters if needed, though usually not for stable setters

  return (
    <AppContext.Provider value={{
      services,
      selectedService,
      setSelectedService,
      traces,
      setTraces,
      currentTrace,
      setCurrentTraceById,
      isLoading,
      setIsLoading,
      error,
      setError,
      clearError,
      fetchTraces,
      chatMessages,
      addChatMessage,
      conversationId,
      setConversationId,
      isChatOpen,
      setIsChatOpen,
      // Error Analytics
      errorHeatmapData,
      errorStats,
      topErrors,
      isAnalyticsLoading,
      fetchErrorAnalyticsData,
      analyticsError,
      clearAnalyticsError,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
