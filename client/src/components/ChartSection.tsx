import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ChartSection({
  kpiLoading,
  kpiError,
  kpis,
}: {
  kpiLoading: boolean;
  kpiError?: string;
  kpis: Array<{ date: string; stock: number; demand: number }>;
}) {
  if (kpiLoading)
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-[280px] animate-pulse" />
    );
  if (kpiError)
    return (
      <div className="p-3 bg-red-50 text-red-700 rounded">
        Failed to load chart: {kpiError}
      </div>
    );
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-[320px]">
      <div className="text-sm text-gray-500 mb-2">Stock vs Demand</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={kpis}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="stock" dot={false} />
          <Line type="monotone" dataKey="demand" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
