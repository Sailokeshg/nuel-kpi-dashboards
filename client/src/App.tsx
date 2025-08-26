
import React, { useMemo, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import {
  QUERY_WAREHOUSES, QUERY_TOTALS, QUERY_KPIS, QUERY_PRODUCTS, QUERY_PRODUCT,
  MUTATION_UPDATE_DEMAND, MUTATION_TRANSFER_STOCK
} from './gql'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type Status = 'HEALTHY' | 'LOW' | 'CRITICAL' | undefined

const RANGE_OPTIONS = [7, 14, 30] as const
const PAGE_SIZE = 10

export default function App() {
  const [range, setRange] = useState<number>(7)
  const [search, setSearch] = useState<string>('')
  const [warehouse, setWarehouse] = useState<string>('')
  const [status, setStatus] = useState<Status>(undefined)
  const [page, setPage] = useState(1)
  const [drawerId, setDrawerId] = useState<string | null>(null)

  const { data: totalsData, loading: totalsLoading, error: totalsError } = useQuery(QUERY_TOTALS)
  const { data: kpiData, loading: kpiLoading, error: kpiError } = useQuery(QUERY_KPIS, { variables: { range } })
  const { data: whData } = useQuery(QUERY_WAREHOUSES)

  const vars = { search: search || undefined, warehouse: warehouse || undefined, status: status || undefined, offset: (page-1)*PAGE_SIZE, limit: PAGE_SIZE }
  const { data: productsData, loading: productsLoading, error: productsError, refetch: refetchProducts } = useQuery(QUERY_PRODUCTS, { variables: vars })

  const totalPages = useMemo(() => {
    const totalCount = productsData?.products.totalCount || 0
    return Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  }, [productsData])

  const onFilterChange = () => {
    setPage(1)
  }

  React.useEffect(() => { onFilterChange() }, [search, warehouse, status])

  const totals = totalsData?.totals
  const kpis = kpiData?.kpis || []
  const warehouses = whData?.warehouses || []

  return (
    <div className="min-h-screen">
      <TopBar range={range} onRangeChange={setRange} />
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <KPISection totalsLoading={totalsLoading} totalsError={totalsError?.message} totals={totals} />
        <ChartSection kpiLoading={kpiLoading} kpiError={kpiError?.message} kpis={kpis} />

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
        onChanged={() => { refetchProducts(); }}
      />
    </div>
  )
}

function TopBar({ range, onRangeChange }: { range: number, onRangeChange: (r:number)=>void }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold">SupplySight</div>
          <div className="hidden sm:block text-gray-400">• Daily Inventory Dashboard</div>
        </div>
        <div className="flex items-center gap-2">
          {RANGE_OPTIONS.map(r => (
            <button key={r} className={'chip ' + (range === r ? 'active' : '')} onClick={() => onRangeChange(r)}>{r}d</button>
          ))}
        </div>
      </div>
    </header>
  )
}

function KPISection({ totalsLoading, totalsError, totals }:{ totalsLoading:boolean, totalsError?:string, totals?:{totalStock:number,totalDemand:number,fillRate:number} }) {
  if (totalsLoading) return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><SkeletonCard/><SkeletonCard/><SkeletonCard/></div>
  if (totalsError) return <div className="p-3 bg-red-50 text-red-700 rounded">Failed to load totals: {totalsError}</div>
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KPICard label="Total Stock" value={totals?.totalStock ?? 0} />
      <KPICard label="Total Demand" value={totals?.totalDemand ?? 0} />
      <KPICard label="Fill Rate" value={`${(totals?.fillRate ?? 0).toFixed(1)}%`} />
    </div>
  )
}

function KPICard({ label, value }:{ label:string, value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse h-[80px]" />
}

function ChartSection({ kpiLoading, kpiError, kpis }:{ kpiLoading:boolean, kpiError?:string, kpis: Array<{date:string, stock:number, demand:number}> }) {
  if (kpiLoading) return <div className="bg-white rounded-lg border border-gray-200 p-4 h-[280px] animate-pulse" />
  if (kpiError) return <div className="p-3 bg-red-50 text-red-700 rounded">Failed to load chart: {kpiError}</div>
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
  )
}

function Filters(props:{
  search:string, setSearch:(v:string)=>void,
  warehouse:string, setWarehouse:(v:string)=>void,
  status: Status, setStatus:(v:Status)=>void,
  warehouses: string[]
}) {
  const { search, setSearch, warehouse, setWarehouse, status, setStatus, warehouses } = props
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="flex-1">
        <input
          placeholder="Search by Name, SKU or ID"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <div className="flex items-center gap-2">
        <select value={warehouse} onChange={e=>setWarehouse(e.target.value)} className="border border-gray-300 rounded px-3 py-2">
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <select value={status ?? ''} onChange={e=>setStatus((e.target.value||undefined) as any)} className="border border-gray-300 rounded px-3 py-2">
          <option value="">All Status</option>
          <option value="HEALTHY">Healthy</option>
          <option value="LOW">Low</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>
    </div>
  )
}

