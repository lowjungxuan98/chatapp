import { ApiResponse, RequestConfig } from '@/types';
import { toast } from 'sonner';

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
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    let baseOrigin: string;
    if (typeof window !== 'undefined')
      baseOrigin = window.location.origin;
    else
      baseOrigin = process.env.NEXTAUTH_URL || '';
    const url = new URL(`${this.baseUrl}${endpoint}`, baseOrigin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  /**
   * Make HTTP request (returns standardized response)
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

      // if (!data.success)
      //   toast.error(data.message);
      // else 
      //   toast.success(data.message);
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'API Manager Error',
        error: error
      };
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
