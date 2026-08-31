import axios from 'axios';

// Primary and Fallback API URLs
const PRIMARY_URL = import.meta.env.VITE_API_URL || 'https://momentumatrix.duckdns.org';
const FALLBACK_URL = import.meta.env.VITE_RENDER_API_URL || 'https://momentumatrix.onrender.com';

// State variables to manage fallback and periodic re-checks
let isUsingFallback = false;
let lastPrimaryCheckTime = 0;
const CHECK_INTERVAL = 5 * 60 * 1000; // Try primary again every 5 minutes

export const api = axios.create({
  baseURL: PRIMARY_URL,
  timeout: 3000,
});

// Request interceptor to decide whether to try primary or go straight to fallback
api.interceptors.request.use(
  (config) => {
    const now = Date.now();
    
    // If we are using fallback, but enough time has passed, give Primary (AWS) another chance
    if (isUsingFallback && (now - lastPrimaryCheckTime > CHECK_INTERVAL)) {
      isUsingFallback = false; // Reset flag to test primary
      lastPrimaryCheckTime = now;
    }

    if (isUsingFallback) {
      config.baseURL = FALLBACK_URL;
    } else {
      config.baseURL = PRIMARY_URL;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle server downtime and fallback automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isNetworkError = error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED' || !error.response;
    const isServerError = error.response && error.response.status >= 500;

    if ((isNetworkError || isServerError) && !originalRequest._retry && !isUsingFallback) {
      originalRequest._retry = true;
      isUsingFallback = true;
      lastPrimaryCheckTime = Date.now(); // Mark the time we switched
      
      originalRequest.baseURL = FALLBACK_URL;
      originalRequest.timeout = 60000; 
      
      if (originalRequest.url && originalRequest.url.startsWith(PRIMARY_URL)) {
        originalRequest.url = originalRequest.url.replace(PRIMARY_URL, '');
      }

      console.warn(`Primary server failed. Switching to Render fallback: ${FALLBACK_URL}`);

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);