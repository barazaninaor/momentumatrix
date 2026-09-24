import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Primary production URL pointing directly to the AWS server via DuckDNS
const PRIMARY_URL = 'https://momentumatrix.duckdns.org';

export const api = axios.create({
  baseURL: PRIMARY_URL,
  timeout: 10000, // 10 seconds timeout for AWS
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor with an automatic retry mechanism for initial network glitches
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    const isNetworkError = 
      error.code === 'ERR_NETWORK' || 
      error.code === 'ECONNABORTED' || 
      error.code === 'ERR_CANCELED' || 
      !error.response;

    // If it's a network/timeout error and we haven't retried yet for this request, try again once automatically after 1 second
    if (isNetworkError && originalRequest) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < 1) {
        originalRequest._retryCount += 1;
        console.warn(`[API] Initial connection failed. Retrying request to AWS... (${originalRequest._retryCount})`);
        
        // Wait 1 second before retrying to let the DNS/SSL handshake settle
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return api(originalRequest);
      }
    }

    console.error(`[API Error] Request failed for URL: ${error.config?.url}`, {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });

    return Promise.reject(error);
  }
);