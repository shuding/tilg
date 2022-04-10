# `useTilg`

**Tiny Logger** is a magical React Hook to help you debug your components.

You can quickly try out the [**demo**](https://codesandbox.io/s/usetilg-3kdtz8?file=/src/App.js:274-359).

<br/>

## Table of Contents

- [Installation](#installation)
- [Features](#features)
  - [Lifecycle Events (What)](#1-lifecycle-events-what)
  - [Component Name and Props (Who)](#2-component-name-and-props-who)
  - [Debug Message (Why)](#3-debug-message-why)
  - [What Has Changed? (Why)](#4-what-has-changed-why)
  - [Quick Logs (Why)](#5-quick-logs-why)
- [Advanced Features](#advanced-features)
  - [Markdown](#markdown)
  - [Return Original Value](#return-original-value)
  - [Auto Deduplication](#auto-deduplication)
  - [CLI Support](#cli-support)
- [FAQ & Caveats](#faq--caveats)

<br/>

## Installation

The package is released as `tilg`, use:

```sh
npm i tilg
```

to install it with npm. Or you can choose another package manager.

<br/>

## Features

### 1. Lifecycle Events (What)

Simply insert the `useTilg()` hook into the component, and it will log the **render**, **mount**, **unmount** events in the console:

```jsx
import useTilg from 'tilg'

function MyButton() {
  useTilg()
  return <button>Click me</button>
}
```

<p align=center>
  <img width="650" alt="lifecycle event logs" src="/screenshots/life-cycle-events.png">
  <br/>
  <i>Logs of render and mount events.</i>
</p>


### 2. Component Name and Props (Who)

You might noticed that it also displays the **name** and **props** of the component, which is very helpful for debugging.

```jsx
import useTilg from 'tilg'

function MyButton({ text }) {
  useTilg()
  return <button>{text}</button>
}

function Title({ children }) {
  useTilg()
  return <h1>{children}</h1>
}

export default function Page() {
  return (
    <>
      <Title>Welcome!</Title>
      <MyButton text='foo' />
      <MyButton text='bar' />
    </>
  )
}
```

When there’re multiple elements of the same component being rendered, it adds a counter `<MyButton/> (2)` for distinguishing so you know **who** is logging the information:

<p align=center>
  <img width="650" alt="information logs" src="/screenshots/info.png">
  <br/>
  <i>Information of the logged components.</i>
</p>


### 3. Debug Message (Why)

Another critical thing is to know why does a component re-renders. `useTilg` gives you a simple but powerful API for this:

```jsx
import { useState } from 'react'
import useTilg from 'tilg'

function Counter() {
  const [count, setCount] = useState(0)
  
  useTilg()`count = ${count}`
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

When appending a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) to the `useTilg()` call, it will also be displayed as the debug message:

```jsx
useTilg()`count = ${count}`
```

<p align=center>
  <img width="650" alt="debug message" src="/screenshots/message.gif">
  <br/>
  <i>Logs of “count = ?”.</i>
</p>

You can know where the message is from, too:

<p align=center>
  <img width="650" alt="trace" src="/screenshots/trace.png">
  <br/>
  <i>Trace of the message and a link to the code location.</i>
</p>

### 4. What Has Changed? (Why)

Something troubles me a lot when debugging a component is, it’s sometimes hard to know which state has changed and triggered a re-render. `useTilg` tracks all the arguments in the debug message and tells you **which one has changed since the previous render**:

```jsx
import { useState } from 'react'
import useTilg from 'tilg'

function MyApp() {
  const [input, setInput] = useState('')
  const [count, setCount] = useState(0)

  useTilg()`input = ${input}, count = ${count}`

  return (
    <>
      <input onChange={(e) => setInput(e.target.value)} value={input} />
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </>
  )
}
```

<p align=center>
  <img width="650" alt="changed argument" src="/screenshots/changed.png">
  <br/>
  <i>A hint for the updated part.</i>
</p>


### 5. Quick Logs (Why)

If you don't need a debug message but only want to quickly log some values, just pass them to the hook directly:

```jsx
import { useState } from 'react'
import useTilg from 'tilg'

function MyApp() {
  const [input, setInput] = useState('')
  const [count, setCount] = useState(0)

  useTilg(input, count)

  return (
    <>
      <input onChange={(e) => setInput(e.target.value)} value={input} />
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </>
  )
}
```

<p align=center>
  <img width="650" alt="value without message" src="/screenshots/bare.png">
  <br/>
  <i>Debug values quickly.</i>
</p>


<br/>

## Advanced Features

### Markdown

You can use Markdown's code (`` ` ``), italic (`_` or `*`), and bold (`__` or `**`) syntax in your debug message to make it look nicer:

```jsx
function MyApp() {
  const [count, setCount] = useState(0)

  useTilg()`**Debug**: \`count\` = _${count}_.`

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

<p align=center>
  <img width="650" alt="markdown syntax" src="/screenshots/markdown.png">
  <br/>
  <i>Markdown syntax in log messages.</i>
</p>


### Return Original Value

The `useTilg()` hook also returns its **first argument**, or the **first value** in the template if specified, so you can quickly debug something in-place by wrapping it with `useTilg()`:

```diff
  function MyApp() {
    const [count, setCount] = useState(0)

    return <button onClick={() => setCount(count + 1)}>{
+     useTilg(count)
    }</button>
  }
```


<p align=center>
  <img width="650" alt="return original value" src="/screenshots/return-value.png">
  <br/>
  <i>Log and return the original value.</i>
</p>


### Auto Deduplication

Even if you have multiple `useTilg()` hooks in the same component, the lifecycle events will only be logged once per component:

```jsx
function MyApp() {
  const [input, setInput] = useState('')
  const [count, setCount] = useState(0)

  useTilg()
  useTilg()`input = ${input}`
  useTilg()`count = ${count}`

  return (
    <>
      <input onChange={(e) => setInput(e.target.value)} value={input} />
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </>
  )
}
```

<p align=center>
  <img width="650" alt="deduplication" src="/screenshots/deduplication.png">
  <br/>
  <i>Render, mount, and unmount events will not be duplicated even if you have multiple useTilg() hooks.</i>
</p>

### CLI Support

If you are running your component during SSR, or running server-side tests, `useTilg()` properly outputs the result in Node.js CLI too:

```jsx
function App() {
  const [count, setCount] = useState(42)
  
  useTilg()`The answer is ${{ answer: count }}`

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

<p align=center>
  <img width="962" alt="deduplication" src="/screenshots/cli.png">
  <br/>
  <i>Node.js CLI output.</i>
</p>

<br/>

## FAQ & Caveats

- **Is it safe to ship code with `useTilg` to production?**  
  Although `useTilg()` does nothing in a production build (`process.env.NODE_ENV === 'production'`) but only an empty function, I encourge you to remove the hook from the source code after finishing development your component.

- **How do you implement this hook? What can I learn from the code?**  
  It is very hacky. Don't rely on it or try it in production, or [you will be fired](https://github.com/facebook/react/blob/0568c0f8cde4ac6657dff9a5a8a7112acc35a748/packages/react/index.js#L35).
  
- **Why not design the API as `` useTilg`message` ``?**  
  Then it will not be identified as a hook, React Refresh and HMR will not work correctly.

<br/>

## License

The MIT License (MIT).
