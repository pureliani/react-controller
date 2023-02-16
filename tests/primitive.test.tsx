import React from 'react'
import { screen, render }from '@testing-library/react'

test('renders a div', () => {
  render(<div>hello world</div>)
  expect(screen.getByText('hello world')).toBeTruthy()
})
