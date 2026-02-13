import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiError extends Error {
  status?: number;
  data?: any;
}

class ApiService {
  private client: AxiosInstance;
  private tokenKey = 'auth_token';

  constructor() {
    const baseURL = process.env.API_BASE_URL ?? 'https://api.example.com';
    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(this.attachAuthHeader);
    this.client.interceptors.response.use(
      (response) => response,
      this.handleErrorResponse,
    );
  }

  private attachAuthHeader = async (config: AxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(this.tokenKey);
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  };

  private handleErrorResponse = (error: any): Promise<never> => {
    const apiError: ApiError = new Error(error.message);
    if (error.response) {
      apiError.status = error.response.status;
      apiError.data = error.response.data;
    }
    return Promise.reject(apiError);
  };

  async setAuthToken(token: string | null): Promise<void> {
    if (token) {
      await AsyncStorage.setItem(this.tokenKey, token);
    } else {
      await AsyncStorage.removeItem(this.tokenKey);
    }
  }

  private async request<T>(
    method: HttpMethod,
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const requestConfig: AxiosRequestConfig = {
      method,
      url,
      data,
      ...config,
    };
    const response: AxiosResponse<T> = await this.client.request<T>(requestConfig);
    return response.data;
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  post<T>(url: string, body: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', url, body, config);
  }

  put<T>(url: string, body: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', url, body, config);
  }

  patch<T>(url: string, body: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, body, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }
}

export const api = new ApiService();