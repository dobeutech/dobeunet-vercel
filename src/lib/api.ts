/**
 * Netlify Functions API client
 * Use this in React components via useApi hook
 */

import { useMemo } from "react";
import { apiRequest, RequestOptions } from "./api-client";

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Use Vercel API routes in production, Vercel dev server in development
    this.baseUrl = "/api";
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const headers = this.getHeaders();
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
    const headers = this.getHeaders();
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
    const headers = this.getHeaders();
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: "PUT",
      headers: { ...headers, ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const headers = this.getHeaders();
    return apiRequest<T>(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: "DELETE",
      headers: { ...headers, ...options?.headers },
    });
  }
}

/**
 * React hook to get API client
 */
export function useApi() {
  return useMemo(() => {
    return new ApiClient();
  }, []);
}
