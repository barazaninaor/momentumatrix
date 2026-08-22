import { useState, useEffect } from 'react';
import { Card } from "../../componenets/Card/Card";
import { MainTitle } from "../../componenets/MainTitle/MainTitle";
import { PerformanceChart } from "../../componenets/PerformanceChart/PerformanceChart";
import { Link } from "react-router-dom";
import axios from 'axios';

import "./Home.css";

const API_URL = 'http://localhost:8000';

export const Home = () => {
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);
  const [combinedChartData, setCombinedChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [historyRes, benchmarksRes] = await Promise.all([
          axios.get(`${API_URL}/account-history/`),
          axios.get(`${API_URL}/benchmark/`)
        ]);

        const historyRecords = historyRes.data || [];
        const benchmarkRecords = benchmarksRes.data || [];

        if (historyRecords.length > 0) {
          const sortedHistory = [...historyRecords].sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          const initialPortfolioVal = sortedHistory[0].net_liquidation;
          const benchmarkMap: { [dateStr: string]: { [ticker: string]: number } } = {};
          
          const sortedBenchmarks = [...benchmarkRecords].sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

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
            const basePrice = initialPrices[t];
            const pctReturn = basePrice ? ((b.close_price - basePrice) / basePrice) * 100 : 0;
            benchmarkMap[dateStr][t] = pctReturn;
          });

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
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className="home-page">
      {/* Page Title placed directly at the top level to match other pages */}
      <MainTitle MainTitle="MomentuMatrix" />

      {/* Hero Section containing only the performance chart */}
      <section className="hero">
        <div className="home-chart-wrapper">
          <PerformanceChart
            data={combinedChartData}
            selectedBenchmarks={selectedBenchmarks}
            setSelectedBenchmarks={setSelectedBenchmarks}
            availableRanges={["ITD", "2026", "Custom"]}
            defaultRange="ITD"
          />
        </div>
      </section>

      {/* Strategy brief description centered with uniform grey tone */}
      <h3 className="home-strategy-title">
        A systematic quantitative rotation model designed to capture structural market momentum, optimize risk distribution, and consistently outperform major benchmarks through automated execution.
      </h3>

      {/* CTA Card section positioned below with a clear call-to-action text */}
      <section className="hero-cta-section">
        <Card className="hero-card">
          <p className="hero-subtitle">
            Dive deeper into the quantitative logic, algorithmic architecture, and live asset allocations driving the system.
          </p>
          <div className="cta-group">
            <Link to="/strategy" className="btn-primary">Explore Strategy</Link>
            <Link to="/portfolio" className="btn-secondary">View Portfolio</Link>
          </div>
        </Card>
      </section>

      {/* Features Grid */}
      <section className="features">
        <Card>
          <h3>Systematic Momentum</h3>
          <p>Capturing structural market trends through rules-based quantitative evaluation, eliminating human emotional bias.</p>
        </Card>

        <Card>
          <h3>Strict Defense</h3>
          <p>Macroeconomic filters designed to shield portfolio assets during periods of structural market deterioration.</p>
        </Card>

        <Card>
          <h3>Full Automation</h3>
          <p>Precision execution, risk distribution, and portfolio optimization connected directly to live market channels.</p>
        </Card>
      </section>

      {/* Philosophy / Quote Section at the Bottom */}
      <section className="footer-quote-section">
        <Card className="quote-card">
          <div className="quote">
            <p>"Gradually we become tired of the old, of what we safely possess, and we stretch out our hands again."</p>
            <span className="quote-author">— Friedrich Nietzsche</span>
          </div>
        </Card>
      </section>
    </div>
  );
};