import React from "react";
import { Status } from "./types";

export default function Filters(props: {
  search: string;
  setSearch: (v: string) => void;
  warehouse: string;
  setWarehouse: (v: string) => void;
  status: Status;
  setStatus: (v: Status) => void;
  warehouses: string[];
}) {
  const {
    search,
    setSearch,
    warehouse,
    setWarehouse,
    status,
    setStatus,
    warehouses,
  } = props;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="flex-1">
        <input
          placeholder="Search by Name, SKU or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <div className="flex items-center gap-2">
        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Warehouses</option>
          {warehouses.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <select
          value={status ?? ""}
          onChange={(e) => setStatus((e.target.value || undefined) as any)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="HEALTHY">Healthy</option>
          <option value="LOW">Low</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>
    </div>
  );
}
