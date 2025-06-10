
import { Trace, Span } from '../types';

const generateRandomId = (length: number = 16): string => {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

const createSpan = (
  operationName: string, 
  startTimeOffsetMs: number, 
  durationUs: number, 
  isError: boolean = false, 
  errorContext?: string,
  httpStatusCode?: number,
  exceptionType?: string,
  exceptionMessage?: string
): Span => {
  const baseTime = 1678886400000; // A fixed base time for consistency
  const span: Span = {
    spanID: generateRandomId(),
    operationName,
    startTime: baseTime + startTimeOffsetMs,
    duration: durationUs,
    tags: {
      'http.method': operationName.includes('http') ? (Math.random() > 0.5 ? 'GET' : 'POST') : undefined,
      'service.name': operationName.split('.')[0] || 'unknown-service',
    },
  };

  if (isError) {
    span.tags.error = true;
    span.tags['otel.status_code'] = 'ERROR';
    span.tags['otel.status_description'] = errorContext || 'An unspecified error occurred';
    span.tags['http.status_code'] = httpStatusCode || 500;
    if (errorContext) {
      span.errorContext = errorContext;
    }
    if (exceptionType && exceptionMessage) {
      span.exceptions = [{
        timestamp: span.startTime + Math.floor(durationUs / 2000), // Exception somewhere in the middle
        'exception.type': exceptionType,
        'exception.message': exceptionMessage,
        'exception.stacktrace': `at com.example.service.${operationName.replace(/\./g, '/')}(UnknownSource)\nat com.example.Main.handleRequest(Main.java:42)`
      }];
    }
  } else {
    span.tags['otel.status_code'] = 'OK';
    span.tags['http.status_code'] = httpStatusCode || 200;
  }
  return span;
};

export const MOCK_TRACES: Trace[] = [
  {
    traceID: `trace-${generateRandomId(12)}`,
    spans: [
      createSpan('http.server.AuthService/login', 0, 120000, false, undefined, 200),
      createSpan('db.query.AuthService/findUser', 20, 55000),
      createSpan('crypto.AuthService/verifyPassword', 80, 30000),
      createSpan('http.client.TokenService/generateToken', 115, 25000),
    ],
  },
  {
    traceID: `trace-${generateRandomId(12)}`,
    spans: [
      createSpan('http.server.ProductCatalog/listProducts', 0, 350000, true, 'Database connection timeout', 503, 'TimeoutException', 'Connection to product_db timed out after 5000ms'),
      createSpan('db.query.ProductCatalog/fetchAll', 10, 330000, true, 'Database connection timeout', undefined, 'TimeoutException', 'Connection to product_db timed out after 5000ms'),
    ],
  },
  {
    traceID: `trace-${generateRandomId(12)}`,
    spans: [
      createSpan('http.server.PaymentGateway/processPayment', 0, 850000), // Longest span
      createSpan('http.client.BankAPI/authorize', 50, 400000),
      createSpan('db.query.PaymentGateway/recordTransaction', 480, 150000, true, 'Insufficient funds in account', 402, 'InsufficientFundsException', 'User account 12345 has insufficient balance for transaction.'),
      createSpan('queue.producer.NotificationService/sendReceipt', 650, 50000),
    ],
  },
  {
    traceID: `trace-${generateRandomId(12)}`,
    spans: [
      createSpan('http.server.InventoryService/checkStock', 0, 75000),
      createSpan('cache.read.InventoryService/getProductStock', 5, 20000), // Fast cache read
      createSpan('db.query.InventoryService/confirmStock', 30, 40000),
    ],
  },
  {
    traceID: `trace-${generateRandomId(12)}`,
    spans: [
      createSpan('http.server.ShippingService/calculateQuote', 0, 220000),
      createSpan('http.client.AddressValidationAPI/validate', 15, 80000),
      createSpan('http.client.CarrierAPI/getRates', 100, 100000, true, 'Carrier API unavailable', 504, 'ApiUnavailableException', 'External carrier API did not respond.'),
      createSpan('logic.ShippingService/selectBestRate', 210, 5000),
    ],
  }
];
