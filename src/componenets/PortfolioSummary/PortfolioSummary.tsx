import React from "react";
import "./PortfolioSummary.css";

interface PortfolioSummaryProps {
  initialInvestment: number;
  accountValue: number;
  cashBalance: number;
  mtdPnl: number;
  mtdChange: number;
  ytdPnl: number;
  ytdChange: number;
  itdPnl: number;
  itdChange: number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  initialInvestment,
  accountValue,
  cashBalance,
  mtdPnl,
  mtdChange,
  ytdPnl,
  ytdChange,
  itdPnl,
  itdChange,
}) => {
  return (
    <div className="portfolio-summary">
      <div className="summary-card">
        <span className="summary-title">INITIAL INVESTMENT</span>
        <span className="summary-value">
          ${initialInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="summary-card">
        <span className="summary-title">ACCOUNT VALUE</span>
        <span className="summary-value">
          ${accountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="summary-card">
        <span className="summary-title">CASH</span>
        <span className="summary-value">
          ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="summary-card">
        <span className="summary-title">MTD</span>
        <span className={`summary-value ${mtdPnl >= 0 ? "positive" : "negative"}`}>
          {mtdPnl < 0
            ? `-$${Math.abs(mtdPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `$${mtdPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </span>
        <span className={`summary-sub ${mtdChange >= 0 ? "positive" : "negative"}`}>
          {mtdChange > 0 ? `+${mtdChange.toFixed(2)}%` : `${mtdChange.toFixed(2)}%`}
        </span>
      </div>
      <div className="summary-card">
        <span className="summary-title">YTD</span>
        <span className={`summary-value ${ytdPnl >= 0 ? "positive" : "negative"}`}>
          {ytdPnl < 0
            ? `-$${Math.abs(ytdPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `$${ytdPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </span>
        <span className={`summary-sub ${ytdChange >= 0 ? "positive" : "negative"}`}>
          {ytdChange > 0 ? `+${ytdChange.toFixed(2)}%` : `${ytdChange.toFixed(2)}%`}
        </span>
      </div>
      <div className="summary-card">
        <span className="summary-title">ITD</span>
        <span className={`summary-value ${itdPnl >= 0 ? "positive" : "negative"}`}>
          {itdPnl < 0
            ? `-$${Math.abs(itdPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `$${itdPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </span>
        <span className={`summary-sub ${itdChange >= 0 ? "positive" : "negative"}`}>
          {itdChange > 0 ? `+${itdChange.toFixed(2)}%` : `${itdChange.toFixed(2)}%`}
        </span>
      </div>
    </div>
  );
};