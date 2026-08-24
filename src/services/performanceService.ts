import axios from 'axios';
import type { PerformanceAnalysisResponse } from '../types/performance';

// Base URL for your FastAPI backend (automatically switches to Render in production)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : 'https://momentumatrix.onrender.com';

/**
 * Fetches the performance matrix and analysis directly from the actual account history performance endpoint.
 */
export const fetchPerformanceAnalysis = async (): Promise<PerformanceAnalysisResponse> => {
  try {
    // Calls the existing endpoint under account-history
    const response = await axios.get<PerformanceAnalysisResponse>(`${API_URL}/account-history/performance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching account performance analysis:', error);
    throw error;
  }
};