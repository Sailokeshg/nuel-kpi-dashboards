import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { gql } from 'graphql-tag';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------------- Mock Data ----------------
let products = [
  { id: "P-1001", name: "12mm Hex Bolt", sku: "HEX-12-100", warehouse: "BLR-A", stock: 180, demand: 120 },
  { id: "P-1002", name: "Steel Washer", sku: "WSR-08-500", warehouse: "BLR-A", stock: 50, demand: 80 },
  { id: "P-1003", name: "M8 Nut", sku: "NUT-08-200", warehouse: "PNQ-C", stock: 80, demand: 80 },
  { id: "P-1004", name: "Bearing 608ZZ", sku: "BRG-608-50", warehouse: "DEL-B", stock: 24, demand: 120 }
];

// Compute warehouses list
const warehouses = () => Array.from(new Set(products.map(p => p.warehouse))).sort();

// Helpers
const statusOf = (p) => {
  if (p.stock > p.demand) return 'HEALTHY';
  if (p.stock === p.demand) return 'LOW';
  return 'CRITICAL';
};

const totals = () => {
  const totalStock = products.reduce((s,p) => s + p.stock, 0);
  const totalDemand = products.reduce((s,p) => s + p.demand, 0);
  const fillNumerator = products.reduce((s,p) => s + Math.min(p.stock, p.demand), 0);
  const fillRate = totalDemand === 0 ? 100 : (fillNumerator / totalDemand) * 100;
  return { totalStock, totalDemand, fillRate };
};

// Deterministic daily kpis
const kpiTrend = (range) => {
  const { totalStock, totalDemand } = totals();
  // Deterministic "noise" seeded by product IDs
  const seed = products.map(p => p.id.charCodeAt(2)).reduce((a,b)=>a+b,0);
  const points = [];
  for (let i = range - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // use seed to create small daily variation
    const variation = ((seed + i*13) % 17) - 8; // -8..+8
    const dailyStock = Math.max(0, totalStock + variation * 2);
    const dailyDemand = Math.max(0, totalDemand + variation);
    points.push({ date: date.toISOString().slice(0,10), stock: dailyStock, demand: dailyDemand });
  }
  return points;
};

// ---------------- GraphQL ----------------
const typeDefs = gql`
  enum Status { HEALTHY LOW CRITICAL }

  type Product {
    id: ID!
    name: String!
    sku: String!
    warehouse: String!
    stock: Int!
    demand: Int!
    status: Status!
  }

  type ProductConnection {
    nodes: [Product!]!
    totalCount: Int!
  }

  type Totals {
    totalStock: Int!
    totalDemand: Int!
    fillRate: Float!
  }

  type KPIPoint {
    date: String!
    stock: Int!
    demand: Int!
  }

  type Query {
    products(search: String, warehouse: String, status: Status, offset: Int = 0, limit: Int = 10): ProductConnection!
    warehouses: [String!]!
    totals: Totals!
    kpis(range: Int!): [KPIPoint!]!
    product(id: ID!): Product
  }

  type Mutation {
    updateDemand(id: ID!, demand: Int!): Product!
    transferStock(id: ID!, toWarehouse: String!, amount: Int!): [Product!]!
  }
`;

const resolvers = {
  Product: {
    status: (p) => statusOf(p),
  },
  Query: {
    products: (_, args) => {
      const { search, warehouse, status, offset=0, limit=10 } = args;
      let filtered = [...products];
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
        );
      }
      if (warehouse) {
        filtered = filtered.filter(p => p.warehouse === warehouse);
      }
      if (status) {
        filtered = filtered.filter(p => statusOf(p) === status);
      }
      const totalCount = filtered.length;
      const nodes = filtered.slice(offset, offset + limit);
      return { nodes, totalCount };
    },
    warehouses: () => warehouses(),
    totals: () => totals(),
    kpis: (_, { range }) => kpiTrend(Math.min(Math.max(range, 1), 90)),
    product: (_, { id }) => products.find(p => p.id === id) || null,
  },
  Mutation: {
    updateDemand: (_, { id, demand }) => {
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found');
      products[idx] = { ...products[idx], demand: Math.max(0, demand) };
      return products[idx];
    },
    transferStock: (_, { id, toWarehouse, amount }) => {
      const fromIdx = products.findIndex(p => p.id === id);
      if (fromIdx === -1) throw new Error('Product not found');
      const amt = Math.max(0, amount);
      if (amt === 0) return [products[fromIdx]];

      if (products[fromIdx].stock < amt) {
        throw new Error('Insufficient stock to transfer');
      }

      // Deduct from source
      products[fromIdx] = { ...products[fromIdx], stock: products[fromIdx].stock - amt };

      // Find/create target product with same SKU at toWarehouse
      const from = products[fromIdx];
      const targetIdx = products.findIndex(p => p.sku === from.sku && p.warehouse === toWarehouse);
      if (targetIdx === -1) {
        const newId = `P-${Math.floor(1000 + Math.random()*9000)}`;
        const newProd = { id: newId, name: from.name, sku: from.sku, warehouse: toWarehouse, stock: amt, demand: from.demand };
        products.push(newProd);
        return [products[fromIdx], newProd];
      } else {
        products[targetIdx] = { ...products[targetIdx], stock: products[targetIdx].stock + amt };
        return [products[fromIdx], products[targetIdx]];
      }
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();
app.use('/graphql', expressMiddleware(server));

// In production, serve the built client
const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
});
