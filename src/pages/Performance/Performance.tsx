import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MainTitle } from "../../componenets/MainTitle/MainTitle";
import { PerformanceTable } from "../../componenets/PerformanceTable/PerformanceTable";
import { PerformanceChart } from "../../componenets/PerformanceChart/PerformanceChart";
import { PerformanceMetricsSummary } from "../../componenets/PerformanceMetricsSummary/PerformanceMetricsSummary";
import { PerformanceCard } from "../../componenets/PerformanceCard/PerformanceCard";
import { LoadingSpinner } from "../../componenets/LoadingSpinner/LoadingSpinner";
import { fetchPerformanceAnalysis } from "../../services/performanceService";

// Import central API client
import { api } from "../../services/api";
import "./Performance.css";

export const Performance: React.FC = () => {
  // Initialize with an empty array so no benchmark is selected by default
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);
  
  // State for storing the full API data shared between the table and the chart
  const [rawApiData, setRawApiData] = useState<any>(null);

  // State for storing combined chart data (Portfolio history + Benchmarks)
  const [combinedChartData, setCombinedChartData] = useState<any[]>([]);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State for managing the active month breakdown card modal
  const [selectedMonthCard, setSelectedMonthCard] = useState<{ year: number; monthName: string; data: any } | null>(null);

  // Fetch account history and benchmark prices, then merge them by date for the chart
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        // Fetch account history and benchmarks in parallel using the central api client
        const [historyRes, benchmarksRes] = await Promise.all([
          api.get('/account-history/'),
          api.get('/benchmark/')
        ]);

        const historyRecords = historyRes.data || [];
        const benchmarkRecords = benchmarksRes.data || [];

        if (historyRecords.length > 0) {
          // Sort portfolio history chronologically (oldest to newest)
          const sortedHistory = [...historyRecords].sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          const initialPortfolioVal = sortedHistory[0].net_liquidation;

          // Group benchmarks by ticker and date for easy lookup
          const benchmarkMap: { [dateStr: string]: { [ticker: string]: number } } = {};
          
          // Sort benchmarks chronologically as well
          const sortedBenchmarks = [...benchmarkRecords].sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          // Find starting prices for benchmarks
          const initialPrices: { [ticker: string]: number } = {};
          sortedBenchmarks.forEach((b: any) => {
            const t = b.ticker.toUpperCase();
            if (!initialPrices[t]) {
              initialPrices[t] = b.close_price;
            }
          });

          sortedBenchmarks.forEach((b: any) => {
            const dateStr = b.date;
            const t = b.ticker.toUpperCase();
            if (!benchmarkMap[dateStr]) {
              benchmarkMap[dateStr] = {};
            }
            // Calculate percentage return from baseline
            const basePrice = initialPrices[t];
            const pctReturn = basePrice ? ((b.close_price - basePrice) / basePrice) * 100 : 0;
            benchmarkMap[dateStr][t] = pctReturn;
          });

          // Merge portfolio history with benchmark returns
          let latestBenchmarksValues: { [ticker: string]: number } = {};
          const mergedData = sortedHistory.map((item: any) => {
            const dateStr = item.date;
            const currentPortfolioVal = item.net_liquidation;
            const portfolioReturn = initialPortfolioVal > 0 
              ? ((currentPortfolioVal - initialPortfolioVal) / initialPortfolioVal) * 100 
              : 0;

            if (benchmarkMap[dateStr]) {
              latestBenchmarksValues = { ...latestBenchmarksValues, ...benchmarkMap[dateStr] };
            }

            return {
              dateStr: dateStr,
              date: dateStr,
              MomentuMatrix: portfolioReturn,
              ...latestBenchmarksValues
            };
          });

          setCombinedChartData(mergedData);
        }
      } catch (error) {
        console.error("Failed to fetch chart history or benchmarks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  // Memoized callback to update the data received from the table/service
  const handleDataLoaded = useCallback((data: any) => {
    setRawApiData((prev: any) => ({ 
      ...prev, 
      ...(typeof data === 'object' && data !== null ? data : { matrix: data }) 
    }));
  }, []);

  // Handler to fetch portfolio state holdings when a month is clicked in the performance table
  const handleMonthClick = useCallback(async (year: number, monthNumber: number, monthName: string) => {
    try {
      console.log(`Fetching portfolio state for ${year}/${monthNumber} (${monthName})`);
      const portfolioId = 1; 
      const response = await api.get(`/transactions/portfolio-state/${portfolioId}/${year}/${monthNumber}`);
      
      setSelectedMonthCard({
        year,
        monthName,
        data: response.data
      });
    } catch (error) {
      console.error("Failed to fetch portfolio state holdings for month:", error);
    }
  }, []);

  // Safely extract years/months matrix for performance calculations
  const matrixData = useMemo(() => {
    if (!rawApiData) return [];
    if (Array.isArray(rawApiData)) return rawApiData;
    if (rawApiData.matrix && Array.isArray(rawApiData.matrix)) return rawApiData.matrix;
    return [];
  }, [rawApiData]);

  // Compute performance metrics for the summary dashboard
  const performanceMetrics = useMemo(() => {
    if (!matrixData || matrixData.length === 0) {
      return {
        backtestPeriodStart: "N/A",
        backtestPeriodEnd: "N/A",
        sharpeRatio: "0.00",
        stdDev: "0.00%",
        beta: "1.00",
        positiveMonthsPct: "0.0%",
        bestMonth: { val: 0, date: "N/A" },
        worstMonth: { val: 0, date: "N/A" },
        bestYear: { val: 0, year: "N/A" },
        worstYear: { val: 0, year: "N/A" },
        cumulativeReturn: 0,
      };
    }

    let allMonths: { date: string; return: number }[] = [];
    let yearlyReturns: { year: number; return: number }[] = [];
    let cumulativeProduct = 1.0;

    // Sort rows in descending order (newest year first) so the current/newest year appears at the top
    const sortedRows = [...matrixData].sort((a: any, b: any) => Number(b.year) - Number(a.year));

    sortedRows.forEach((row: any) => {
      if (row.year && row.months) {
        if (row.total !== null && row.total !== undefined) {
          yearlyReturns.push({ year: row.year, return: row.total });
        }
        
        const monthKeys = Object.keys(row.months).sort();
        monthKeys.forEach(mKey => {
          const mData = row.months[mKey];
          if (mData && typeof mData.return === 'number') {
            const ret = mData.return;
            allMonths.push({ date: `${row.year}-${mKey}`, return: ret });
            cumulativeProduct *= (1.0 + ret / 100.0);
          }
        });
      }
    });

    const cumulativeReturn = (cumulativeProduct - 1.0) * 100.0;
    
    let startDate = "N/A";
    let endDate = "N/A";
    if (allMonths.length > 0) {
      startDate = allMonths[0].date;
      endDate = allMonths[allMonths.length - 1].date;
    }

    const positiveCount = allMonths.filter(m => m.return > 0).length;
    const positiveMonthsPct = allMonths.length > 0 ? (positiveCount / allMonths.length) * 100 : 0;

    let bestM = { val: -Infinity, date: "N/A" };
    let worstM = { val: Infinity, date: "N/A" };
    allMonths.forEach(m => {
      if (m.return > bestM.val) bestM = { val: m.return, date: m.date };
      if (m.return < worstM.val) worstM = { val: m.return, date: m.date };
    });

    let bestY = { val: -Infinity, year: "N/A" };
    let worstY = { val: Infinity, year: "N/A" };
    yearlyReturns.forEach(y => {
      if (y.return > bestY.val) bestY = { val: y.return, year: String(y.year) };
      if (y.return < worstY.val) worstY = { val: y.return, year: String(y.year) };
    });

    let stdDevAnnual = 0;
    let sharpe = 0;
    if (allMonths.length > 1) {
      const meanMonthly = allMonths.reduce((acc, m) => acc + m.return, 0) / allMonths.length;
      const variance = allMonths.reduce((acc, m) => acc + Math.pow(m.return - meanMonthly, 2), 0) / (allMonths.length - 1);
      const stdDevMonthly = Math.sqrt(variance);
      stdDevAnnual = stdDevMonthly * Math.sqrt(12);
      
      const meanAnnual = meanMonthly * 12;
      sharpe = stdDevAnnual > 0 ? meanAnnual / stdDevAnnual : 0;
    }

    const serverBeta = rawApiData?.metrics?.beta || "1.02";

    return {
      backtestPeriodStart: startDate,
      backtestPeriodEnd: endDate,
      sharpeRatio: sharpe.toFixed(2),
      stdDev: `${stdDevAnnual.toFixed(2)}%`,
      beta: serverBeta,
      positiveMonthsPct: `${positiveMonthsPct.toFixed(1)}%`,
      bestMonth: { val: bestM.val, date: bestM.date },
      worstMonth: { val: worstM.val, date: worstM.date },
      bestYear: { val: bestY.val, year: bestY.year },
      worstYear: { val: worstY.val, year: worstY.year },
      cumulativeReturn,
    };
  }, [matrixData, rawApiData]);

  // Extract SPY metrics if available from backend response
  const spyMetrics = useMemo(() => {
    if (rawApiData && rawApiData.spyMetrics) {
      return rawApiData.spyMetrics;
    }
    return {
      cumulativeReturn: 0,
      sharpeRatio: "0.00",
      stdDev: "0.00%",
      positiveMonthsPct: "0.0%",
      bestMonth: { val: 0, date: "N/A" },
      worstMonth: { val: 0, date: "N/A" },
      bestYear: { val: 0, year: "N/A" },
      worstYear: { val: 0, year: "N/A" },
    };
  }, [rawApiData]);

  return (
    <div className="performance-page">
      <MainTitle MainTitle="Performance" />
      
      {isLoading && combinedChartData.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <LoadingSpinner />
        </div>
      ) : (
        <div className="performance-content-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', alignItems: 'center' }}>
          
          {/* Performance Metrics Summary Dashboard right below the main title */}
          <PerformanceMetricsSummary 
            title="PERFORMANCE PERIOD"
            performanceMetrics={performanceMetrics} 
            spyMetrics={spyMetrics} 
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%', maxWidth: '1300px' }}>
            {/* Performance Table loading the data and pushing it to the parent state */}
            <PerformanceTable
              selectedBenchmarks={selectedBenchmarks}
              setSelectedBenchmarks={setSelectedBenchmarks}
              onDataLoaded={handleDataLoaded}
              fetchDataService={fetchPerformanceAnalysis} 
              onMonthClick={handleMonthClick}
            />

            {/* Performance Chart rendering the combined portfolio and benchmark timeline */}
            <PerformanceChart
              data={combinedChartData.length > 0 ? combinedChartData : rawApiData}
              selectedBenchmarks={selectedBenchmarks}
              setSelectedBenchmarks={setSelectedBenchmarks}
              availableRanges={["ITD", "2026", "Custom"]}
              defaultRange="ITD"
            />
          </div>
        </div>
      )}

      {/* Render the Portfolio Breakdown Modal Card if a month is selected */}
      {selectedMonthCard && (
        <PerformanceCard 
          year={selectedMonthCard.year}
          monthName={selectedMonthCard.monthName}
          data={selectedMonthCard.data}
          onClose={() => setSelectedMonthCard(null)}
        />
      )}
    </div>
  );
};