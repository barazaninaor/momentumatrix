import axios from 'axios';
import type { MonthlyPerformanceRow } from '../types/backtest';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetches the processed monthly performance matrix directly from the backend.
 */
export const fetchBacktestRecords = async (): Promise<MonthlyPerformanceRow[]> => {
  try {
    const response = await axios.get<MonthlyPerformanceRow[]>(`${API_URL}/backtest/performance`);
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
    // Ensure the endpoint matches what is configured in your FastAPI backend (e.g., /analysis or /matrix)
    const response = await axios.get(`${API_URL}/backtest/analysis`);
    return response.data;
  } catch (error) {
    console.error('Error fetching backtest analysis:', error);
    throw error;
  }
};