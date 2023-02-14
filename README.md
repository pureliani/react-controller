
# @gapu/deepstate


A small, fast and no-boilerplate state-management library for react, using hooks.

[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@gapu/deepstate@latest?style=flat-square)](https://bundlephobia.com/package/@gapu/deepstate@latest)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://github.com/pureliani/deepstate/blob/main/LICENSE) [![npm (scoped)](https://img.shields.io/npm/v/@gapu/deepstate?color=blue&style=flat-square)](https://www.npmjs.com/package/@gapu/deepstate) [![GitHub Repo stars](https://img.shields.io/github/stars/pureliani/deepstate?label=GitHub%20Stars&style=flat-square)](https://github.com/pureliani/deepstate)

## Navigation

1. [Installation](#installation-)  
2. [Description](#description)  
3. [Usage](#usage)  
   - [Basic](#basic)  
   - [Getting the state of your store from outside of react](#getting-the-state-of-your-store-from-outside-of-react)  
   - [Setting the state of your store from outside of react](#setting-the-state-of-your-store-from-outside-of-react)  
   - [Subscribing to changes in a store from outside of react](#subscribing-to-changes-in-a-store-from-outside-of-react)  
   - [Server side state initialization ( Next.js )](#server-side-state-initialization--nextjs-)
4. [Plugins](#plugins)  
   - [Persisting state with the 'persist' plugin](#persisting-state-with-the-persist-plugin)
   - [Sharing state between browser tabs with the 'broadcast' plugin](#sharing-state-between-browser-tabs-with-the-broadcast-plugin)
   - [Using both persist and broadcast in conjunction](#sharing-state-between-browser-tabs-with-the-broadcast-plugin)
5. [Planned Features](#planned-features)

## Installation ⚡

> **Warning**  
> deepstate only supports react version >= 16.8.0

```shell
npm install @gapu/deepstate
```

## Description
deepstate is a state-management library which is aimed at making nested state managemenet easier.

> **Note**  
> **This library is still in development** and i'm planning on adding features such as: Asynchronous state initialization, SSR support, State Synchronization between browser tabs and redux devtools integration.  
>  
> Version 1.0.0 will be released only after the planned features are implemented and the remaining bugs are fixed. 
>  
> Collaborators are welcome ❤  
>
> If you come across an issue please report it on our github issues page: https://github.com/pureliani/deepstate/issues 

## Usage

When working with a nested state, unlike other state management libraries, you are only concerned with the field that you are accessing.  

### Basic
> **Note**  
> **Context providers are not needed.**
```tsx
import { create } from '@gapu/deepstate'

const { useSelector } = create({
    a: {
        b: 42,
        c: 1
    },
    d: 2
})

// useSelector takes a selector function as an argument which will subscribe the
//  component to changes on that specific field. Now, the "Counter" component
//  will only rerender when the state.a.b changes. Changing state.a.c or state.d
//  will not trigger a rerender of this component.
export const Counter = () => {
    const [value, setValue] = useSelector(state => state.a.b)
    return (
        <div>
            <h3>Count {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

### Getting the state of your store from outside of react

```tsx
import { create } from '@gapu/deepstate'

const { getState, useSelector } = create({ count: 1 })

// you can get the current state of your store 
// by calling the 'getState' function.
const currentState = getState()

console.log(currentState) // { count: 1 }

export const Counter = () => {
    const [value, setValue] = useSelector(state => state.count)
    return (
        <div>
            <h3>Count {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

### Setting the state of your store from outside of react

```tsx
import { create } from '@gapu/deepstate'

const { setState, getState, useSelector } = create({ count: 1 })

// you can also set the current state of your store 
// by calling the 'setState' function.
setState({ count: 42 })
console.log(getState()) // { count: 42 }

export const Counter = () => {
    const [value, setValue] = useSelector(state => state.count)
    return (
        <div>
            <h3>Count {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

### Subscribing to changes in a store from outside of react

```tsx
import { create } from '@gapu/deepstate'

const { useSelector, subscribe } = create({ count: 1 })

// Subscribe function takes a callback as an argument which will be executed 
// whenever any state change happens. it also returns an 'unsubscribe' function
// which you can call if you wish to stop listening to changes.
// The callback will receive the updated state as an argument.
const unsubscribe = subscribe((newState) => {
    console.log(newState)
})

export const Counter = () => {
    const [value, setValue] = useSelector(state => state.count)
    return (
        <div>
            <h3>Count {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

### Server side state initialization ( Next.js )

```tsx
import { InferGetServerSidePropsType } from 'next'
import { create } from "@gapu/deepstate";


// Create the state like usual and extract 'ServerSideStateProvider' and
// 'initServerState' fields.
export const { ServerStateProvider, initServerState, useSelector } = create({
  count: -57
})


// fetch the initial data for the store.
export const getServerSideProps = () => {
  return {
    props: {
      initialState: {
        count: 1_000_000
      }
    }
  }
}

export default function Home(
  { initialState }: InferGetServerSidePropsType<typeof getServerSideProps>) {

  // **IMPORTANT** you should call this function before any 'useSelector'
  initServerState(initialState)

  // After calling 'initServerState' you can safely call 'useSelector'
  // functions
  const [count, setCount] = useSelector(state => state.count) // 1_000_000

  // Sadly we still have to rely on context providers in the case of SSR.
  return (
    <ServerStateProvider state={initialState}>
      <div>
        <h3>Count is {count}</h3>
        <button onClick={() => setCount(current => current + 1)}>+ 1</button>
        <button onClick={() => setCount(current => current - 1)}>- 1</button>
      </div>
    </ServerStateProvider>
  )
}
```

## Plugins
Currently we have only two plugins: persist and broadcast.  

### Persisting state with the 'persist' plugin
```tsx
import { create, persist } from '@gapu/deepstate'

// This state will be persisted in localStorage on the key 'localStorageKeyName'
// before using this middleware make sure the data is serializable 
// (is a valid JSON), otherwise data might be lost during internal 
// stringification.
const { useSelector } = create({
    a: 1,
    b: {
        c: 2
    }
}, [persist('localStorageKeyName')])

export const Counter = () => {
    const [value, setValue] = useSelector((state) => state.a)
    return (
        <div>
            <h3>Count: {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

### Sharing state between browser tabs with the 'broadcast' plugin
```tsx
import { create, broadcast } from '@gapu/deepstate'

// This state will be shared between browser tabs via BroadcastChannels on the
// 'broadcastChannelName' channel. please make sure your state can be cloned 
// via the 'structuredClone' function. otherwise data might be lost /
// application might crash.
const { useSelector } = create({
    a: 1,
    b: {
        c: 2
    }
}, [broadcast('broadcastChannelName')])

export const Counter = () => {
    const [value, setValue] = useSelector((state) => state.a)
    return (
        <div>
            <h3>Count: {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

### Using both persist and broadcast in conjunction

```tsx
import { create, persist, broadcast } from '@gapu/deepstate'

// This state will be shared between browser tabs via BroadcastChannels on the
// 'broadcastChannelName' channel, data will also persisted in localStorage on
// the key 'localStorageKeyName', please make sure your data can be
// deeply cloned via the 'structuredClone' and is also serializable
// (is a valid JSON)
const { useSelector } = create({
    a: 1,
    b: {
        c: 2
    }
}, [persist('localStorageKeyName'), broadcast('broadcastChannelName')])

export const Counter = () => {
    const [value, setValue] = useSelector((state) => state.a)
    return (
        <div>
            <h3>Count: {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

## Planned features  
1. Callback state initialization  
2. Asynchronous state initialization  
