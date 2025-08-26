# SupplySight Dashboard

A small but complete take-home implementation of the **Daily Inventory Dashboard** for a supply chain platform called **SupplySight**.

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Apollo Client + Recharts
- **Backend**: Express + Apollo Server (GraphQL) with an in-memory mock DB and deterministic trend generation
- **Features**:
  - Date-range chips (7d / 14d / 30d)
  - KPI cards: Total Stock, Total Demand, Fill Rate
  - Line chart: Stock vs Demand trend (from `kpis(range)`)
  - Filters (Search, Warehouse, Status)
  - Products table with Status pill + pagination (10 rows/page)
  - Row click opens a right-side drawer showing product details + two mutations:
    - Update Demand
    - Transfer Stock

See `NOTES.md` for decisions/tradeoffs and potential enhancements.

## Quick Start

```bash
# 1) Install workspace deps (server + client)
npm run install:all

# 2a) Dev mode (runs server and client with hot reload)
npm run dev
# - GraphQL server: http://localhost:4000/graphql
# - Vite dev server (frontend): http://localhost:5173

# 2b) Production mode
npm run build        # builds client
npm start            # serves client statically via Express + provides /graphql
# - App: http://localhost:4000
# - GraphQL: http://localhost:4000/graphql
```

## Structure
```
supplysight/
├── client/    # React + Tailwind frontend
├── server/    # Express + Apollo GraphQL mock API
├── package.json
├── README.md
└── NOTES.md
```
