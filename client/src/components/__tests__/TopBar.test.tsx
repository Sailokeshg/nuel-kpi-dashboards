import React from 'react'
import { render, screen } from '@testing-library/react'
import TopBar from '../TopBar'

test('renders topbar and range buttons', () => {
  render(<TopBar range={7} onRangeChange={()=>{}} />)
  expect(screen.getByText('SupplySight')).toBeInTheDocument()
  expect(screen.getByText('7d')).toBeInTheDocument()
  expect(screen.getByText('14d')).toBeInTheDocument()
  expect(screen.getByText('30d')).toBeInTheDocument()
})
