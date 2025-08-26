import React, { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  QUERY_WAREHOUSES,
  QUERY_TOTALS,
  QUERY_KPIS,
  QUERY_PRODUCTS,
} from "./gql";
import TopBar from "./components/TopBar";
import KPISection from "./components/KPISection";
import ChartSection from "./components/ChartSection";
import Filters from "./components/Filters";
import ProductsTable from "./components/ProductsTable";
import Drawer from "./components/Drawer";
import { PAGE_SIZE } from "./config";

export default function App() {
  const [range, setRange] = useState<number>(7);
  const [search, setSearch] = useState<string>("");
  const [warehouse, setWarehouse] = useState<string>("");
  const [status, setStatus] = useState<any>(undefined);
  const [page, setPage] = useState(1);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const {
    data: totalsData,
    loading: totalsLoading,
    error: totalsError,
  } = useQuery(QUERY_TOTALS);
  const {
    data: kpiData,
    loading: kpiLoading,
    error: kpiError,
  } = useQuery(QUERY_KPIS, { variables: { range } });
  const { data: whData } = useQuery(QUERY_WAREHOUSES);

  const vars = {
    search: search || undefined,
    warehouse: warehouse || undefined,
    status: status || undefined,
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  };
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery(QUERY_PRODUCTS, { variables: vars });

  const totalPages = useMemo(() => {
    const totalCount = productsData?.products.totalCount || 0;
    return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  }, [productsData]);

  const onFilterChange = () => setPage(1);
  React.useEffect(() => {
    onFilterChange();
  }, [search, warehouse, status]);

  const totals = totalsData?.totals;
  const kpis = kpiData?.kpis || [];
  const warehouses = whData?.warehouses || [];

  return (
    <div className="min-h-screen">
      <TopBar range={range} onRangeChange={setRange} />
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <KPISection
          totalsLoading={totalsLoading}
          totalsError={totalsError?.message}
          totals={totals}
        />
        <ChartSection
          kpiLoading={kpiLoading}
          kpiError={kpiError?.message}
          kpis={kpis}
        />

        <Filters
          search={search}
          setSearch={setSearch}
          warehouse={warehouse}
          setWarehouse={setWarehouse}
          status={status}
          setStatus={setStatus}
          warehouses={warehouses}
        />

        <ProductsTable
          loading={productsLoading}
          error={productsError?.message}
          data={productsData?.products.nodes || []}
          totalCount={productsData?.products.totalCount || 0}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          onRowClick={(id) => setDrawerId(id)}
        />
      </main>

      <Drawer
        id={drawerId}
        onClose={() => setDrawerId(null)}
        onChanged={() => {
          refetchProducts();
        }}
      />
    </div>
  );
}
