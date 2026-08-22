import React, { useEffect } from 'react';
import './PerformanceCard.css';

interface PerformanceCardProps {
  year: number;
  monthName: string;
  data: any; // Allow flexible data structure for both backtest and portfolio state API
  onClose: () => void;
}

const sectorMapping: { [key: string]: string } = {
  "Information Technology": "Tech",
  "Health Care": "Health",
  "Financials": "Finance",
  "Consumer Discretionary": "Cons. Disc",
  "Consumer Staples": "Staples",
  "Communication Services": "Comm",
  "Industrials": "Industrial",
  "Energy": "Energy",
  "Utilities": "Utilities",
  "Real Estate": "Real Estate",
  "Materials": "Materials"
};

const getShortSector = (rawSector?: string): string => {
  if (!rawSector) return "Other";
  return sectorMapping[rawSector] || rawSector;
};

export const PerformanceCard: React.FC<PerformanceCardProps> = ({ year, monthName, data, onClose }) => {
  // Listen for Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Safely extract stocks/holdings array regardless of API response structure
  const rawStocksList = data?.stocks || data?.holdings || data?.positions || (Array.isArray(data) ? data : []);
  const sortedStocks = [...rawStocksList].sort((a: any, b: any) => (b.return || b.Return || 0) - (a.return || a.Return || 0));

  // Force equal weight distribution for each stock (e.g. 10% each if there are 10 stocks)
  const equalWeight = rawStocksList.length > 0 ? 100 / rawStocksList.length : 0;

  const sectorAllocation: { [key: string]: number } = {};
  rawStocksList.forEach((stock: any) => {
    const rawSector = stock.sector || stock.Sector || 'Other';
    const sector = getShortSector(rawSector);
    sectorAllocation[sector] = (sectorAllocation[sector] || 0) + equalWeight;
  });

  const chartData = Object.entries(sectorAllocation).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  let cumulativePercent = 0;
  const gradientStops = chartData.map((entry, idx) => {
    const start = cumulativePercent;
    cumulativePercent += entry.value;
    return `${COLORS[idx % COLORS.length]} ${start}% ${cumulativePercent}%`;
  }).join(', ');

  const totalReturn = data?.return !== undefined ? data.return : (data?.total_return || 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Portfolio Breakdown: {monthName} {year}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="stocks-table-header">
            <span className="col-ticker">Ticker</span>
            <span className="col-sector">Sector</span>
            <span className="col-return">Return</span>
          </div>
          
          <div className="stocks-list">
            {sortedStocks.map((stock: any, i: number) => {
              const rawSector = stock.sector || stock.Sector || 'Other';
              const sectorName = getShortSector(rawSector);
              const stockReturn = stock.return !== undefined ? stock.return : (stock.Return || 0);
              return (
                <div key={i} className="stock-row">
                  <span className="col-ticker stock-ticker">{stock.ticker || stock.Symbol}</span>
                  <span className="col-sector" title={rawSector}>{sectorName}</span>
                  <span className={`col-return ${stockReturn >= 0 ? 'positive' : 'negative'}`}>
                    {stockReturn > 0 ? '+' : ''}{stockReturn.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>

          {chartData.length > 0 && (
            <div style={{ marginTop: "16px", borderTop: "1px solid #2a2a40", paddingTop: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#8a8aab", marginBottom: "10px" }}>
                Sector Allocation
              </div>
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div 
                  style={{ 
                    width: "110px", 
                    height: "110px", 
                    borderRadius: "50%", 
                    background: `conic-gradient(${gradientStops})`,
                    position: "relative",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                >
                  <div 
                    style={{ 
                      position: "absolute", 
                      top: "24px", 
                      left: "24px", 
                      right: "24px", 
                      bottom: "24px", 
                      backgroundColor: "#1e1e2f", 
                      borderRadius: "50%" 
                    }} 
                  />
                </div>

                <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
                  {chartData.map((entry, idx) => (
                    <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: COLORS[idx % COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={entry.name}>{entry.name}</span>
                      <span style={{ color: "#8a8aab", marginLeft: "auto", fontWeight: "600" }}>{entry.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="modal-total-footer">
            <span>Total Portfolio Return:</span>
            <span className={totalReturn >= 0 ? 'positive' : 'negative'}>
              {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(2)}%
            </span>
          </div>

          <div style={{ fontSize: "11px", color: "#8a8aab", textAlign: "center", marginTop: "8px", fontStyle: "italic" }}>
            * Returns are calculated based on stock holdings and ignore portfolio cash.
          </div>
          <div style={{ fontSize: "11px", color: "#8a8aab", textAlign: "center", marginTop: "4px", fontStyle: "italic" }}>
            * Sector weights are equal-weighted per stock.
          </div>
        </div>
      </div>
    </div>
  );
};