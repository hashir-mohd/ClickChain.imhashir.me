
import { 
  Trace, 
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
  TopErrorsResponse,
  ErrorHeatmapDataItem
} from '../types';
import { MOCK_TRACES } from '../data/mockTraces';
import { API_BASE_URL } from '../constants';

// Helper to simulate API calls
const mockApiCall = <T,>(data: T, delay: number = 800, failRate: number = 0): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) {
        reject(new Error('Simulated API Error: The operation failed. Please try again.'));
      } else {
        resolve(data);
      }
    }, delay);
  });
};

// This is a mock for the frontend. In a real app, this would fetch from /api/traces or similar.
export const fetchTracesForService = async (serviceId: string): Promise<Trace[]> => {
  console.log(`Fetching traces for service: ${serviceId}`);
  const serviceTraceMap: Record<string, number[]> = {
    'auth': [0],
    'catalog': [1],
    'payment': [2],
    'inventory': [3],
    'shipping': [4],
  };
  const indices = serviceTraceMap[serviceId] || [0,1,2,3,4];
  const tracesToShow = indices.map(i => MOCK_TRACES[i]).filter(Boolean);
  return mockApiCall(tracesToShow.length > 0 ? tracesToShow : MOCK_TRACES.slice(0,2) , 500);
};

const postToGeminiApi = async <ReqBody, ResBody>(endpoint: string, body: ReqBody): Promise<ResBody> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      throw { message: errorData.message || `API Error: ${response.statusText}`, status: response.status } as ApiError;
    }
    return await response.json() as ResBody;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    if ((error as ApiError).message) throw error;
    throw { message: `Network or simulated API error for ${endpoint}. Check console.` } as ApiError;
  }
};

// Mock implementations for Gemini features
export const getTraceSummary = async (trace: Trace): Promise<GeminiSummaryResponse> => {
  return mockApiCall({ summary: `Mock Summary: Trace ${trace.traceID} involves ${trace.spans.length} spans. The primary operation is '${trace.spans[0]?.operationName || 'unknown'}'. ${trace.spans.some(s => s.tags.error) ? 'Errors were detected.' : 'No errors detected.'}` });
};

export const postChatMessage = async (request: GeminiChatRequest): Promise<GeminiChatApiResponse> => {
  const newConversationId = request.conversationId || `conv-${Date.now()}`;
  return mockApiCall({
    success: true,
    data: {
      conversationId: newConversationId,
      prompt: request.prompt,
      response: `Gemini Mock: Thanks for asking about "${request.prompt}". ${request.traceId ? `Context trace: ${request.traceId}. ` : ''}Here's a helpful thought: The key to understanding distributed systems is to visualize the flow of requests.`,
      conversationLength: (Math.random() * 5 | 0) + 1 ,
    }
  });
};

export const getErrorResources = async (errorMessage: string): Promise<GeminiResourcesResponse> => {
  return mockApiCall({
    links: [
      { title: `Mock Doc for: ${errorMessage}`, link: '#', snippet: 'This is a helpful snippet about solving the error.'},
      { title: 'General Debugging Tips', link: '#', snippet: 'Check logs, verify configurations, and ensure dependencies are up.'},
    ]
  });
};

export const getErrorFix = async (errorContext: string): Promise<GeminiFixResponse> => {
  return mockApiCall({ fix: `Mock Fix for "${errorContext}":\n1. Check database connection string.\n2. Ensure the service has permissions.\n3. Restart the related pod.` });
};

export const getOptimizationTips = async (errorContext: string): Promise<GeminiOptimizeResponse> => {
  return mockApiCall({ tips: `Mock Optimization for "${errorContext}":\n- Consider adding caching for frequently accessed data.\n- Profile the code section to identify specific bottlenecks.\n- Parallelize independent tasks if possible.` });
};

export const explainError = async (errorMessage: string): Promise<GeminiExplainResponse> => {
  return mockApiCall({ explanation: `Mock Explanation for "${errorMessage}": This error typically occurs when a downstream service is unavailable or returns an unexpected response. It might also indicate a network connectivity issue or a misconfiguration in the service itself.` });
};

// New Mock API calls for Error Analytics
// In a real app, these would call GET `${API_BASE_URL}/error-heatmap` etc.
const mockErrorData: ErrorHeatmapDataItem[] = [
  { error: 'NullPointerException', frequency: 152, percentage: "30.40" },
  { error: 'TimeoutException', frequency: 101, percentage: "20.20" },
  { error: 'IllegalArgumentException', frequency: 85, percentage: "17.00" },
  { error: 'DBConnectionError', frequency: 73, percentage: "14.60" },
  { error: 'AuthFailure', frequency: 51, percentage: "10.20" },
  { error: 'OutOfMemoryError', frequency: 28, percentage: "5.60" },
  { error: 'FileNotFoundException', frequency: 10, percentage: "2.00" },
];
const totalMockErrors = mockErrorData.reduce((sum, item) => sum + item.frequency, 0);

export const fetchErrorHeatmapData = async (): Promise<ErrorHeatmapResponse> => {
  return mockApiCall({
    success: true,
    data: mockErrorData.map(item => ({...item, percentage: ((item.frequency / totalMockErrors) * 100).toFixed(2) }) ),
    totalErrors: totalMockErrors,
    message: 'Error heatmap data fetched successfully'
  }, 1000);
};

export const fetchErrorStats = async (): Promise<ErrorStatsResponse> => {
  const frequencies = mockErrorData.map(e => e.frequency);
  return mockApiCall({
    success: true,
    data: {
      totalUniqueErrors: mockErrorData.length,
      totalOccurrences: totalMockErrors,
      avgFrequency: totalMockErrors / mockErrorData.length,
      maxFrequency: Math.max(...frequencies),
      minFrequency: Math.min(...frequencies),
    },
    message: 'Error statistics fetched successfully'
  }, 600);
};

export const fetchTopErrors = async (limit: number = 5): Promise<TopErrorsResponse> => {
    const sortedErrors = [...mockErrorData].sort((a,b) => b.frequency - a.frequency);
    return mockApiCall({
        success: true,
        data: sortedErrors.slice(0, limit),
        message: `Top ${limit} errors fetched successfully`
    }, 700);
};
