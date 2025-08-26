import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductsTable from '../ProductsTable'

test('ProductsTable shows empty state and pagination', () => {
  render(<ProductsTable loading={false} error={undefined} data={[]} totalCount={0} page={1} setPage={()=>{}} totalPages={1} onRowClick={()=>{}} />)
  expect(screen.getByText('No products match your filters.')).toBeInTheDocument()
  expect(screen.getByText('Total: 0')).toBeInTheDocument()
})
