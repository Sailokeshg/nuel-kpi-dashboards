import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  QUERY_PRODUCT,
  MUTATION_UPDATE_DEMAND,
  MUTATION_TRANSFER_STOCK,
} from "../gql";

export default function Drawer({
  id,
  onClose,
  onChanged,
}: {
  id: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const open = !!id;
  const { data, loading, error, refetch } = useQuery(QUERY_PRODUCT, {
    variables: { id },
    skip: !open,
  });

  const [updateDemand, { loading: updating }] = useMutation(
    MUTATION_UPDATE_DEMAND,
    {
      onCompleted: () => {
        refetch();
        onChanged();
      },
    }
  );
  const [transferStock, { loading: transferring }] = useMutation(
    MUTATION_TRANSFER_STOCK,
    {
      onCompleted: () => {
        refetch();
        onChanged();
      },
    }
  );

  const product = data?.product;
  const [demandInput, setDemandInput] = React.useState("");
  const [toWh, setToWh] = React.useState("BLR-A");
  const [amount, setAmount] = React.useState("");

  React.useEffect(() => {
    if (product) setDemandInput(String(product.demand));
  }, [product]);

  return (
    <div
      className={"drawer " + (open ? "translate-x-0" : "translate-x-full")}
      aria-hidden={!open}
    >
      <div className="drawer-header">
        <div className="font-semibold">Product Details</div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="border rounded px-2 py-1"
        >
          Close
        </button>
      </div>
      <div className="drawer-body">
        {loading && <div className="animate-pulse h-40 bg-gray-100 rounded" />}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded">
            Failed to load: {error.message}
          </div>
        )}
        {product && (
          <div className="space-y-4">
            <div>
              <div className="text-xl font-semibold">{product.name}</div>
              <div className="text-gray-500 text-sm">
                ID: {product.id} • SKU: {product.sku}
              </div>
              <div className="text-gray-500 text-sm">
                Warehouse: {product.warehouse}
              </div>
              <div className="text-sm mt-2">
                Stock: <b>{product.stock}</b> • Demand: <b>{product.demand}</b>
              </div>
              <div className="mt-2">
                <span className={"status-pill status-" + product.status}>
                  {product.status === "HEALTHY"
                    ? "Healthy"
                    : product.status === "LOW"
                    ? "Low"
                    : "Critical"}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="font-medium mb-2">Update Demand</div>
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateDemand({
                    variables: {
                      id: product.id,
                      demand: parseInt(demandInput || "0", 10),
                    },
                  });
                }}
              >
                <input
                  type="number"
                  min={0}
                  value={demandInput}
                  onChange={(e) => setDemandInput(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
                <button
                  disabled={updating}
                  className="w-full border rounded px-3 py-2 bg-gray-900 text-white disabled:opacity-60"
                >
                  {updating ? "Updating..." : "Save Demand"}
                </button>
              </form>
            </div>

            <div className="border-t pt-4">
              <div className="font-medium mb-2">Transfer Stock</div>
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  transferStock({
                    variables: {
                      id: product.id,
                      toWarehouse: toWh,
                      amount: parseInt(amount || "0", 10),
                    },
                  });
                }}
              >
                <div className="flex gap-2">
                  <input
                    placeholder="To warehouse (e.g., BLR-A)"
                    value={toWh}
                    onChange={(e) => setToWh(e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-32 border rounded px-3 py-2"
                  />
                </div>
                <button
                  disabled={transferring}
                  className="w-full border rounded px-3 py-2 bg-gray-900 text-white disabled:opacity-60"
                >
                  {transferring ? "Transferring..." : "Transfer"}
                </button>
                <div className="text-xs text-gray-500">
                  If a same-SKU product doesn't exist at the target, it will be
                  created.
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
