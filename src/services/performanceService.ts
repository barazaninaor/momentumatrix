import type { PerformanceAnalysisResponse } from '../types/performance';
import { api } from './api';

/**
 * Fetches the performance matrix and analysis directly from the actual account history performance endpoint.
 */
export const fetchPerformanceAnalysis = async (): Promise<PerformanceAnalysisResponse> => {
  try {
    // Calls the existing endpoint under account-history using the central api instance
    const response = await api.get<PerformanceAnalysisResponse>('/account-history/performance');
    return response.data;
  } catch (error) {
    console.error('Error fetching account performance analysis:', error);
    throw error;
  }
};