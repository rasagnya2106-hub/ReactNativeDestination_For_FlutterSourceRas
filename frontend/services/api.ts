import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export class ApiError extends Error {
  public readonly status?: number;
  public readonly data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  private static instance: ApiService;
  private client: AxiosInstance;
  private readonly AUTH_TOKEN_KEY = 'authToken';

  private constructor() {
    const baseURL = __DEV__
      ? 'http://localhost:3000/api'
      : 'https://api.example.com';

    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        const token = await AsyncStorage.getItem(this.AUTH_TOKEN_KEY);
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        config.headers = {
          ...config.headers,
          'X-Platform': Platform.OS,
        };
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred';
        const apiError = new ApiError(
          message,
          error.response?.status,
          error.response?.data,
        );
        return Promise.reject(apiError);
      },
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return this.formatResponse(response);
  }

  public async post<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return this.formatResponse(response);
  }

  public async put<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return this.formatResponse(response);
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return this.formatResponse(response);
  }

  public async upload<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...(config?.headers || {}),
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await this.client.post<T>(url, formData, uploadConfig);
    return this.formatResponse(response);
  }

  private formatResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
    };
  }

  public async setAuthToken(token: string | null): Promise<void> {
    if (token) {
      await AsyncStorage.setItem(this.AUTH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(this.AUTH_TOKEN_KEY);
    }
  }

  public async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  public async clearAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(this.AUTH_TOKEN_KEY);
  }
}

export default ApiService.getInstance();