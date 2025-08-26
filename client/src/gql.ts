
import { gql } from '@apollo/client'

export const QUERY_WAREHOUSES = gql`
  query Warehouses {
    warehouses
  }
`

export const QUERY_TOTALS = gql`
  query Totals {
    totals {
      totalStock
      totalDemand
      fillRate
    }
  }
`

export const QUERY_KPIS = gql`
  query Kpis($range: Int!) {
    kpis(range: $range) {
      date
      stock
      demand
    }
  }
`

export const QUERY_PRODUCTS = gql`
  query Products($search: String, $warehouse: String, $status: Status, $offset: Int, $limit: Int) {
    products(search: $search, warehouse: $warehouse, status: $status, offset: $offset, limit: $limit) {
      totalCount
      nodes {
        id
        name
        sku
        warehouse
        stock
        demand
        status
      }
    }
  }
`

export const QUERY_PRODUCT = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      name
      sku
      warehouse
      stock
      demand
      status
    }
  }
`

export const MUTATION_UPDATE_DEMAND = gql`
  mutation UpdateDemand($id: ID!, $demand: Int!) {
    updateDemand(id: $id, demand: $demand) {
      id
      demand
      stock
      status
    }
  }
`

export const MUTATION_TRANSFER_STOCK = gql`
  mutation TransferStock($id: ID!, $toWarehouse: String!, $amount: Int!) {
    transferStock(id: $id, toWarehouse: $toWarehouse, amount: $amount) {
      id
      warehouse
      stock
      demand
      status
    }
  }
`
