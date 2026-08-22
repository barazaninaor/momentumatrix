// Performance data structure for individual month details
export interface MonthPerformanceInfo {
  return: number | null;
  benchmarks?: {
    SPY?: number;
    QQQ?: number;
    DIA?: number;
    [key: string]: number | undefined;
  };
  [key: string]: any;
}

// Yearly row structure for the performance table
export interface MonthlyPerformanceRow {
  year: number;
  months: {
    [key: string]: MonthPerformanceInfo | null;
  };
  total: number | null;
}

// Wrapper interface for the full analysis response
export interface PerformanceAnalysisResponse {
  matrix: MonthlyPerformanceRow[];
  metrics?: any;
  timeSeries?: any[];
}