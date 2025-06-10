
import { Service } from './types';

export const MOCK_SERVICES: Service[] = [
  { id: 'auth', name: 'AuthenticationService' },
  { id: 'catalog', name: 'ProductCatalog' },
  { id: 'payment', name: 'PaymentGateway' },
  { id: 'inventory', name: 'InventoryService' },
  { id: 'shipping', name: 'ShippingService' },
];

export const API_BASE_URL = '/api/gemini'; // As specified in the prompt

export const GENERIC_OPTIMIZATION_CONTEXT = "General performance optimization for this operation.";

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
