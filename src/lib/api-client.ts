/**
 * API client with retry logic and error handling
 */

import {
  handleApiError,
  logError,
  ErrorSeverity,
  ErrorCategory,
} from "./error-handler";

interface RequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  includeAuth?: boolean; // Whether to include Auth0 token
}

/**
 * Get Auth0 access token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // TODO: Fix authentication token retrieval in non-React context
    // This function currently returns null, preventing authenticated requests outside of React components.
    // Consider passing the token explicitly or using a global store if necessary.
    return null;
  } catch {
    return null;
  }
}

/**
 * Enhanced fetch with retry logic, timeout, and error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    includeAuth = false,
    ...fetchOptions
  } = options;

  // Get Auth0 token if needed
  let authToken: string | null = null;
  if (includeAuth) {
    authToken = await getAuthToken();
  }

  const headers = new Headers(fetchOptions.headers);
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await handleApiError(
      async () => {
        const res = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorText = await res.text().catch(() => "Unknown error");
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        return res;
      },
      { retries, retryDelay },
    );

    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        logError(new Error("Request timeout"), {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NETWORK,
          context: { url, timeout },
        });
        throw new Error("Request timed out");
      }

      logError(error, {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        context: { url, method: fetchOptions.method || "GET" },
      });
    }

    throw error;
  }
}

/**
 * GET request helper
 */
export function get<T>(url: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(url, { ...options, method: "GET" });
}

/**
 * POST request helper
 */
export function post<T>(
  url: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request helper
 */
export function put<T>(
  url: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export function del<T>(url: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(url, { ...options, method: "DELETE" });
}

/**
 * Netlify Functions API client
 * Automatically includes Auth0 token and uses correct base URL
 */
export class NetlifyFunctionsClient {
  private baseUrl: string;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor(getTokenFn?: () => Promise<string | null>) {
    // Use Vercel API routes (works in both dev and production via vercel dev)
    this.baseUrl = "/api";
    this.getToken = getTokenFn || null;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const headers = await this.getHeaders();
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: "GET",
      headers: { ...headers, ...options?.headers },
    });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const headers = await this.getHeaders();
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: "POST",
      headers: { ...headers, ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const headers = await this.getHeaders();
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: "PUT",
      headers: { ...headers, ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const headers = await this.getHeaders();
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: "DELETE",
      headers: { ...headers, ...options?.headers },
    });
  }
}