function ProductsTable({ loading, error, data, totalCount, page, setPage, totalPages, onRowClick }:
{ loading:boolean, error?:string, data:any[], totalCount:number, page:number, setPage:(p:number)=>void, totalPages:number, onRowClick:(id:string)=>void }) {
  if (loading) return <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse h-[360px]" />
  if (error) return <div className="p-3 bg-red-50 text-red-700 rounded">Failed to load products: {error}</div>
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
            <tr><td colSpan={6} className="p-4 text-center text-gray-500">No products match your filters.</td></tr>
          )}
          {data.map((p) => (
            <tr key={p.id} className={'border-b cursor-pointer hover:bg-gray-50 ' + (p.status === 'CRITICAL' ? 'row-critical' : '')} onClick={() => onRowClick(p.id)}>
              <td className="p-3 font-medium truncate">{p.name}</td>
              <td className="p-3">{p.sku}</td>
              <td className="p-3">{p.warehouse}</td>
              <td className="p-3">{p.stock}</td>
              <td className="p-3">{p.demand}</td>
              <td className="p-3">
                <span className={'status-pill status-' + p.status}>
                  {p.status === 'HEALTHY' ? 'Healthy' : p.status === 'LOW' ? 'Low' : 'Critical'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between p-3 text-sm">
        <div className="text-gray-500">Total: {totalCount}</div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setPage(Math.max(1, page-1))} className="border rounded px-3 py-1 disabled:opacity-50" disabled={page <= 1}>Prev</button>
          <div>Page {page} of {totalPages}</div>
          <button onClick={()=>setPage(Math.min(totalPages, page+1))} className="border rounded px-3 py-1 disabled:opacity-50" disabled={page >= totalPages}>Next</button>
        </div>
      </div>
    </div>
  )
}

function Drawer({ id, onClose, onChanged }:{ id: string | null, onClose:()=>void, onChanged:()=>void }) {
  const open = !!id
  const { data, loading, error, refetch } = useQuery(QUERY_PRODUCT, { variables: { id }, skip: !open })

  const [updateDemand, { loading: updating }] = useMutation(MUTATION_UPDATE_DEMAND, {
    onCompleted: () => { refetch(); onChanged(); }
  })
  const [transferStock, { loading: transferring }] = useMutation(MUTATION_TRANSFER_STOCK, {
    onCompleted: () => { refetch(); onChanged(); }
  })

  const product = data?.product
  const [demandInput, setDemandInput] = React.useState('')
  const [toWh, setToWh] = React.useState('BLR-A')
  const [amount, setAmount] = React.useState('')

  React.useEffect(() => {
    if (product) setDemandInput(String(product.demand))
  }, [product])

  return (
    <div className={"drawer " + (open ? "translate-x-0" : "translate-x-full") } aria-hidden={!open}>
      <div className="drawer-header">
        <div className="font-semibold">Product Details</div>
        <button onClick={onClose} aria-label="Close" className="border rounded px-2 py-1">Close</button>
      </div>
      <div className="drawer-body">
        {loading && <div className="animate-pulse h-40 bg-gray-100 rounded" />}
        {error && <div className="p-3 bg-red-50 text-red-700 rounded">Failed to load: {error.message}</div>}
        {product && (
          <div className="space-y-4">
            <div>
              <div className="text-xl font-semibold">{product.name}</div>
              <div className="text-gray-500 text-sm">ID: {product.id} • SKU: {product.sku}</div>
              <div className="text-gray-500 text-sm">Warehouse: {product.warehouse}</div>
              <div className="text-sm mt-2">Stock: <b>{product.stock}</b> • Demand: <b>{product.demand}</b></div>
              <div className="mt-2">
                <span className={'status-pill status-' + product.status}>
                  {product.status === 'HEALTHY' ? 'Healthy' : product.status === 'LOW' ? 'Low' : 'Critical'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="font-medium mb-2">Update Demand</div>
              <form className="space-y-2" onSubmit={(e)=>{ e.preventDefault(); updateDemand({ variables: { id: product.id, demand: parseInt(demandInput || '0', 10) } }) }}>
                <input type="number" min={0} value={demandInput} onChange={(e)=>setDemandInput(e.target.value)} className="w-full border rounded px-3 py-2" />
                <button disabled={updating} className="w-full border rounded px-3 py-2 bg-gray-900 text-white disabled:opacity-60">{updating ? 'Updating...' : 'Save Demand'}</button>
              </form>
            </div>

            <div className="border-t pt-4">
              <div className="font-medium mb-2">Transfer Stock</div>
              <form className="space-y-2" onSubmit={(e)=>{
                e.preventDefault();
                transferStock({ variables: { id: product.id, toWarehouse: toWh, amount: parseInt(amount || '0', 10) } })
              }}>
                <div className="flex gap-2">
                  <input placeholder="To warehouse (e.g., BLR-A)" value={toWh} onChange={(e)=>setToWh(e.target.value)} className="flex-1 border rounded px-3 py-2" />
                  <input type="number" min={0} placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-32 border rounded px-3 py-2" />
                </div>
                <button disabled={transferring} className="w-full border rounded px-3 py-2 bg-gray-900 text-white disabled:opacity-60">{transferring ? 'Transferring...' : 'Transfer'}</button>
                <div className="text-xs text-gray-500">If a same-SKU product doesn't exist at the target, it will be created.</div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
