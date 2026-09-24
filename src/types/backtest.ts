export interface StockDetail {
  ticker: string;
  price: number;
  return: number;
  weight: number;
}

export interface MonthPerformanceInfo {
  return: number;
  stocks: StockDetail[];
  benchmarks: Record<string, number>; // תמיכה בנתוני הבנצ'מרקים החודשיים
}

export interface MonthlyPerformanceRow {
  year: number;
  months: { [monthKey: string]: MonthPerformanceInfo | null };
  total: number | null;
}