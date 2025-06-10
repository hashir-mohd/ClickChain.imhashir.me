
import { Service } from './types';

// API_BASE_URL should ideally be configured via an environment variable.
// For this setup, we'll use a relative path, assuming the frontend is served
// from the same origin as the backend, or a proxy is configured.
// In a typical build setup (e.g., with Create React App or Vite), this might be
// process.env.REACT_APP_API_URL or import.meta.env.VITE_API_URL.
export const API_BASE_URL = 'http://localhost:3000'; // Relative to the host

// GENERIC_OPTIMIZATION_CONTEXT removed as it's no longer used for the refactored optimization tips.

export const CHAT_WELCOME_MESSAGE = "Hello! I'm your Gemini assistant. How can I help you with these traces?";

export const CHART_COLORS: string[] = [
  '#89B0AE', // --clay-accent-primary
  '#FFB74D', // --clay-accent-secondary
  '#64B5F6', // --clay-accent-info
  '#E57373', // --clay-accent-error
  '#81C784', // --clay-accent-success
  '#BA68C8', // A nice purple
  '#FFD54F', // A nice yellow
  '#4DB6AC', // A teal variant
  '#A1887F', // A soft brown
  '#7986CB', // A nice indigo
];
