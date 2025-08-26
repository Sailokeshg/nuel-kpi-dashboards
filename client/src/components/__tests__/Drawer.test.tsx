import React from 'react'
import { render, screen } from '@testing-library/react'
import Drawer from '../Drawer'
import { MockedProvider } from '@apollo/client/testing'

test('Drawer renders closed without crashing', () => {
  render(
    <MockedProvider>
      <Drawer id={null} onClose={()=>{}} onChanged={()=>{}} />
    </MockedProvider>
  )
  // nothing visible when closed; ensure component mounts
  expect(true).toBeTruthy()
})
