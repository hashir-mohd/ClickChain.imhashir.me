
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import {
  Trace,
  Service,
  Span, 
  SpanException, 
  GeminiSummaryResponse,
  GeminiChatRequest,
  GeminiChatApiResponse,
  GeminiResourcesResponse,
  GeminiFixResponse,
  GeminiOptimizeResponse,
  GeminiExplainResponse,
  ApiError,
  ErrorHeatmapResponse,
  ErrorStatsResponse,
  TopErrorsResponse
} from '../types';
import { API_BASE_URL } from '../constants';

// Generic API fetch helper using axios
const fetchApi = async <TResponse>(
  path: string, // Full path e.g., /api/traces or /api/summary
  method: string = 'GET',
  body?: any
): Promise<TResponse> => {
  const config: AxiosRequestConfig = {
    method: method.toUpperCase(),
    url: `${API_BASE_URL}${path}`,
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${getAuthToken()}` // Placeholder for auth token if needed
    },
  };

  if (body && (config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH')) {
    config.data = body;
  }

  try {
    const response = await axios(config);
    // Axios returns data directly. For 204 No Content, response.data might be null or empty.
    // The original fetchApi returned undefined for 204. We'll try to match that if needed,
    // but for most cases, response.data is what we want.
    if (response.status === 204) {
      return undefined as unknown as TResponse;
    }
    return response.data as TResponse;
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    let apiError: ApiError;

    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = axiosError.response.data?.message || 
                      (typeof axiosError.response.data === 'string' ? axiosError.response.data : null) || // Handle plain string error response
                      axiosError.response.statusText || 
                      `Request failed with status ${axiosError.response.status}`;
      apiError = { message, status: axiosError.response.status };
    } else if (axiosError.request) {
      // The request was made but no response was received
      apiError = { message: 'Network error: No response received from server.' };
    } else {
      // Something happened in setting up the request that triggered an Error
      apiError = { message: axiosError.message || 'An unexpected error occurred setting up the request.' };
    }
    
    console.error(`API Error for ${method} ${path}:`, { 
      message: apiError.message, 
      status: apiError.status, 
      axiosErrorMessage: axiosError.message,
      responseData: axiosError.response?.data 
    });
    throw apiError;
  }
};


// Jaeger/Trace related APIs
export const fetchServices = async (): Promise<Service[]> => {
  // Define the expected response structure from the backend for /api/services
  type BackendServicesEnvelope = {
    success: boolean;
    data: {
      data: string[]; // This is the array of service names
      total: number;
      limit: number;
      offset: number;
      errors: any | null; // Or a more specific error type if known
    };
    message?: string; // Message might be optional
  };

  const response = await fetchApi<BackendServicesEnvelope>('/api/services');

  if (response.success && response.data && Array.isArray(response.data.data)) {
    const serviceNames: string[] = response.data.data;
    // Transform the array of service name strings into an array of Service objects
    return serviceNames.map(name => ({
      id: name, // Use the service name as the ID for simplicity
      name: name
    }));
  }
  
  let errorMessage = 'Failed to fetch services: Response was not successful or data format is incorrect.';
  if (!response.success && response.message) {
    errorMessage = `Failed to fetch services: ${response.message}`;
  } else if (response.data && response.data.errors) {
    errorMessage = `Failed to fetch services: API returned errors: ${JSON.stringify(response.data.errors)}`;
  } else if (!response.success) {
    errorMessage = `Failed to fetch services: Backend indicated failure.`;
  }

  console.error('Error fetching services, raw response:', response);
  throw new Error(errorMessage);
};

// Define the raw trace structure as received from backend (with microsecond timestamps)
interface RawSpanException {
  timestamp: number; // microseconds
  'exception.type': string;
  'exception.message': string;
  'exception.stacktrace': string;
}

interface RawSpan {
  spanID: string;
  operationName: string;
  startTime: number; // microseconds
  duration: number; // microseconds
  tags: any; 
  errorContext?: string;
  exceptions?: RawSpanException[];
}

interface RawTrace {
  traceID: string;
  spans: RawSpan[];
}

// Helper to transform a single RawTrace to Trace (with timestamp conversion)
const transformRawTraceToTrace = (rawTrace: RawTrace): Trace => {
  const transformedSpans = rawTrace.spans.map((rawSpan: RawSpan): Span => {
    const transformedExceptions = rawSpan.exceptions?.map((rawEx: RawSpanException): SpanException => ({
      ...rawEx,
      timestamp: Math.floor(rawEx.timestamp / 1000), // Convert micro to milli
    }));
    return {
      ...rawSpan,
      startTime: Math.floor(rawSpan.startTime / 1000), // Convert micro to milli
      // duration is already in microseconds, matching the Span type definition
      tags: rawSpan.tags, 
      exceptions: transformedExceptions,
    } as Span; 
  });
  return {
    traceID: rawTrace.traceID,
    spans: transformedSpans,
  };
};


export const fetchTracesForService = async (serviceName: string): Promise<Trace[]> => {
  type BackendTracesEnvelope = {
    success: boolean;
    data: RawTrace[]; 
    message?: string;
  };

  const response = await fetchApi<BackendTracesEnvelope>(`/api/traces?service=${encodeURIComponent(serviceName)}`);

  if (response.success && Array.isArray(response.data)) {
    return response.data.map(transformRawTraceToTrace);
  }
  
  let errorMessage = `Failed to fetch traces for ${serviceName}: Response was not successful or data format is incorrect.`;
  if (!response.success && response.message) {
      errorMessage = `Failed to fetch traces for ${serviceName}: ${response.message}`;
  }
  console.error(`Error fetching traces for ${serviceName}, raw response:`, response);
  throw new Error(errorMessage);
};

export const fetchTraceById = async (traceID: string): Promise<Trace | null> => {
  type BackendSingleTraceEnvelope = {
    success: boolean;
    data: RawTrace[]; // Backend returns an array with a single trace
    message?: string;
  };

  try {
    const response = await fetchApi<BackendSingleTraceEnvelope>(`/api/traces/${traceID}`);

    if (response.success && Array.isArray(response.data) && response.data.length > 0) {
      const rawTrace = response.data[0];
      return transformRawTraceToTrace(rawTrace);
    } else if (response.success && Array.isArray(response.data) && response.data.length === 0) {
      // Trace not found by ID, but API call was successful
      console.warn(`Trace with ID ${traceID} not found. API returned empty data array.`);
      return null;
    }
    
    let errorMessage = `Failed to fetch trace ${traceID}: Response was not successful or data format is incorrect.`;
    if (!response.success && response.message) {
        errorMessage = `Failed to fetch trace ${traceID}: ${response.message}`;
    }
    console.error(`Error fetching trace ${traceID}, raw response:`, response);
    throw new Error(errorMessage);

  } catch (error) {
    // This catch block handles errors from fetchApi (network issues, non-2xx responses)
    // and errors thrown from within the try block (e.g., custom error messages)
    console.error(`Failed to fetch trace ${traceID}:`, error);
    // Re-throw the error so it can be caught by the caller in AppContext
    // Ensure it's an ApiError or a generic Error
    if (typeof error === 'object' && error !== null && 'message' in error) {
        throw error;
    }
    throw new Error(`An unexpected error occurred while fetching trace ${traceID}.`);
  }
};


// Gemini related APIs
export const getTraceSummary = async (trace: Trace): Promise<GeminiSummaryResponse> => {
  const summaryResponse = await fetchApi<GeminiSummaryResponse>('/api/summary', 'POST', { trace });
  if (summaryResponse && typeof summaryResponse.summary === 'string') {
    return summaryResponse;
  } else {
    console.error('Invalid summary response format from server:', summaryResponse);
    throw new Error('Failed to get trace summary: Invalid response format from server.');
  }
};

export const postChatMessage = async (request: GeminiChatRequest): Promise<GeminiChatApiResponse> => {
  return fetchApi<GeminiChatApiResponse>('/api/chat', 'POST', request);
};

export interface ErrorResourcesRequest {
  errorMessage: string;
  exceptions?: SpanException[];
}
export const getErrorResources = async (payload: ErrorResourcesRequest): Promise<GeminiResourcesResponse> => {
  const response = await fetchApi<GeminiResourcesResponse>('/api/resources', 'POST', payload);
  if (response && Array.isArray(response.links)) {
    return response;
  }
  console.error('Invalid resources response format from server:', response);
  throw new Error('Failed to get error resources: Invalid response format from server.');
};

export interface ErrorFixRequest {
  errorContext: string;
  exceptions?: SpanException[];
}
export const getErrorFix = async (payload: ErrorFixRequest): Promise<GeminiFixResponse> => {
  const response = await fetchApi<GeminiFixResponse>('/api/fix', 'POST', payload);
  if (response && typeof response.fix === 'string') {
    return response;
  }
  console.error('Invalid fix response format from server:', response);
  throw new Error('Failed to get error fix: Invalid response format from server.');
};

export const getOptimizationTips = async (trace: Trace): Promise<GeminiOptimizeResponse> => {
  const response = await fetchApi<GeminiOptimizeResponse>('/api/optimize', 'POST', { trace });
   if (response && typeof response.tips === 'string') {
    return response;
  }
  console.error('Invalid optimization tips response format from server:', response);
  throw new Error('Failed to get optimization tips: Invalid response format from server.');
};

export interface ExplainErrorRequest {
  errorMessage: string;
  exceptions?: SpanException[];
}
export const explainError = async (payload: ExplainErrorRequest): Promise<GeminiExplainResponse> => {
  const response = await fetchApi<GeminiExplainResponse>('/api/explain', 'POST', payload);
  if (response && typeof response.explanation === 'string') {
    return response;
  }
  console.error('Invalid explanation response format from server:', response);
  throw new Error('Failed to explain error: Invalid response format from server.');
};


// Error Analytics APIs
export const fetchErrorHeatmapData = async (): Promise<ErrorHeatmapResponse> => {
  return fetchApi<ErrorHeatmapResponse>('/api/heatmap/errors');
};

export const fetchErrorStats = async (): Promise<ErrorStatsResponse> => {
  return fetchApi<ErrorStatsResponse>('/api/heatmap/stats');
};

export const fetchTopErrors = async (limit: number = 5): Promise<TopErrorsResponse> => {
  return fetchApi<TopErrorsResponse>(`/api/heatmap/top-errors?limit=${limit}`);
};
