import { Platform } from 'react-native';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // Base URL can be configured per platform if needed
    this.baseUrl = Platform.select({
      ios: 'https://api.example.com',
      android: 'https://api.example.com',
      default: 'https://api.example.com',
    }) as string;
  }

  private async request<T>(endpoint: string, options: RequestOptions): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const headers = { ...defaultHeaders, ...options.headers };

    const fetchOptions: RequestInit = {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    const response = await fetch(url, fetchOptions);
    const responseData = (await response.json()) as T;

    return {
      data: responseData,
      status: response.status,
      ok: response.ok,
    };
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', headers, body });
  }

  async put<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', headers, body });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  async patch<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', headers, body });
  }
}

export default new ApiService();