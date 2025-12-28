// lib/api.ts
// API Client for iContract Analytics Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://iphone-chatbot-i7j6.onrender.com';

// ==========================================
// TypeScript Interfaces
// ==========================================

export interface QueryRequest {
  question: string;
  include_sql?: boolean;
  include_data?: boolean;
}

export interface KeyMetric {
  label: string;
  value: string;
  unit: string;
}

export interface StructuredAnalysis {
  summary: string;
  key_metrics: KeyMetric[];
  details?: string[];
  insight?: string;
}

export interface QueryResponse {
  question: string;
  answer: string;
  sql?: string;
  data?: any[];
  metadata?: {
    row_count: number;
    columns: string[];
  };
  structured?: StructuredAnalysis;
}

// ==========================================
// API Functions
// ==========================================

/**
 * Main query function - Send question to backend
 */
export async function queryAPI(request: QueryRequest): Promise<QueryResponse> {
  // Handle Render cold start (free tier may take 30-60 seconds to wake up)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds timeout

  try {
    console.log('🔍 Sending query to API:', request.question);
    
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        detail: `API error: ${response.status} ${response.statusText}` 
      }));
      throw new Error(error.detail || 'API request failed');
    }

    const data = await response.json();
    console.log('✅ API response received');
    return data;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('⏱️ Request timeout - Server may be starting up (cold start). Please wait 30 seconds and try again.');
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('🌐 Network error - Cannot connect to server. Please check your internet connection.');
    }
    
    throw error;
  }
}

/**
 * Get database schema
 */
export async function getSchema() {
  try {
    const response = await fetch(`${API_BASE_URL}/schema`);
    if (!response.ok) throw new Error('Failed to fetch schema');
    return response.json();
  } catch (error) {
    console.error('Schema fetch error:', error);
    throw error;
  }
}

/**
 * Get example questions
 */
export async function getExamples() {
  try {
    const response = await fetch(`${API_BASE_URL}/examples`);
    if (!response.ok) throw new Error('Failed to fetch examples');
    return response.json();
  } catch (error) {
    console.error('Examples fetch error:', error);
    throw error;
  }
}

/**
 * Health check - Test if backend is alive
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Check if backend is available
 */
export async function checkBackendConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    const isHealthy = await healthCheck();
    if (isHealthy) {
      return {
        connected: true,
        message: 'Backend connected successfully ✅',
      };
    } else {
      return {
        connected: false,
        message: 'Backend is not responding ❌',
      };
    }
  } catch (error) {
    return {
      connected: false,
      message: `Connection failed: ${formatErrorMessage(error)} ❌`,
    };
  }
}
