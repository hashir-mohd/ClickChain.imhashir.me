
export interface SpanException {
  timestamp: number;
  'exception.type': string;
  'exception.message': string;
  'exception.stacktrace': string;
}

export interface SpanTags {
  error?: 'true' | 'false' | boolean; // boolean for easier checking
  'http.method'?: string;
  'http.status_code'?: number;
  'error.context'?: string;
  'otel.status_code'?: 'OK' | 'ERROR' | 'UNSET';
  'otel.status_description'?: string;
  [key: string]: any; // Allow other tags
}

export interface Span {
  spanID: string;
  operationName: string;
  startTime: number; // Unix timestamp in milliseconds
  duration: number; // Duration in microseconds
  tags: SpanTags;
  errorContext?: string; // Extracted for convenience
  exceptions?: SpanException[];
  // parentSpanID?: string; // Mentioned as potential, but not in provided structure
}

export interface Trace {
  traceID: string;
  spans: Span[];
}

export interface Service {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: number;
  traceIdContext?: string;
}

export interface GeminiSummaryResponse {
  summary: string;
}

export interface GeminiChatRequest {
  prompt: string;
  conversationId?: string;
  traceId?: string;
}

export interface GeminiChatResponseData {
  conversationId: string;
  prompt: string;
  response: string;
  conversationLength: number;
}
export interface GeminiChatApiResponse {
  success: boolean;
  data: GeminiChatResponseData;
}

export interface GeminiResourceLink {
  title: string;
  link: string;
  snippet: string;
}
export interface GeminiResourcesResponse {
  links: GeminiResourceLink[];
}

export interface GeminiFixResponse {
  fix: string;
}

export interface GeminiOptimizeResponse {
  tips: string;
}

export interface GeminiExplainResponse {
  explanation: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// New types for Error Analytics
export interface ErrorHeatmapDataItem {
  error: string;
  frequency: number;
  percentage?: string;
  color?: string; // For chart display
}

export interface ErrorHeatmapResponse {
  success: boolean;
  data: ErrorHeatmapDataItem[];
  totalErrors?: number;
  message?: string;
}

export interface ErrorStatsData {
  totalUniqueErrors: number;
  totalOccurrences: number;
  avgFrequency: number;
  maxFrequency: number;
  minFrequency: number;
}

export interface ErrorStatsResponse {
  success: boolean;
  data: ErrorStatsData;
  message?: string;
}

export interface TopErrorsResponse {
  success: boolean;
  data: ErrorHeatmapDataItem[]; // error and frequency
  message?: string;
}