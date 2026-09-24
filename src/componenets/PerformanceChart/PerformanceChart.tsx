import React, { useState, useEffect, useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Button } from "../Button/Button";
import "./PerformanceChart.css";

interface PerformanceChartProps {
  data: any; 
  title?: string;
  selectedBenchmarks: string[];
  setSelectedBenchmarks: React.Dispatch<React.SetStateAction<string[]>>;
  availableRanges?: string[];
  defaultRange?: string;
  className?: string;
}

const BENCHMARK_OPTIONS = [
  { label: 'SPY (S&P 500)', value: 'SPY' },
  { label: 'QQQ (Nasdaq 100)', value: 'QQQ' },
  { label: 'DIA (Dow Jones 30)', value: 'DIA' }
];

const BENCHMARK_COLORS: { [key: string]: string } = {
  SPY: "#ff3333",
  QQQ: "#a855f7",
  DIA: "#10b981",
};

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data: rawData = [], 
  title = "MomentuMatrix vs Selected Benchmarks",
  selectedBenchmarks = [],
  setSelectedBenchmarks,
  availableRanges = ["ITD", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "Custom"],
  defaultRange = "ITD",
  className = "" 
}) => {
  useEffect(() => {
    console.log("PerformanceChart rawData received:", rawData);
  }, [rawData]);

  const chartData = useMemo(() => {
    let raw = rawData;
    
    if (rawData && typeof rawData === 'object') {
      if (Array.isArray(rawData.timeSeries) && rawData.timeSeries.length > 0) {
        raw = rawData.timeSeries;
      } else if (Array.isArray(rawData.chartData) && rawData.chartData.length > 0) {
        raw = rawData.chartData;
      } else if (Array.isArray(rawData.history) && rawData.history.length > 0) {
        raw = rawData.history;
      } else if (Array.isArray(rawData.matrix)) {
        const extractedPoints: any[] = [];
        rawData.matrix.forEach((row: any) => {
          if (row.months && typeof row.months === 'object') {
            Object.keys(row.months).forEach((mKey) => {
              const mData = row.months[mKey];
              if (mData && mData.return !== undefined) {
                extractedPoints.push({
                  dateStr: `${row.year}-${mKey}`,
                  net_liquidation: mData.net_liquidation || mData.value || mData.return,
                  MomentuMatrix: mData.return
                });
              }
            });
          }
        });
        if (extractedPoints.length > 0) {
          raw = extractedPoints;
        } else {
          raw = rawData.matrix;
        }
      } else if (Array.isArray(rawData.data)) {
        raw = rawData.data;
      } else if (Array.isArray(rawData.results)) {
        raw = rawData.results;
      }
    }

    if (!Array.isArray(raw)) return [];

    const hasNetLiquidation = raw.length > 0 && raw[0].net_liquidation !== undefined;

    if (hasNetLiquidation) {
      const sorted = [...raw].sort((a, b) => new Date(a.date || a.dateStr).getTime() - new Date(b.date || b.dateStr).getTime());
      const initialVal = sorted[0].net_liquidation;

      return sorted.map((item) => {
        const currentVal = item.net_liquidation;
        const percentageReturn = initialVal && initialVal > 0 
          ? ((currentVal - initialVal) / initialVal) * 100 
          : (item.MomentuMatrix || 0);

        return {
          ...item,
          dateStr: item.date || item.dateStr,
          date: item.date || item.dateStr,
          MomentuMatrix: percentageReturn
        };
      });
    }

    return raw.map((item: any) => ({
      ...item,
      dateStr: item.dateStr || item.date || "",
      MomentuMatrix: item.MomentuMatrix !== undefined ? item.MomentuMatrix : (item.return || item.value || 0)
    }));
  }, [rawData]);

  const [timeRange, setTimeRange] = useState<string>(defaultRange); 
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeRange, setActiveRange] = useState<{ start: string; end: string }>({ start: "", end: "" });

  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const firstDate = chartData[0].dateStr || chartData[0].date || "";
      const lastDate = chartData[chartData.length - 1].dateStr || chartData[chartData.length - 1].date || "";
      
      setStartDate(firstDate);
      setEndDate(lastDate);
      
      handleTimeRangeChange(defaultRange, firstDate, lastDate);
    }
  }, [chartData, defaultRange]);

  const handleTimeRangeChange = (range: string, customFirstDate?: string, customLastDate?: string) => {
    setTimeRange(range);

    const firstDateStr = customFirstDate || (chartData.length > 0 ? (chartData[0].dateStr || chartData[0].date) : "");
    const lastDateStr = customLastDate || (chartData.length > 0 ? (chartData[chartData.length - 1].dateStr || chartData[chartData.length - 1].date) : "");

    if (!lastDateStr) return;

    if (range === "ITD") {
      setStartDate(firstDateStr);
      setEndDate(lastDateStr);
      setActiveRange({ start: "", end: "" }); 
    } else if (range === "YTD") {
      const currentYear = new Date(lastDateStr).getFullYear();
      const startYTD = `${currentYear}-01`;
      setStartDate(startYTD);
      setEndDate(lastDateStr);
      setActiveRange({ start: startYTD, end: lastDateStr });
    } else if (range === "MTD") {
      const startMTD = lastDateStr.substring(0, 7);
      setStartDate(startMTD);
      setEndDate(lastDateStr);
      setActiveRange({ start: startMTD, end: lastDateStr });
    } else if (/^\d{4}$/.test(range)) {
      const startYear = `${range}-01`;
      const endYear = `${range}-12`;
      setStartDate(startYear);
      setEndDate(endYear);
      setActiveRange({ start: startYear, end: endYear });
    }
  };

  const getFilteredData = () => {
    if (!chartData || chartData.length === 0) return [];

    if (activeRange.start && activeRange.end) {
      return chartData.filter(
        (item: any) => {
          const itemDate = item.dateStr || item.date;
          return itemDate >= activeRange.start && itemDate <= activeRange.end;
        }
      );
    }
    return chartData;
  };

  const handleApplyCustomDates = () => {
    setActiveRange({ start: startDate, end: endDate });
  };

  const handleCheckboxChange = (value: string) => {
    const currentScrollY = window.scrollY;

    if (selectedBenchmarks.includes(value)) {
      setSelectedBenchmarks(selectedBenchmarks.filter((b) => b !== value));
    } else {
      setSelectedBenchmarks([...selectedBenchmarks, value]);
    }

    requestAnimationFrame(() => {
      window.scrollTo({
        top: currentScrollY,
        behavior: 'instant' as ScrollBehavior
      });
    });
  };

  return (
    <div className={`sector-chart-section ${className}`}>
      <h2 className="chart-independent-title">{title}</h2>
      
      <div className="chart-benchmark-toolbar">
        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Compare ETFs:</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          {BENCHMARK_OPTIONS.map((opt) => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                value={opt.value}
                checked={selectedBenchmarks.includes(opt.value)}
                onChange={() => handleCheckboxChange(opt.value)}
                style={{ accentColor: '#22c55e', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="chart-toolbar">
        <div className="time-range-buttons">
          {availableRanges.map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`range-btn ${timeRange === range ? "active" : ""}`}
            >
              {range}
            </button>
          ))}
        </div>

        <div className={`custom-date-inputs ${timeRange === "Custom" ? "enabled" : "disabled"}`}>
          <input 
            type="text" 
            placeholder="YYYY-MM"
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="date-input" 
          />
          <span className="date-separator">to</span>
          <input 
            type="text" 
            placeholder="YYYY-MM"
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="date-input" 
          />
          
          <Button 
            text="Apply" 
            variant="solid" 
            onClick={handleApplyCustomDates} 
            style={{ padding: "6px 16px", fontSize: "13px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center" }}
          />
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={380}>
          <LineChart 
            key="performance-chart-main" 
            data={getFilteredData()} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2124" />
            <XAxis dataKey="dateStr" stroke="#9ca3af" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis 
              stroke="#9ca3af" 
              domain={['auto', 'auto']} 
              tick={{ fill: "#9ca3af", fontSize: 12 }} 
              tickFormatter={(value) => `${Number(value).toLocaleString()}%`} 
            />
            
            {/* Tooltip מותאם אישית ששומר על העיצוב המקורי והגודל הרגיל, אך ממיין את השורות מהגבוה לנמוך */}
            <Tooltip 
              contentStyle={{ backgroundColor: "#16181c", borderColor: "#1f2124", borderRadius: "8px", color: "#fff" }}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;

                const sortedPayload = [...payload].sort((a: any, b: any) => Number(b.value || 0) - Number(a.value || 0));

                return (
                  <div style={{ backgroundColor: "#16181c", border: "1px solid #1f2124", borderRadius: "8px", padding: "10px", color: "#fff" }}>
                    <div style={{ marginBottom: "5px", fontWeight: "bold" }}>{label}</div>
                    {sortedPayload.map((entry: any) => (
                      <div key={entry.name} style={{ color: entry.color, display: "flex", justifyContent: "space-between", gap: "15px" }}>
                        <span>{entry.name}:</span>
                        <span>{Number(entry.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            
            {/* מקרא דינמי שממוין אוטומטית מהגבוה לנמוך לפי הערך בנקודה האחרונה */}
            <Legend 
              verticalAlign="top" 
              height={36} 
              wrapperStyle={{ color: "#fff" }}
              content={() => {
                const currentFilteredData = getFilteredData();
                const lastPoint = currentFilteredData.length > 0 ? currentFilteredData[currentFilteredData.length - 1] : {};

                const items = [
                  { value: 'MomentuMatrix', color: '#00f0ff', show: true, val: Number(lastPoint['MomentuMatrix'] || 0) },
                  { value: 'SPY', color: BENCHMARK_COLORS['SPY'], show: selectedBenchmarks.includes('SPY'), val: Number(lastPoint['SPY'] || 0) },
                  { value: 'QQQ', color: BENCHMARK_COLORS['QQQ'], show: selectedBenchmarks.includes('QQQ'), val: Number(lastPoint['QQQ'] || 0) },
                  { value: 'DIA', color: BENCHMARK_COLORS['DIA'], show: selectedBenchmarks.includes('DIA'), val: Number(lastPoint['DIA'] || 0) },
                ];

                const sortedItems = items.filter(item => item.show).sort((a, b) => b.val - a.val);

                return (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', fontSize: '14px', paddingBottom: '10px' }}>
                    {sortedItems.map((item) => (
                      <span key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <svg width="16" height="14" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                          <line x1="0" y1="7" x2="16" y2="7" stroke={item.color} strokeWidth="3" />
                          <circle cx="8" cy="7" r="3" fill={item.color} />
                        </svg>
                        <span style={{ color: '#fff' }}>{item.value} ({item.val.toFixed(2)}%)</span>
                      </span>
                    ))}
                  </div>
                );
              }}
            />
            
            <Line 
              type="monotone" 
              dataKey="MomentuMatrix" 
              stroke="#00f0ff" 
              strokeWidth={3} 
              dot={false} 
              name="MomentuMatrix" 
              className="momentu-matrix-line"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
            <Line 
              type="monotone" 
              dataKey="SPY" 
              stroke={BENCHMARK_COLORS["SPY"]} 
              strokeWidth={2.5} 
              dot={false} 
              name="SPY" 
              className="spy-line"
              hide={!selectedBenchmarks.includes("SPY")}
              isAnimationActive={true}
              animationDuration={600}
            />
            <Line 
              type="monotone" 
              dataKey="QQQ" 
              stroke={BENCHMARK_COLORS["QQQ"]} 
              strokeWidth={2.5} 
              dot={false} 
              name="QQQ" 
              className="qqq-line"
              hide={!selectedBenchmarks.includes("QQQ")}
              isAnimationActive={true}
              animationDuration={600}
            />
            <Line 
              type="monotone" 
              dataKey="DIA" 
              stroke={BENCHMARK_COLORS["DIA"]} 
              strokeWidth={2.5} 
              dot={false} 
              name="DIA" 
              className="dia-line"
              hide={!selectedBenchmarks.includes("DIA")}
              isAnimationActive={true}
              animationDuration={600}
            />
          </LineChart> 
        </ResponsiveContainer>
      </div>
    </div>
  );
};