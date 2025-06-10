
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Trace, Service, ChatMessage, ApiError, ErrorHeatmapDataItem, ErrorStatsData } from '../types';
// import { MOCK_SERVICES } from '../constants'; // Removed MOCK_SERVICES
import * as apiService from '../services/apiService';

interface AppContextType {
  services: Service[];
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  traces: Trace[];
  setTraces: React.Dispatch<React.SetStateAction<Trace[]>>;
  currentTrace: Trace | null;
  setCurrentTraceById: (traceId: string | null) => void;
  isLoading: boolean; // For traces and single trace fetch
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: ApiError | null; // For traces and single trace fetch
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

  // Services specific state
  isLoadingServices: boolean;
  servicesError: ApiError | null;
  fetchServices: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);
  const [servicesError, setServicesError] = useState<ApiError | null>(null);

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
  const clearServicesError = useCallback(() => setServicesError(null), []);

  const fetchServicesCallback = useCallback(async () => {
    setIsLoadingServices(true);
    clearServicesError();
    try {
      const fetchedServices = await apiService.fetchServices();
      setServices(fetchedServices);
    } catch (err) {
      setServicesError({ message: (err as Error).message || 'Failed to fetch services' });
      setServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  }, [clearServicesError]); 

  useEffect(() => {
    fetchServicesCallback();
  }, [fetchServicesCallback]);


  const setSelectedService = (service: Service | null) => {
    setSelectedServiceState(service);
    setTraces([]);
    setCurrentTraceState(null);
    clearError();
  };

  const setCurrentTraceById = useCallback(async (traceId: string | null) => {
    clearError();
    if (!traceId) {
      setCurrentTraceState(null);
      return;
    }

    // Always fetch the trace from the API when a traceId is provided
    setIsLoading(true);
    setError(null); // Clear previous errors before new fetch
    try {
      const fetchedTrace = await apiService.fetchTraceById(traceId);
      setCurrentTraceState(fetchedTrace);
      if (!fetchedTrace) {
         setError({ message: `Trace with ID ${traceId} not found.` });
      }
      // Optionally, if you want to update the main 'traces' list when a single trace is fetched:
      // This can be useful if you want the trace to be "cached" in the list after being viewed once.
      // if (fetchedTrace) {
      //   setTraces(prevTraces => {
      //     const existingIndex = prevTraces.findIndex(t => t.traceID === fetchedTrace.traceID);
      //     if (existingIndex > -1) {
      //       const updatedTraces = [...prevTraces];
      //       updatedTraces[existingIndex] = fetchedTrace; // Update existing
      //       return updatedTraces;
      //     }
      //     return [...prevTraces, fetchedTrace]; // Add if new
      //   });
      // }
    } catch (err) {
      setError({ message: (err as Error).message || `Failed to fetch trace ${traceId}` });
      setCurrentTraceState(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const fetchTraces = async (serviceId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) {
        throw new Error(`Service with id ${serviceId} not found.`);
      }
      const fetchedTraces = await apiService.fetchTracesForService(service.name); 
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
      const heatmapRes = await apiService.fetchErrorHeatmapData();
      if (heatmapRes.success) setErrorHeatmapData(heatmapRes.data);
      else throw new Error(heatmapRes.message || 'Failed to fetch heatmap data');
      
      const statsRes = await apiService.fetchErrorStats();
      if (statsRes.success) setErrorStats(statsRes.data);
      else throw new Error(statsRes.message || 'Failed to fetch error stats');

      const topErrorsRes = await apiService.fetchTopErrors(5);
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
  }, []);

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
      // Services
      isLoadingServices,
      servicesError,
      fetchServices: fetchServicesCallback,
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
