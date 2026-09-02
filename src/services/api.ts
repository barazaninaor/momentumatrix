import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Hardcoded primary production URL pointing directly to the AWS server via DuckDNS
const PRIMARY_URL = 'https://momentumatrix.duckdns.org';
// const FALLBACK_URL = import.meta.env.VITE_RENDER_API_URL || 'https://momentumatrix.onrender.com';

// Read initial fallback state from localStorage so it persists across page loads and new tabs
// let isUsingFallback = localStorage.getItem('isUsingFallback') === 'true';
// let lastPrimaryCheckTime = parseInt(localStorage.getItem('lastPrimaryCheckTime') || '0', 10);
// const CHECK_INTERVAL = 5 * 60 * 1000; // Try primary again every 5 minutes

export const api = axios.create({
  baseURL: PRIMARY_URL, // isUsingFallback ? FALLBACK_URL : PRIMARY_URL,
  timeout: 10000, // isUsingFallback ? 30000 : 10000, // Longer timeout for Render, 10s for AWS try
});

// Request interceptor to handle URL and timeout adjustments dynamically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // const now = Date.now();
    
    // If using fallback, check if interval has passed to retry primary (AWS)
    // if (isUsingFallback && (now - lastPrimaryCheckTime > CHECK_INTERVAL)) {
    //   isUsingFallback = false;
    //   localStorage.setItem('isUsingFallback', 'false');
    //   lastPrimaryCheckTime = now;
    //   localStorage.setItem('lastPrimaryCheckTime', now.toString());
    // }

    // config.baseURL = isUsingFallback ? FALLBACK_URL : PRIMARY_URL;
    // config.timeout = isUsingFallback ? 30000 : 10000;
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to fall back to Render automatically if AWS fails
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // const isNetworkError = error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED' || !error.response;
    // const isServerError = error.response && error.response.status >= 500;

    // if ((isNetworkError || isServerError) && originalRequest && !originalRequest._retry && !isUsingFallback) {
    //   originalRequest._retry = true;
    //   isUsingFallback = true;
    //   localStorage.setItem('isUsingFallback', 'true');
    //   
    //   const now = Date.now();
    //   lastPrimaryCheckTime = now;
    //   localStorage.setItem('lastPrimaryCheckTime', now.toString());
    //   
    //   originalRequest.baseURL = FALLBACK_URL;
    //   originalRequest.timeout = 30000;
    //   
    //   if (originalRequest.url && originalRequest.url.startsWith(PRIMARY_URL)) {
    //     originalRequest.url = originalRequest.url.replace(PRIMARY_URL, '');
    //   }

    //   console.warn(`Primary server failed. Switching to Render fallback: ${FALLBACK_URL}`);

    //   return api(originalRequest);
    // }

    console.error(`[API Error] Request failed for URL: ${error.config?.url}`, {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });

    return Promise.reject(error);
  }
);