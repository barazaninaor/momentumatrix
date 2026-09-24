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

  // Sort daily data chronologically if needed, or assume sorted.
  // Let's ensure newest first or oldest first based on your preference (here we keep standard or sort ascending for cumulative calculations).
  const sortedData = [...dailyData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // For the summary cards at the top, we want the latest available item (last in chronological order)
  const lastItem = sortedData[sortedData.length - 1];
  const firstItem = sortedData[0];

  const latestDailyReturn =
    lastItem.dailyReturn !== undefined ? lastItem.dailyReturn : 0;

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

  // For display in the table, users usually like to see newest dates at the top
  const tableData = [...sortedData].reverse();

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
          </span>{" "}
          ביצועי היום האחרון
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
            {tableData.map((dayItem, idx) => {
              // Calculate daily return for the specific row if missing
              let dailyRet = dayItem.dailyReturn;
              if (dailyRet === undefined) {
                // Find index in chronological array to get the actual previous day
                const chronoIndex = sortedData.findIndex(
                  (d) => d.date === dayItem.date,
                );
                const prevVal =
                  chronoIndex > 0
                    ? sortedData[chronoIndex - 1].net_liquidation
                    : dayItem.net_liquidation;
                dailyRet =
                  prevVal > 0
                    ? ((dayItem.net_liquidation - prevVal) / prevVal) * 100
                    : 0;
              }

              // Use row-specific metrics if provided by the backend, otherwise fall back gracefully
              const rowMtd =
                dayItem.mtdReturn !== undefined ? dayItem.mtdReturn : 0;
              const rowYtd =
                dayItem.ytdReturn !== undefined
                  ? dayItem.ytdReturn
                  : currentYtd;
              const rowItd =
                dayItem.itdReturn !== undefined
                  ? dayItem.itdReturn
                  : currentItd;

              return (
                <tr key={idx}>
                  <td>{dayItem.date}</td>
                  <td>
                    $
                    {dayItem.net_liquidation?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className={dailyRet >= 0 ? "positive" : "negative"}>
                    {dailyRet >= 0 ? "+" : ""}
                    {dailyRet.toFixed(2)}%
                  </td>
                  <td className={rowMtd >= 0 ? "positive" : "negative"}>
                    {rowMtd >= 0 ? "+" : ""}
                    {rowMtd.toFixed(2)}%
                  </td>
                  <td className={rowYtd >= 0 ? "positive" : "negative"}>
                    {rowYtd >= 0 ? "+" : ""}
                    {rowYtd.toFixed(2)}%
                  </td>
                  <td className={rowItd >= 0 ? "positive" : "negative"}>
                    {rowItd >= 0 ? "+" : ""}
                    {rowItd.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
