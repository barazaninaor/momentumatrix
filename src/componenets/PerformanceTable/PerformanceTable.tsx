import React, { useEffect, useState, useCallback } from 'react';
import { fetchBacktestRecords } from '../../services/backtestService'; 
import { type MonthlyPerformanceRow, type MonthPerformanceInfo } from '../../types/backtest';

import './PerformanceTable.css';
import { PerformanceCard } from '../PerformanceCard/PerformanceCard';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BENCHMARK_OPTIONS = [
  { label: 'SPY (S&P 500)', value: 'SPY' },
  { label: 'QQQ (Nasdaq 100)', value: 'QQQ' },
  { label: 'DIA (Dow Jones 30)', value: 'DIA' }
];

interface PerformanceTableProps {
  selectedBenchmarks: string[];
  setSelectedBenchmarks: React.Dispatch<React.SetStateAction<string[]>>;
  onDataLoaded?: (data: any) => void;
  fetchDataService?: () => Promise<any>; 
  className?: string;
  onMonthClick?: (year: number, monthNumber: number, monthName: string) => void;
  showNote?: boolean; // פרופ אופציונלי להצגת ההערה
}

export const PerformanceTable: React.FC<PerformanceTableProps> = ({
  selectedBenchmarks,
  setSelectedBenchmarks,
  onDataLoaded,
  fetchDataService,
  className = '',
  onMonthClick,
  showNote = false
}) => {
  const [rows, setRows] = useState<MonthlyPerformanceRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonthData, setSelectedMonthData] = useState<{
    year: number;
    monthName: string;
    data: MonthPerformanceInfo;
  } | null>(null);

  const generateChartTimeSeries = useCallback((matrixRows: MonthlyPerformanceRow[]) => {
    const sortedRows = [...matrixRows].sort((a, b) => a.year - b.year);
    const timeSeries: any[] = [];
    
    let cumMomentum = 1.0;
    let cumSPY = 1.0;
    let cumQQQ = 1.0;
    let cumDIA = 1.0;

    sortedRows.forEach((row) => {
      ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].forEach((mKey, idx) => {
        const mInfo = row.months ? row.months[mKey] : null;
        if (mInfo && mInfo.return !== null && mInfo.return !== undefined) {
          cumMomentum *= (1.0 + mInfo.return / 100.0);

          if (mInfo.benchmarks) {
            if (mInfo.benchmarks.SPY !== undefined) cumSPY *= (1.0 + mInfo.benchmarks.SPY / 100.0);
            if (mInfo.benchmarks.QQQ !== undefined) cumQQQ *= (1.0 + mInfo.benchmarks.QQQ / 100.0);
            if (mInfo.benchmarks.DIA !== undefined) cumDIA *= (1.0 + mInfo.benchmarks.DIA / 100.0);
          }

          const dateStr = `${row.year}-${mKey}-01`;
          const displayDate = `${MONTH_NAMES[idx]} ${row.year}`;

          timeSeries.push({
            dateStr: dateStr,
            date: displayDate,
            MomentuMatrix: Number(((cumMomentum - 1.0) * 100.0).toFixed(2)),
            SPY: Number(((cumSPY - 1.0) * 100.0).toFixed(2)),
            QQQ: Number(((cumQQQ - 1.0) * 100.0).toFixed(2)),
            DIA: Number(((cumDIA - 1.0) * 100.0).toFixed(2)),
          });
        }
      });
    });

    return timeSeries;
  }, []);

  useEffect(() => {
    const serviceToUse = fetchDataService || fetchBacktestRecords;

    serviceToUse()
      .then((response: any) => {
        let matrixData: MonthlyPerformanceRow[] = [];
        if (Array.isArray(response)) {
          matrixData = response;
        } else if (response && typeof response === 'object') {
          matrixData = response.matrix || response.matrixRows || response.rows || response.data || [];
        }

        setRows(matrixData);

        let chartTimeSeries = response?.chartData || response?.timeSeries || response?.chartTimeSeriesData;
        if (!chartTimeSeries || !Array.isArray(chartTimeSeries) || chartTimeSeries.length === 0) {
          chartTimeSeries = generateChartTimeSeries(matrixData);
        }

        if (onDataLoaded) {
          onDataLoaded({
            matrix: matrixData,
            metrics: response?.metrics || null,
            timeSeries: chartTimeSeries
          });
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load performance matrix data', err);
        setLoading(false);
      });
  }, [fetchDataService, generateChartTimeSeries, onDataLoaded]);

  const handleCheckboxChange = (value: string) => {
    if (selectedBenchmarks.includes(value)) {
      setSelectedBenchmarks(selectedBenchmarks.filter((b) => b !== value));
    } else {
      setSelectedBenchmarks([...selectedBenchmarks, value]);
    }
  };

  if (loading) {
    return (
      <div className={`performance-table-container loading-container ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`performance-table-container ${className}`}>
      <div className="performance-table-header">Performance Breakdown</div>

      {/* ההערה תופיע אך ורק אם showNote מוגדר כ-true */}
      {showNote && (
        <p className="performance-subtitle-note">
          * Note: Table returns include cash and capital flows, so numbers may differ from the pure stock-price breakdown shown when clicking a month.
        </p>
      )}

      <div className="benchmark-toolbar">
        <span className="benchmark-label">Compare ETFs:</span>
        <div className="benchmark-checkboxes">
          {BENCHMARK_OPTIONS.map((opt) => (
            <label key={opt.value} className="benchmark-checkbox-label">
              <input
                type="checkbox"
                value={opt.value}
                checked={selectedBenchmarks.includes(opt.value)}
                onChange={() => handleCheckboxChange(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="performance-table-wrapper">
        <table className="fund-table">
          <thead>
            <tr>
              <th>Year</th>
              {MONTH_NAMES.map((monthName, idx) => (
                <th key={idx}>{monthName}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              return (
                <React.Fragment key={row.year}>
                  <tr className="portfolio-row">
                    <td className="year-cell">{row.year}</td>
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((mKey, index) => {
                      const mInfo = row.months ? row.months[mKey] : null;
                      const val = mInfo ? mInfo.return : null;
                      return (
                        <td 
                          key={index} 
                          className={`clickable-cell ${val !== null && val !== undefined ? (val >= 0 ? 'positive' : 'negative') : ''}`}
                          onClick={() => {
                            if (mInfo) {
                              const monthNumber = index + 1;
                              if (onMonthClick) {
                                onMonthClick(row.year, monthNumber, MONTH_NAMES[index]);
                              } else {
                                setSelectedMonthData({
                                  year: row.year,
                                  monthName: MONTH_NAMES[index],
                                  data: mInfo
                                });
                              }
                            }
                          }}
                        >
                          {val !== null && val !== undefined ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : ''}
                        </td>
                      );
                    })}
                    <td className="total-cell">
                      {row.total !== null && row.total !== undefined ? `${row.total > 0 ? '+' : ''}${row.total.toFixed(2)}%` : '-'}
                    </td>
                  </tr>

                  {selectedBenchmarks.map((benchValue) => {
                    let benchYearlyCumulative = 1.0;
                    let benchHasAnyMonth = false;
                    const benchLabel = BENCHMARK_OPTIONS.find(b => b.value === benchValue)?.label || benchValue;

                    return (
                      <tr key={benchValue} className="benchmark-row">
                        <td className="year-cell benchmark-year-cell">
                          {benchLabel}
                        </td>
                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((mKey, index) => {
                          const mInfo = row.months ? row.months[mKey] : null;
                          const benchVal = mInfo && mInfo.benchmarks ? mInfo.benchmarks[benchValue] : undefined;
                          
                          if (benchVal !== undefined && benchVal !== null) {
                            benchYearlyCumulative *= (1.0 + benchVal / 100.0);
                            benchHasAnyMonth = true;
                          }

                          return (
                            <td 
                              key={index} 
                              className={benchVal !== undefined && benchVal !== null ? (benchVal >= 0 ? 'positive' : 'negative') : ''}
                            >
                              {benchVal !== undefined && benchVal !== null ? `${benchVal > 0 ? '+' : ''}${benchVal.toFixed(2)}%` : ''}
                            </td>
                          );
                        })}
                        <td className="total-cell">
                          {(() => {
                            const totalBenchReturn = benchHasAnyMonth ? (benchYearlyCumulative - 1.0) * 100.0 : null;
                            return totalBenchReturn !== null ? `${totalBenchReturn > 0 ? '+' : ''}${totalBenchReturn.toFixed(2)}%` : '-';
                          })()}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedMonthData && !onMonthClick && (
        <PerformanceCard
          year={selectedMonthData.year}
          monthName={selectedMonthData.monthName}
          data={selectedMonthData.data}
          onClose={() => setSelectedMonthData(null)}
        />
      )}
    </div>
  );
};