
# @gapu/react-controller

A small, fast and no-boilerplate state-management library for react, using hooks.

[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@gapu/react-controller?style=flat-square)](https://bundlephobia.com/package/@gapu/react-controller@latest)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://github.com/pureliani/react-controller/blob/main/LICENSE) [![npm (scoped)](https://img.shields.io/npm/v/@gapu/react-controller?color=blue&style=flat-square)](https://www.npmjs.com/package/@gapu/react-controller)

## Installation

```shell
npm install @gapu/react-controller
```

## Description
react-controller is a state-management library which is aimed at making the nested state managemenet easier.

## Usage

When working with a nested state, unlike other state management libraries, you are only concerned with the field that you are accessing.

```tsx
// Counter.tsx

import { create } from '@gapu/react-controller'

const useCounter = create({
    a: {
        b: 42,
        c: 1
    },
    d: 2
})

// useCounter takes a selector as an argument which will subscribe the component
// to changes on that specific field. Now, the "Counter" component will only rerender 
// when the state.a.b changes. Changing state.a.c or state.d will not trigger a
// rerender for of component.
export const Counter = () => {
    const { value, setValue } = useCounter(state => state.a.b)

    return (
        <div>
            <h3>Count {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
        </div>
    )
}
```
