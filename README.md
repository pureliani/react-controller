
# @gapu/react-controller


A small, fast and no-boilerplate state-management library for react, using hooks.

[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@gapu/react-controller?style=flat-square)](https://bundlephobia.com/package/@gapu/react-controller@latest)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://github.com/pureliani/react-controller/blob/main/LICENSE) [![npm (scoped)](https://img.shields.io/npm/v/@gapu/react-controller?color=blue&style=flat-square)](https://www.npmjs.com/package/@gapu/react-controller)

## Installation ⚡

> **Warning**  
> react-controller only supports react version >= 16.8.0

```shell
npm install @gapu/react-controller
```

## Description
react-controller is a state-management library which is aimed at making nested state managemenet easier.

> **Note**  
> **This library is still in development** and i'm planning on adding features such as: Asynchronous state initialization, SSR support, State Synchronization between browser tabs and redux devtools integration.  
>  
> Version 1.0.0 will be released only after the planned features are implemented and the remaining bugs are fixed. 
>  
> Collaborators are welcome ❤  
>
> If you come across an issue please report it on our github issues page: https://github.com/pureliani/react-controller/issues 

## Usage

When working with a nested state, unlike other state management libraries, you are only concerned with the field that you are accessing.  

> **Note**  
> **Context providers are not needed.**
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
// rerender of this component.
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
