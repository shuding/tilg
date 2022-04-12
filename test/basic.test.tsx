import React from 'react'
import { act, create } from 'react-test-renderer'
import { describe, expect, it } from 'vitest'

import { spyConsole } from './utils'

import useTilg from '../src/development'

describe('useTilg', () => {
  it('should log the render, mount and unmount events', async () => {
    const [logs, reset] = spyConsole()

    function App() {
      useTilg()
      return null
    }
    const app = create(<App />)
    app.toJSON()
    act(() => app.unmount())
    reset()

    expect(logs[0][0]).toEqual(
      '\x1B[96m\x1B[1m<App/>\x1B[39m\x1B[22m rendered with props: \x1B[96m\x1B[1m%o\x1B[39m\x1B[22m.'
    )
    expect(logs[0][1]).toEqual({})
    expect(logs[1][0]).toEqual('\x1B[96m\x1B[1m<App/>\x1B[39m\x1B[22m mounted.')
    expect(logs[2][0]).toEqual(
      '\x1B[96m\x1B[1m<App/>\x1B[39m\x1B[22m unmounted.'
    )
  })

  it('should log the message', async () => {
    const [logs, reset] = spyConsole()

    function App() {
      useTilg()`The we we are`
      return null
    }
    const app = create(<App />)
    app.toJSON()
    act(() => app.unmount())
    reset()

    expect(logs[1][0]).toContain('The we we are')
  })

  it('should log number arguments', async () => {
    const [logs, reset] = spyConsole()

    function App() {
      useTilg()`The answer is ${42}`
      return null
    }
    const app = create(<App />)
    app.toJSON()
    act(() => app.unmount())
    reset()

    expect(logs[1][0]).toContain('The answer is 42')
  })

  it('should log string arguments', async () => {
    const [logs, reset] = spyConsole()

    function App() {
      useTilg()`The answer is ${'42'}`
      return null
    }
    const app = create(<App />)
    app.toJSON()
    act(() => app.unmount())
    reset()

    expect(logs[1][0]).toContain('The answer is "42"')
  })

  it('should log object arguments', async () => {
    const [logs, reset] = spyConsole()

    function App() {
      useTilg()`The answer is ${{ answer: 42 }}`
      return null
    }
    const app = create(<App />)
    app.toJSON()
    act(() => app.unmount())
    reset()

    expect(logs[1][0]).toContain('The answer is %o')
    expect(logs[1][1]).toEqual({ answer: 42 })
  })

  describe('props', () => {
    it('should log props', async () => {
      const [logs, reset] = spyConsole()

      function App({ answer }) {
        useTilg()
        return answer
      }
      const app = create(<App answer={42} />)
      app.toJSON()
      act(() => app.unmount())
      reset()

      expect(logs[0][1]).toEqual({ answer: 42 })
    })

    it('should log props updates', async () => {
      const [logs, reset] = spyConsole()

      function App({ answer }) {
        useTilg()
        return answer
      }
      const app = create(<App answer={42} />)
      app.toJSON()
      act(() => app.update(<App answer={43} />))
      act(() => app.unmount())
      reset()

      expect(logs[0][1]).toEqual({ answer: 42 })
      expect(logs[2][1]).toEqual({ answer: 43 })
    })
  })
})
