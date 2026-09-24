import React from 'react';
import './PerformanceMetricsSummary.css';

interface PerformanceMetricsSummaryProps {
  title?: string; // הוספת prop אופציונלי לכותרת, עם ברירת מחדל
  performanceMetrics: {
    backtestPeriodStart: string;
    backtestPeriodEnd: string;
    sharpeRatio: string;
    stdDev: string;
    beta: string;
    positiveMonthsPct: string;
    bestMonth: { val: number; date: string };
    worstMonth: { val: number; date: string };
    bestYear: { val: number; year: string };
    worstYear: { val: number; year: string };
    cumulativeReturn: number;
  };
  spyMetrics: {
    cumulativeReturn: number;
    sharpeRatio: string;
    stdDev: string;
    positiveMonthsPct: string;
    bestMonth?: { val: number; date: string };
    worstMonth?: { val: number; date: string };
    bestYear?: { val: number; year: string };
    worstYear?: { val: number; year: string };
  };
}

export const PerformanceMetricsSummary: React.FC<PerformanceMetricsSummaryProps> = ({
  title = "BACKTEST PERIOD", // ברירת מחדל כדי לא לפגוע במקומות אחרים
  performanceMetrics,
  spyMetrics,
}) => {
  return (
    <div className="backtesting-summary-container">
      {/* Period metric item */}
      <div className="metric-item">
        <div className="metric-label">{title}</div>
        <div className="metric-value">
          <div>
            <span style={{ color: '#888', fontSize: '0.7em', marginRight: '6px' }}>START:</span>
            {performanceMetrics.backtestPeriodStart}
          </div>
          <div style={{ marginTop: '4px' }}>
            <span style={{ color: '#888', fontSize: '0.7em', marginRight: '16px' }}>END:</span>
            {performanceMetrics.backtestPeriodEnd}
          </div>
        </div>
      </div>

      {/* Cumulative Return metric item */}
      <div className="metric-item">
        <div className="metric-label">CUMULATIVE RETURN</div>
        <div className={`metric-value ${performanceMetrics.cumulativeReturn >= 0 ? 'positive' : 'negative'}`}>
          {performanceMetrics.cumulativeReturn >= 0 
            ? `+${performanceMetrics.cumulativeReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` 
            : `${performanceMetrics.cumulativeReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
        </div>
        <div className={`metric-subtext ${spyMetrics.cumulativeReturn >= 0 ? 'positive' : 'negative'}`} style={{ color: '#888', fontSize: '0.85em', marginTop: '2px' }}>
          SPY: {spyMetrics.cumulativeReturn >= 0 
            ? `+${spyMetrics.cumulativeReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` 
            : `${spyMetrics.cumulativeReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
        </div>
      </div>

      {/* Sharpe Ratio metric item */}
      <div className="metric-item">
        <div className="metric-label">SHARPE RATIO</div>
        <div className="metric-value">{performanceMetrics.sharpeRatio}</div>
        <div className="metric-subtext" style={{ color: '#888', fontSize: '0.85em', marginTop: '2px' }}>
          SPY: {spyMetrics.sharpeRatio}
        </div>
      </div>

      {/* Annualized Standard Deviation metric item */}
      <div className="metric-item">
        <div className="metric-label">ANNUALIZED STD DEV</div>
        <div className="metric-value">{performanceMetrics.stdDev}</div>
        <div className="metric-subtext" style={{ color: '#888', fontSize: '0.85em', marginTop: '2px' }}>
          SPY: {spyMetrics.stdDev}
        </div>
      </div>

      {/* Beta metric item */}
      <div className="metric-item">
        <div className="metric-label">BETA</div>
        <div className="metric-value">{performanceMetrics.beta}</div>
        <div className="metric-subtext">SPY: 1</div>
      </div>

      {/* Positive Months percentage metric item */}
      <div className="metric-item">
        <div className="metric-label">POSITIVE MONTHS</div>
        <div className="metric-value">{performanceMetrics.positiveMonthsPct}</div>
        <div className="metric-subtext" style={{ color: '#888', fontSize: '0.85em', marginTop: '2px' }}>
          SPY: {spyMetrics.positiveMonthsPct}
        </div>
      </div>

      {/* Best Month metric item */}
      <div className="metric-item">
        <div className="metric-label">BEST MONTH</div>
        <div className="metric-value">
          {performanceMetrics.bestMonth.val > -Infinity ? (
            <>
              <span className="positive">
                {performanceMetrics.bestMonth.val >= 0 ? '+' : ''}{performanceMetrics.bestMonth.val.toFixed(2)}%
              </span>
              <span style={{ color: '#ffffff' }}> ({performanceMetrics.bestMonth.date})</span>
            </>
          ) : 'N/A'}
        </div>
        <div className="metric-subtext" style={{ color: '#888', fontSize: '0.85em', marginTop: '4px' }}>
          SPY: {spyMetrics.bestMonth?.val !== undefined ? `${spyMetrics.bestMonth.val >= 0 ? '+' : ''}${spyMetrics.bestMonth.val.toFixed(2)}%` : 'N/A'} ({spyMetrics.bestMonth?.date || 'N/A'})
        </div>
      </div>

      {/* Worst Month metric item */}
      <div className="metric-item">
        <div className="metric-label">WORST MONTH</div>
        <div className="metric-value">
          {performanceMetrics.worstMonth.val < Infinity ? (
            <>
              <span className="negative">
                {performanceMetrics.worstMonth.val >= 0 ? '+' : ''}{performanceMetrics.worstMonth.val.toFixed(2)}%
              </span>
              <span style={{ color: '#ffffff' }}> ({performanceMetrics.worstMonth.date})</span>
            </>
          ) : 'N/A'}
        </div>
        <div className="metric-subtext" style={{ color: '#888', fontSize: '0.85em', marginTop: '4px' }}>
          SPY: {spyMetrics.worstMonth?.val !== undefined ? `${spyMetrics.worstMonth.val >= 0 ? '+' : ''}${spyMetrics.worstMonth.val.toFixed(2)}%` : 'N/A'} ({spyMetrics.worstMonth?.date || 'N/A'})
        </div>
      </div>

      {/* Best Year metric item */}
      <div className="metric-item">
        <div className="metric-label">BEST YEAR</div>
        <div className="metric-value">
          {performanceMetrics.bestYear.val > -Infinity ? (
            <>
              <span className="positive">
                {performanceMetrics.bestYear.val >= 0 ? '+' : ''}{performanceMetrics.bestYear.val.toFixed(2)}%
              </span>
              <span style={{ color: '#ffffff' }}> ({performanceMetrics.bestYear.year})</span>
            </>
          ) : 'N/A'}
        </div>
        <div className="metric-subtext" style={{ color: '#888', fontSize: '0.85em', marginTop: '4px' }}>
          SPY: {spyMetrics.bestYear?.val !== undefined ? `${spyMetrics.bestYear.val >= 0 ? '+' : ''}${spyMetrics.bestYear.val.toFixed(2)}%` : 'N/A'} ({spyMetrics.bestYear?.year || 'N/A'})
        </div>
      </div>

      {/* Worst Year metric item */}
      <div className="metric-item">
        <div className="metric-label">WORST YEAR</div>
        <div className="metric-value">
          {performanceMetrics.worstYear.val < Infinity ? (
            <>
              <span className="negative">
                {performanceMetrics.worstYear.val >= 0 ? '+' : ''}{performanceMetrics.worstYear.val.toFixed(2)}%
              </span>
              <span style={{ color: '#ffffff' }}> ({performanceMetrics.worstYear.year})</span>
            </>
          ) : 'N/A'}
        </div>
        <div className="metric-subtext" style={{ color: '#888', fontSize: '0.85em', marginTop: '4px' }}>
          SPY: {spyMetrics.worstYear?.val !== undefined ? `${spyMetrics.worstYear.val >= 0 ? '+' : ''}${spyMetrics.worstYear.val.toFixed(2)}%` : 'N/A'} ({spyMetrics.worstYear?.year || 'N/A'})
        </div>
      </div>
    </div>
  );
};