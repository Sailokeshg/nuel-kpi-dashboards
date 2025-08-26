import React from "react";
import KPICard from "./KPICard";
import SkeletonCard from "./SkeletonCard";

export default function KPISection({
  totalsLoading,
  totalsError,
  totals,
}: {
  totalsLoading: boolean;
  totalsError?: string;
  totals?: { totalStock: number; totalDemand: number; fillRate: number };
}) {
  if (totalsLoading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  if (totalsError)
    return (
      <div className="p-3 bg-red-50 text-red-700 rounded">
        Failed to load totals: {totalsError}
      </div>
    );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KPICard label="Total Stock" value={totals?.totalStock ?? 0} />
      <KPICard label="Total Demand" value={totals?.totalDemand ?? 0} />
      <KPICard
        label="Fill Rate"
        value={`${(totals?.fillRate ?? 0).toFixed(1)}%`}
      />
    </div>
  );
}
