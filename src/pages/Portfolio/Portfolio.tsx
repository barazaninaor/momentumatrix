import { useEffect, useState } from "react";
import { MainTitle } from "../../componenets/MainTitle/MainTitle";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as PieTooltip, 
  ResponsiveContainer 
} from "recharts";
import "./Portfolio.css";
import { LoadingSpinner } from "../../componenets/LoadingSpinner/LoadingSpinner";
import { SubHeading } from "../../componenets/SubHeading/SubHeading";
import { PortfolioSummary } from "../../componenets/PortfolioSummary/PortfolioSummary";

export const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/static-portfolio/latest")
      .then((res) => res.json())
      .then((result) => {
        setPortfolioData(result.data || result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching portfolio data:", err);
        setLoading(false);
      });
  }, []);

  const rawPositions = portfolioData?.positions || [];
  const positionsList = [...rawPositions].sort((a, b) => {
    return (b["Total Change %"] || 0) - (a["Total Change %"] || 0);
  });

  // Calculate sector allocation dynamically based on each position's actual weight and sector
  const sectorMap: { [key: string]: number } = {};
  positionsList.forEach((item: any) => {
    const sector = item.Sector || item.sector || item.GICS_Sector || item.gics_sector || "Other";
    const weight = Number(item.Weight || 0);
    sectorMap[sector] = (sectorMap[sector] || 0) + weight;
  });

  const sectorData = Object.keys(sectorMap).map((sector) => ({
    name: sector,
    value: sectorMap[sector],
  }));

  const COLORS = ["#00d2ff", "#3b82f6", "#06b6d4", "#6366f1", "#0ea5e9", "#2563eb", "#10b981", "#f59e0b"];

  const accountValue = Number(portfolioData?.net_liquidation || 0);
  const cashBalance = Number(portfolioData?.cash_balance || 0);
  const initialInvestment = 1000000.0;
  
  const mtdPnl = Number(portfolioData?.mtd_pnl || 0);
  const mtdChange = Number(portfolioData?.mtd_change_percent || 0);
  const ytdPnl = Number(portfolioData?.ytd_pnl || 0);
  const ytdChange = Number(portfolioData?.ytd_change_percent || 0);
  const itdPnl = Number(portfolioData?.itd_pnl || 0);
  const itdChange = Number(portfolioData?.itd_change_percent || 0);

  const updateDate = portfolioData?.date || portfolioData?.snapshot_date || portfolioData?.latest_date || null;

  return (
    <div className="portfolio-page">
      <MainTitle MainTitle="Portfolio" />
      {updateDate && (
        <p className="portfolio-subtitle-date" style={{ color: "#9ca3af", fontSize: "0.9rem", marginTop: "-8px", marginBottom: "20px", fontWeight: 400 }}>
          Last Update: {updateDate}
        </p>
      )}

      {loading ? (
        <LoadingSpinner message="Loading portfolio..." />
      ) : (
        <div className="portfolio-content">
          
          <PortfolioSummary 
            initialInvestment={initialInvestment}
            accountValue={accountValue}
            cashBalance={cashBalance}
            mtdPnl={mtdPnl}
            mtdChange={mtdChange}
            ytdPnl={ytdPnl}
            ytdChange={ytdChange}
            itdPnl={itdPnl}
            itdChange={itdChange}
          />

          <div className="portfolio-table-wrapper">
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Sector</th>
                  <th>Cost Basis</th>
                  <th>Price</th>
                  <th>Shares</th>
                  <th>Market Value</th>
                  <th>Daily P&L</th>
                  <th>Daily Change %</th>
                  <th>P&L</th>
                  <th>Total Change %</th>
                  <th>Weight</th>
                </tr>
              </thead>
              <tbody>
                {positionsList.length > 0 ? (
                  positionsList.map((item: any, index: number) => {
                    const dailyPnl = Number(item["Daily P&L"] || 0);
                    const dailyChange = Number(item["Daily Change %"] || 0);
                    const totalPnl = Number(item["P&L"] || 0);
                    const totalChange = Number(item["Total Change %"] || 0);
                    const weightVal = Number(item.Weight || 0);
                    const sectorName = item.Sector || item.sector || item.GICS_Sector || item.gics_sector || "N/A";

                    return (
                      <tr key={index}>
                        <td>{item.Ticker}</td>
                        <td>{sectorName}</td>
                        <td>${Number(item["Cost Basis"] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>${Number(item.Price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>{Number(item.Shares || 0).toLocaleString()}</td>
                        <td>${Number(item["Market Value"] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className={dailyPnl >= 0 ? "positive" : "negative"}>{dailyPnl < 0 ? `-$${Math.abs(dailyPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${dailyPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</td>
                        <td className={dailyChange >= 0 ? "positive" : "negative"}>{dailyChange > 0 ? `+${dailyChange.toFixed(2)}%` : `${dailyChange.toFixed(2)}%`}</td>
                        <td className={totalPnl >= 0 ? "positive" : "negative"}>{totalPnl < 0 ? `-$${Math.abs(totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</td>
                        <td className={totalChange >= 0 ? "positive" : "negative"}>{totalChange > 0 ? `+${totalChange.toFixed(2)}%` : `${totalChange.toFixed(2)}%`}</td>
                        <td>{weightVal.toFixed(2)}%</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", padding: "20px" }}>No positions found or loading error.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="sector-chart-section">
            <SubHeading SubHeading="Sector Allocation" />
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    label={(entry: any) => `${entry.name}: ${Number(entry.value).toFixed(1)}%`}
                    labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                  >
                    {sectorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0c0d0e" strokeWidth={2} />
                    ))}
                  </Pie>
                  <PieTooltip 
                    contentStyle={{ backgroundColor: "#16181c", borderColor: "#1f2124", borderRadius: "8px", color: "#fff" }}
                    formatter={(value: any) => [`${Number(value).toFixed(2)}%`, "Weight Allocation"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};