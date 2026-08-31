import axios from 'axios';

const API_URL = import.meta.env.VITE_RENDER_API_URL || 'https://momentumatrix.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds to safely handle Render cold starts
});

// A simple response interceptor just in case Render is completely down
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);