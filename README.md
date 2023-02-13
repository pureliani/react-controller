
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
import { create } from '@gapu/react-controller'

const { useSelector } = create({
    a: {
        b: 42,
        c: 1
    },
    d: 2
})

// useSelector takes a selector function as an argument which will subscribe the component
// to changes on that specific field. Now, the "Counter" component will only rerender 
// when the state.a.b changes. Changing state.a.c or state.d will not trigger a
// rerender of this component.
export const Counter = () => {
    const { value, setValue } = useSelector(state => state.a.b)
    return (
        <div>
            <h3>Count {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

## Subscribing to changes in a store from outside of react

```tsx
import { create } from '@gapu/react-controller'

const { useSelector, subscribe } = create({ count: 1 })

// Subscribe function takes a callback as an argument which will be executed 
// whenever any state change happens. it also returns an 'unsubscribe' function
// which you can call if you wish to stop listening to changes.
// The callback will receive the updated state as an argument.
const unsubscribe = subscribe((newState) => {
    console.log(newState)
})

export const Counter = () => {
    const { value, setValue } = useSelector(state => state.count)
    return (
        <div>
            <h3>Count {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

## Getting the current state of your store from outside of react.

```tsx
import { create } from '@gapu/react-controller'

const { getState, useSelector } = create({ count: 1 })

// you can get the current state of your store by calling the 'getState' function.
const currentState = getState()

console.log(currentState) // { count: 1 }

export const Counter = () => {
    const { value, setValue } = useSelector(state => state.count)
    return (
        <div>
            <h3>Count {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

## Setting the current state of your store from outside of react.

```tsx
import { create } from '@gapu/react-controller'

const { setState, getState, useSelector } = create({ count: 1 })

// you can also set the current state of your store by calling the 'setState' function.
setState({ count: 42 })
console.log(getState()) // { count: 42 }

export const Counter = () => {
    const { value, setValue } = useSelector(state => state.count)
    return (
        <div>
            <h3>Count {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

> **Note**  
> Planned new features:  
> A middleware for state sharing between tabs via 'BroadcastChannel'  
> A middleware for persistance via 'localStorage'