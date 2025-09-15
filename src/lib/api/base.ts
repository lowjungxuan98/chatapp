import { ApiResponse, ApiError, RequestConfig } from '@/types';

/**
 * Base API Manager class that handles HTTP requests and responses
 */
export class BaseApiManager {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authorization token for authenticated requests
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization token
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  /**
   * Make HTTP request
   */
  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, config.params);
      const headers = { ...this.defaultHeaders, ...config.headers };

      const fetchConfig: RequestInit = {
        method: config.method,
        headers,
      };

      // Add body for POST, PUT, PATCH requests
      if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        fetchConfig.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, fetchConfig);
      const data: ApiResponse<T> = await response.json();

      // Handle non-2xx responses
      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      // Re-throw ApiError instances
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors or other fetch errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(0, 'Network error: Please check your connection');
      }

      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        throw new ApiError(500, 'Invalid response format from server');
      }

      // Generic error fallback
      throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  /**
   * GET request
   */
  protected async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'GET',
      params,
      headers,
    });
  }

  /**
   * POST request
   */
  protected async post<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body,
      params,
      headers,
    });
  }

  /**
   * PUT request
   */
  protected async put<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body,
      params,
      headers,
    });
  }

  /**
   * DELETE request
   */
  protected async delete<T>(
    endpoint: string,
    params?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
      params,
      headers,
    });
  }

  /**
   * PATCH request
   */
  protected async patch<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body,
      params,
      headers,
    });
  }
}
