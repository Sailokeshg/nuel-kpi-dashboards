import React from 'react'
import { render, screen } from '@testing-library/react'
import KPICard from '../KPICard'

test('KPICard displays label and value', () => {
  render(<KPICard label="Total Stock" value={123} />)
  expect(screen.getByText('Total Stock')).toBeInTheDocument()
  expect(screen.getByText('123')).toBeInTheDocument()
})
