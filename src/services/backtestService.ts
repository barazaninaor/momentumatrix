import axios from 'axios';
import type { MonthlyPerformanceRow } from '../types/backtest';

const API_URL = 'http://localhost:8000/backtest';

/**
 * Fetches the processed monthly performance matrix directly from the backend.
 */
export const fetchBacktestRecords = async (): Promise<MonthlyPerformanceRow[]> => {
  try {
    const response = await axios.get<MonthlyPerformanceRow[]>(`${API_URL}/performance`);
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
    // ודא שהנתיב תואם למה שמוגדר ב-FastAPI שלך (למשל /analysis או /matrix)
    const response = await axios.get(`${API_URL}/analysis`);
    return response.data;
  } catch (error) {
    console.error('Error fetching backtest analysis:', error);
    throw error;
  }
};