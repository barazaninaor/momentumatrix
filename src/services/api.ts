import axios from 'axios';

// Determine the primary URL based on the environment (localhost for development, AWS DuckDNS with port 8000 for production)
const PRIMARY_URL = import.meta.env.DEV 
  ? 'http://localhost:8000' 
  : (import.meta.env.VITE_API_URL || 'https://momentumatrix.duckdns.org:8000');

// Fallback URL in case the primary server is down
const FALLBACK_URL = import.meta.env.VITE_RENDER_API_URL || 'https://momentumatrix.onrender.com';

export const api = axios.create({
  baseURL: PRIMARY_URL,
});

// Response interceptor to handle server downtime and automatically fallback to Render
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a network error (no response) or a server-side error (5xx) and hasn't retried yet
    const isNetworkError = error.code === 'ERR_NETWORK' || !error.response;
    const isServerError = error.response && error.response.status >= 500;

    if ((isNetworkError || isServerError) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Switch baseURL to the Render fallback URL
      originalRequest.baseURL = FALLBACK_URL;
      
      // Clean up URL if it contains the primary base URL to prevent duplication
      if (originalRequest.url && originalRequest.url.startsWith(PRIMARY_URL)) {
        originalRequest.url = originalRequest.url.replace(PRIMARY_URL, '');
      }

      console.warn(`Primary server failed. Switching to Render fallback: ${FALLBACK_URL}`);

      // Retry the request using the fallback server
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);