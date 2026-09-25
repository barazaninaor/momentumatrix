import React from "react";
import "./DailyPerformanceTab.css";

interface DailyItem {
  date: string;
  net_liquidation: number;
  dailyReturn?: number;
  mtdReturn?: number;
  ytdReturn?: number;
  itdReturn?: number;
  [key: string]: any;
}

interface DailyPerformanceTabProps {
  dailyData: DailyItem[];
  ytdReturn?: number;
  itdReturn?: number;
}

export const DailyPerformanceTab: React.FC<DailyPerformanceTabProps> = ({
  dailyData,
  ytdReturn = 0,
  itdReturn = 0,
}) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="daily-empty-state">
        No daily data available for this month.
      </div>
    );
  }

  // Sort daily data chronologically (oldest to newest) to calculate compound/MTD correctly
  const sortedData = [...dailyData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const firstItem = sortedData[0];
  const lastItem = sortedData[sortedData.length - 1];

  const latestDailyReturn =
    lastItem.dailyReturn !== undefined ? lastItem.dailyReturn : 0;

  // Calculate MTD for the month using the first day of the month as the base
  const mtdReturn =
    lastItem.mtdReturn !== undefined
      ? lastItem.mtdReturn
      : firstItem.net_liquidation > 0
        ? ((lastItem.net_liquidation - firstItem.net_liquidation) /
            firstItem.net_liquidation) *
          100
        : 0;

  const currentYtd =
    lastItem.ytdReturn !== undefined ? lastItem.ytdReturn : ytdReturn;
  const currentItd =
    lastItem.itdReturn !== undefined ? lastItem.itdReturn : itdReturn;

  // Prepare table data with row-specific calculations (newest dates at the top)
  const tableDataWithMetrics = sortedData.map((dayItem, index) => {
    let dailyRet = dayItem.dailyReturn;
    if (dailyRet === undefined) {
      const prevVal =
        index > 0
          ? sortedData[index - 1].net_liquidation
          : dayItem.net_liquidation;
      dailyRet =
        prevVal > 0 ? ((dayItem.net_liquidation - prevVal) / prevVal) * 100 : 0;
    }

    // Calculate rolling MTD up to this specific day in the month
    let rowMtd = dayItem.mtdReturn;
    if (rowMtd === undefined) {
      rowMtd =
        firstItem.net_liquidation > 0
          ? ((dayItem.net_liquidation - firstItem.net_liquidation) /
              firstItem.net_liquidation) *
            100
          : 0;
    }

    const rowYtd =
      dayItem.ytdReturn !== undefined ? dayItem.ytdReturn : currentYtd;
    const rowItd =
      dayItem.itdReturn !== undefined ? dayItem.itdReturn : currentItd;

    return {
      ...dayItem,
      calculatedDailyReturn: dailyRet,
      calculatedMtd: rowMtd,
      calculatedYtd: rowYtd,
      calculatedItd: rowItd,
    };
  });

  const tableData = [...tableDataWithMetrics].reverse();

  return (
    <div className="daily-performance-wrapper">
      {/* Summary Cards (Daily, MTD, YTD, ITD) */}
      <div className="daily-summary-cards">
        <div className="summary-card">
          <span className="summary-label">Daily Return</span>
          <span
            className={`summary-value ${latestDailyReturn >= 0 ? "positive" : "negative"}`}
          >
            {latestDailyReturn >= 0 ? "+" : ""}
            {latestDailyReturn.toFixed(2)}%
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">MTD Return</span>
          <span
            className={`summary-value ${mtdReturn >= 0 ? "positive" : "negative"}`}
          >
            {mtdReturn >= 0 ? "+" : ""}
            {mtdReturn.toFixed(2)}%
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">YTD Return</span>
          <span
            className={`summary-value ${currentYtd >= 0 ? "positive" : "negative"}`}
          >
            {currentYtd >= 0 ? "+" : ""}
            {currentYtd.toFixed(2)}%
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">ITD Return</span>
          <span
            className={`summary-value ${currentItd >= 0 ? "positive" : "negative"}`}
          >
            {currentItd >= 0 ? "+" : ""}
            {currentItd.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Detailed Table with row-specific values */}
      <div className="daily-table-container">
        <table className="daily-returns-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Portfolio Value</th>
              <th>Daily Return</th>
              <th>MTD Return</th>
              <th>YTD Return</th>
              <th>ITD Return</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date}</td>
                <td>
                  $
                  {row.net_liquidation?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td
                  className={
                    row.calculatedDailyReturn >= 0 ? "positive" : "negative"
                  }
                >
                  {row.calculatedDailyReturn >= 0 ? "+" : ""}
                  {row.calculatedDailyReturn.toFixed(2)}%
                </td>
                <td
                  className={row.calculatedMtd >= 0 ? "positive" : "negative"}
                >
                  {row.calculatedMtd >= 0 ? "+" : ""}
                  {row.calculatedMtd.toFixed(2)}%
                </td>
                <td
                  className={row.calculatedYtd >= 0 ? "positive" : "negative"}
                >
                  {row.calculatedYtd >= 0 ? "+" : ""}
                  {row.calculatedYtd.toFixed(2)}%
                </td>
                <td
                  className={row.calculatedItd >= 0 ? "positive" : "negative"}
                >
                  {row.calculatedItd >= 0 ? "+" : ""}
                  {row.calculatedItd.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * TODO:
 * 1. Synchronize daily performance state and metrics with the backend server API.
 * 2. Refactor/modularize the daily summary view into a reusable Card component for cleaner UI layout.
 */
