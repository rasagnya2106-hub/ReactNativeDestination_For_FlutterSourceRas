type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method: HttpMethod;
  headers?: HeadersInit;
  body?: any;
}

/**
 * Minimal API client mirroring the original Flutter ApiService.
 * Uses the global `fetch` API and respects the base URL defined in the environment.
 */
class ApiService {
  private static readonly baseUrl: string = process.env.API_BASE_URL ?? '';

  private static buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(`${ApiService.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private static async request<T>(path: string, options: RequestOptions, params?: Record<string, any>): Promise<T> {
    const url = ApiService.buildUrl(path, params);
    const response = await fetch(url, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  }

  static get<T>(path: string, params?: Record<string, any>, headers?: HeadersInit): Promise<T> {
    return ApiService.request<T>(path, { method: 'GET', headers }, params);
  }

  static post<T>(path: string, body?: any, headers?: HeadersInit): Promise<T> {
    return ApiService.request<T>(path, { method: 'POST', headers, body });
  }

  static put<T>(path: string, body?: any, headers?: HeadersInit): Promise<T> {
    return ApiService.request<T>(path, { method: 'PUT', headers, body });
  }

  static delete<T>(path: string, body?: any, headers?: HeadersInit): Promise<T> {
    return ApiService.request<T>(path, { method: 'DELETE', headers, body });
  }

  static patch<T>(path: string, body?: any, headers?: HeadersInit): Promise<T> {
    return ApiService.request<T>(path, { method: 'PATCH', headers, body });
  }
}

export default ApiService;