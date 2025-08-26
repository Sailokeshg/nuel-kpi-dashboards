import React from "react";

export default function ProductsTable({
  loading,
  error,
  data,
  totalCount,
  page,
  setPage,
  totalPages,
  onRowClick,
}: {
  loading: boolean;
  error?: string;
  data: any[];
  totalCount: number;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  onRowClick: (id: string) => void;
}) {
  if (loading)
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse h-[360px]" />
    );
  if (error)
    return (
      <div className="p-3 bg-red-50 text-red-700 rounded">
        Failed to load products: {error}
      </div>
    );
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <table className="w-full table-fixed">
        <thead className="text-left text-sm text-gray-500 border-b">
          <tr>
            <th className="p-3 w-[32%]">Product</th>
            <th className="p-3 w-[14%]">SKU</th>
            <th className="p-3 w-[14%]">Warehouse</th>
            <th className="p-3 w-[10%]">Stock</th>
            <th className="p-3 w-[10%]">Demand</th>
            <th className="p-3 w-[20%]">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                No products match your filters.
              </td>
            </tr>
          )}
          {data.map((p) => (
            <tr
              key={p.id}
              className={
                "border-b cursor-pointer hover:bg-gray-50 " +
                (p.status === "CRITICAL" ? "row-critical" : "")
              }
              onClick={() => onRowClick(p.id)}
            >
              <td className="p-3 font-medium truncate">{p.name}</td>
              <td className="p-3">{p.sku}</td>
              <td className="p-3">{p.warehouse}</td>
              <td className="p-3">{p.stock}</td>
              <td className="p-3">{p.demand}</td>
              <td className="p-3">
                <span className={"status-pill status-" + p.status}>
                  {p.status === "HEALTHY"
                    ? "Healthy"
                    : p.status === "LOW"
                    ? "Low"
                    : "Critical"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between p-3 text-sm">
        <div className="text-gray-500">Total: {totalCount}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            className="border rounded px-3 py-1 disabled:opacity-50"
            disabled={page <= 1}
          >
            Prev
          </button>
          <div>
            Page {page} of {totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="border rounded px-3 py-1 disabled:opacity-50"
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
