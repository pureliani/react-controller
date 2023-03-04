
# @gapu/react-controller


A small, fast and no-boilerplate state-management library for react, using hooks.

[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@gapu/react-controller@latest?style=flat-square)](https://bundlephobia.com/package/@gapu/react-controller@latest)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://github.com/pureliani/react-controller/blob/main/LICENSE) [![npm (scoped)](https://img.shields.io/npm/v/@gapu/react-controller?color=blue&style=flat-square)](https://www.npmjs.com/package/@gapu/react-controller) [![GitHub Repo stars](https://img.shields.io/github/stars/pureliani/react-controller?label=GitHub%20Stars&style=flat-square)](https://github.com/pureliani/react-controller)

## Navigation

1. [Installation](#installation-)  
2. [Description](#description)  
3. [Usage](#usage)  
   - [Primitive state](#primitive-state)  
   - [Nested state](#nested-state)  
   - [Asynchronous actions](#asynchronous-actions)
   - [Initializing state with a callback](#initializing-state-with-a-callback)
   - [Getting the state from outside of react](#getting-the-state-from-outside-of-react)  
   - [Setting the state from outside of react](#setting-the-state-from-outside-of-react)  
   - [Subscribing to changes](#subscribing-to-changes)  
   - [Server side state initialization ( Next.js )](#server-side-state-initialization--nextjs-)
4. [Plugins](#plugins)  
   - [Persisting state with the 'persist' plugin](#persisting-state-with-the-persist-plugin)
   - [Sharing state between browser tabs with the 'broadcast' plugin](#sharing-state-between-browser-tabs-with-the-broadcast-plugin)
   - [Using both persist and broadcast in conjunction](#sharing-state-between-browser-tabs-with-the-broadcast-plugin)
   - [Custom plugins](#custom-plugins)

## Installation ⚡

> **Warning**  
> react-controller only supports react version >= 16.8.0

```shell
npm install @gapu/react-controller
```

## Description
react-controller is a state-management library which is aimed at making nested state managemenet easier.

> **Note**  
> **This library is still in development**
>  
> Collaborators are welcome ❤  
>
> If you come across an issue please report it on our github issues page: https://github.com/pureliani/react-controller/issues 

## Usage

> **Note**  
> **Context providers are not needed.**

### Primitive state

```tsx
import { create } from '@gapu/react-controller'

const { useSelector } = create(11)

export const Counter = () => {

    // useSelector usually takes a selector function as an argument but
    // in this case we don't really need it since we are working with
    // a primitive store, not passing a selector will select the root of the
    // store by default, in this case: 11
    const [value, setValue] = useSelector()

    return (
        <div>
            <h3>Count: {value}</h3>
            <button onClick={() => setValue(current => current + 1)}>+ 1</button>
            <button onClick={() => setValue(current => current - 1)}>- 1</button>
        </div>
    )
}
```

### Nested state

When working with a nested state, unlike other state management libraries, you are only concerned with the field that you are accessing.  

```tsx
import { create } from '@gapu/react-controller'

const { useSelector } = create({
    a: {
        b: 42,
        c: 1
    },
    d: 2
})

// useSelector takes a selector function as an argument which will subscribe the
// component to changes on that specific field. Now, the "Counter" component
// will only rerender when the state.a.b changes. Changing state.a.c or state.d
// will not trigger a rerender of this component.
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

### Asynchronous actions

```tsx
import { create } from '@gapu/react-controller'

// Mock API call
const getRandomRemoteNumber = (): Promise<number> => {
  return new Promise((res) => {
    setTimeout(() => {
      res(Math.floor(Math.random()*1000))
    },  1 * 1000)
  })
} 

const { useSelector } = create({ count: 1 })

function App() {
  const [count, setCount] = useSelector(state => state.count)

  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => setCount(async () => {
        // if an error gets thrown or a promise gets rejected, state will not
        // get updated.
        const newNumber = await getRandomRemoteNumber()

        return newNumber
      })}>
        get random remote number
      </button>
    </div>
  )
}

export default App
```

### Initializing state with a callback

```tsx
import { create } from "@gapu/react-controller"

const { useSelector } = create(() => {
  return { a: { b: { c: 5 } } }
})

export default function App() {
  const [count, setCount] = useSelector(state => state.a.b.c)
  return (
    <div>
      <div>Count is: {count}</div>
      <button onClick={() => {setCount(current => current + 1)}}>+ 1</button>
      <button onClick={() => {setCount(current => current - 1)}}>- 1</button>
    </div>
  )
}
```


### Getting the state from outside of react

```tsx
import { create } from '@gapu/react-controller'

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

### Setting the state from outside of react

```tsx
import { create } from '@gapu/react-controller'

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

### Subscribing to changes

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
import { create } from '@gapu/react-controller'
import { InferGetServerSidePropsType } from 'next'

const { initServerState, useSelector } = create({ a: { b: 1 } })

export const getServerSideProps = () => {
  return {
    props: {
      // ** NOTE ** this must have the same structure as the store
      initialState: {
        a: {
          b: 88
        }
      }
    }
  }
}

export default function Home({ initialState }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // ** IMPORTANT ** call this function before any 'useSelector'
  initServerState(initialState)

  const [count, setCount] = useSelector(state => state.a.b)
  return (
    <div>
      <h3>Count is {count}</h3>
      <button onClick={() => setCount(current => current + 1)}>+ 1</button>
      <button onClick={() => setCount(current => current - 1)}>- 1</button>
    </div>
  )
}
```

## Plugins
Currently we have only two plugins: persist and broadcast.  

### Persisting state with the 'persist' plugin
```tsx
import { create, persist } from '@gapu/react-controller'

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
import { create, broadcast } from '@gapu/react-controller'

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
import { create, persist, broadcast } from '@gapu/react-controller'

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

### Custom plugins

```tsx
import { create, Plugin } from '@gapu/react-controller'

// 'myLoggerPlugin' function will be invoked ONLY ONCE and 
// as soon as the 'storeAPI' gets created.
// you will need to pass a name to this plugin even if you dont need it.
const myLoggerPlugin: Plugin = (name) => (storeAPI) => {
  const {
    //Get the root state of the store
    getState, 
    
    // Set the root state of the store
    // This will not cause a rerender, if you want to do that, call the
    // 'notify' function with 'internal' as an argument right after setting the
    // state, e.g: notify(['internal'])
    setState,

    // notify(['internal']) - rerender components which are using the 
    // 'useSelector' hook, (rerender will only happen if the returned value from 
    // selector is different from the previous render as compared by Object.is )
    
    // notify(['channel']) - trigger the channel subscribers ( used by the
    // broadcast plugin ). 

    // notify(['external']) - trigger subscribers
    // e.g: subscribe((newState) => {console.log(newState)})
    notify,
    
    // This is used by react itself so we don't really need to touch this
    subscribeInternal,

    // Same as the 'subscribe' method returned by the 'create' function
    subscribeExternal,
    
    // Used by the 'broadcast' plugin, most likely you don't need this
    subscribeChannel
  } = storeAPI


  subscribeExternal((state) => {
      console.log(state)
  })
} 

const { useSelector } = create({ count: 1 }, [myLoggerPlugin('my-plugin')])


function App() {
  const [count, setCount] = useSelector(state => state.count)
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => setCount(current => current + 1)}>
        + 1
      </button>
      <button onClick={() => setCount(current => current - 1)}>
        - 1
      </button>
    </div>
  )
}

export default App
```
