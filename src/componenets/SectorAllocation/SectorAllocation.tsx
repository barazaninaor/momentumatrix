import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { SubHeading } from "../SubHeading/SubHeading";
import "./SectorAllocation.css";

interface SectorAllocationProps {
  positions: any[];
}

const COLORS = ["#00d2ff", "#3b82f6", "#06b6d4", "#6366f1", "#0ea5e9", "#2563eb", "#10b981", "#f59e0b"];

export const SectorAllocation: React.FC<SectorAllocationProps> = ({ positions = [] }) => {
  const sectorMap: { [key: string]: number } = {};
  
  const totalPositionsCount = positions.length;
  const defaultWeight = totalPositionsCount > 0 ? 100 / totalPositionsCount : 0;

  positions.forEach((item: any) => {
    // שליפת הסקטור אך ורק מתוך הנתונים המגיעים מהשרת/טבלה
    const sector = 
      item.stock?.sector || 
      item.stock?.Sector || 
      item.Sector || 
      item.sector || 
      item.GICS_Sector || 
      item.gics_sector || 
      "Other";

    const marketValue = Number(
      item["Market Value"] ?? 
      item.market_value ?? 
      item.target_weight ?? 
      defaultWeight
    );

    sectorMap[sector] = (sectorMap[sector] || 0) + marketValue;
  });

  const sectorData = Object.keys(sectorMap).map((sector) => ({
    name: sector,
    value: sectorMap[sector],
  }));

  return (
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
              label={(entry: any) => `${entry.name}: ${((entry.percent ?? 0) * 100).toFixed(1)}%`}
              labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
            >
              {sectorData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0c0d0e" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: "#16181c", borderColor: "#1f2124", borderRadius: "8px", color: "#fff" }}
              formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Value"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};