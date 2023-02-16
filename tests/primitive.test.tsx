import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { create } from '../src/create'

const { useSelector } = create(0)

global.structuredClone = (v: unknown) => JSON.parse(JSON.stringify(v))

const TestComponent = () => {
  const [count, setCount] = useSelector()
  return <div>
    <div data-testid='counter'>Count: {count}</div>
    <button data-testid="+" onClick={() => setCount(current => current + 1)}>+ 1</button>
    <button data-testid="-" onClick={() => setCount(current => current - 1)}>- 1</button>
    <button data-testid="set:1000" onClick={() => setCount(1000)}>= 1000</button>
  </div>
}

test('Changes count based on current count', async () => {
  const { getByTestId } = render(<TestComponent />)
  const counter = getByTestId('counter')
  const plus = getByTestId('+')
  const minus = getByTestId('-')
  await waitFor(() => {
    fireEvent(plus, new Event('click', { bubbles: true }))
    fireEvent(plus, new Event('click', { bubbles: true }))
    fireEvent(plus, new Event('click', { bubbles: true }))
    expect(counter.innerHTML).toBe('Count: 3')
    fireEvent(minus, new Event('click', { bubbles: true }))
    fireEvent(minus, new Event('click', { bubbles: true }))
    fireEvent(minus, new Event('click', { bubbles: true }))
    fireEvent(minus, new Event('click', { bubbles: true }))
    fireEvent(minus, new Event('click', { bubbles: true }))
    expect(counter.innerHTML).toBe('Count: -2')
  })
})

test('Sets the count to a specific number', async () => {
  const { getByTestId } = render(<TestComponent />)
  const counter = getByTestId('counter')
  const equalsThousand = getByTestId('set:1000')
  await waitFor(() => {
    fireEvent(equalsThousand, new Event('click', { bubbles: true }))
    expect(counter.innerHTML).toBe('Count: 1000')
  })
})
