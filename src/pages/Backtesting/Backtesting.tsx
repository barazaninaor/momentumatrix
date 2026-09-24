import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MainTitle } from "../../componenets/MainTitle/MainTitle";
import { LoadingSpinner } from "../../componenets/LoadingSpinner/LoadingSpinner";
import { PerformanceTable } from '../../componenets/PerformanceTable/PerformanceTable';
import { PerformanceChart } from '../../componenets/PerformanceChart/PerformanceChart';
import { PerformanceMetricsSummary } from '../../componenets/PerformanceMetricsSummary/PerformanceMetricsSummary';

// Import central API client
import { api } from '../../services/api';

import "./Backtesting.css";

export const Backtesting: React.FC = () => {
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);
  const [rawApiData, setRawApiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch backtest data from the server using the central api client once on component mount
  useEffect(() => {
    const fetchBacktestData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/backtest/analysis');
        
        console.log("Backtest data loaded successfully:", response.data);
        setRawApiData((prev: any) => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error("Failed to fetch backtest performance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBacktestData();
  }, []);

  // Wrap update function in useCallback to prevent renders and infinite loops
  const handleDataLoaded = useCallback((data: any) => {
    setRawApiData((prev: any) => ({ 
      ...prev, 
      ...(typeof data === 'object' && data !== null ? data : { matrix: data }) 
    }));
  }, []);

  // Safely extract years/months matrix for the performance table
  const matrixData = useMemo(() => {
    if (!rawApiData) return [];
    if (Array.isArray(rawApiData)) return rawApiData;
    if (rawApiData.matrix && Array.isArray(rawApiData.matrix)) return rawApiData.matrix;
    return [];
  }, [rawApiData]);

  // Safely extract time points for the chart from the server response
  const chartPointsData = useMemo(() => {
    if (!rawApiData) return [];
    if (rawApiData.chartData && Array.isArray(rawApiData.chartData)) return rawApiData.chartData;
    if (rawApiData.timeSeries && Array.isArray(rawApiData.timeSeries)) return rawApiData.timeSeries;
    if (Array.isArray(rawApiData)) return rawApiData;
    return [];
  }, [rawApiData]);

  const availableYears = useMemo(() => {
    if (!matrixData || matrixData.length === 0) return ["ITD", "Custom"];
    
    const yearsSet = new Set<string>();
    matrixData.forEach((item: any) => {
      if (item.dateStr) {
        const year = item.dateStr.substring(0, 4);
        if (/^\d{4}$/.test(year)) {
          yearsSet.add(year);
        }
      } else if (item.year) {
        yearsSet.add(String(item.year));
      }
    });

    const sortedYears = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));
    return ["ITD", ...sortedYears, "Custom"];
  }, [matrixData]);

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

    const sortedRows = [...matrixData].sort((a: any, b: any) => Number(a.year) - Number(b.year));

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

  // Fetch standalone SPY metrics from backend
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

  if (isLoading) {
    return (
      <div className="backtesting-page">
        <MainTitle MainTitle="Backtesting" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="backtesting-page">
      <MainTitle MainTitle="Backtesting" />

      {/* Reusable performance metrics summary component */}
      <PerformanceMetricsSummary 
        performanceMetrics={performanceMetrics} 
        spyMetrics={spyMetrics} 
      />

      <div className="backtesting-content">
        <PerformanceTable 
          selectedBenchmarks={selectedBenchmarks}
          setSelectedBenchmarks={setSelectedBenchmarks}
          onDataLoaded={handleDataLoaded}
          className="backtest-table-width"
        />
        
        <PerformanceChart 
          data={chartPointsData}
          selectedBenchmarks={selectedBenchmarks}
          setSelectedBenchmarks={setSelectedBenchmarks}
          title="MomentuMatrix vs Selected Benchmarks" 
          availableRanges={availableYears}
          defaultRange="ITD"
        />
      </div>
    </div>
  );
};