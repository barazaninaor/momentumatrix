import type { MonthlyPerformanceRow } from '../types/backtest';
import { api } from './api';

/**
 * Fetches the processed monthly performance matrix directly from the backend.
 */
export const fetchBacktestRecords = async (): Promise<MonthlyPerformanceRow[]> => {
  try {
    const response = await api.get<MonthlyPerformanceRow[]>('/backtest/performance');
    return response.data;
  } catch (error) {
    console.error('Error fetching performance matrix:', error);
    throw error;
  }
};

/**
 * Fetches the full analysis data (metrics, matrix, and chartData) from the backend.
 */
export const fetchBacktestAnalysis = async () => {
  try {
    const response = await api.get('/backtest/analysis');
    return response.data;
  } catch (error) {
    console.error('Error fetching backtest analysis:', error);
    throw error;
  }
};