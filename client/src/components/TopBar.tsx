import React from "react";
import { RANGE_OPTIONS } from "../config";

export default function TopBar({
  range,
  onRangeChange,
}: {
  range: number;
  onRangeChange: (r: number) => void;
}) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold">SupplySight</div>
          <div className="hidden sm:block text-gray-400">
            • Daily Inventory Dashboard
          </div>
        </div>
        <div className="flex items-center gap-2">
          {RANGE_OPTIONS.map((r: number) => (
            <button
              key={r}
              className={"chip " + (range === r ? "active" : "")}
              onClick={() => onRangeChange(r)}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
