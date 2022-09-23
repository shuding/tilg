import React from 'react'
import { act, create } from 'react-test-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'

import useTilg from '../src/development'

describe('useTilg', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should log the render, mount and unmount events', async () => {
    const logSpy = vi.spyOn(console, 'log')

    function App() {
      useTilg()
      return null
    }
    const app = create(<App />)
    app.toJSON()
    act(() => app.unmount())

    expect(logSpy.mock.calls[0][0]).toEqual(
      '\x1B[96m\x1B[1m<App/>\x1B[39m\x1B[22m rendered with props: \x1B[96m\x1B[1m%o\x1B[39m\x1B[22m.',
    )
    expect(logSpy.mock.calls[0][1]).toEqual({})
    expect(logSpy.mock.calls[1][0]).toEqual(
      '\x1B[96m\x1B[1m<App/>\x1B[39m\x1B[22m mounted.',
    )
    expect(logSpy.mock.calls[2][0]).toEqual(
      '\x1B[96m\x1B[1m<App/>\x1B[39m\x1B[22m unmounted.',
    )
  })

  it('should log the message', async () => {
    const logSpy = vi.spyOn(console, 'log')

    function App() {
      useTilg()`The we we are`
      return null
    }
    const app = create(<App />)
    app.toJSON()
    act(() => app.unmount())

    expect(logSpy.mock.calls[1][0]).toContain('The we we are')
  })

  it('should log number arguments', async () => {
    const logSpy = vi.spyOn(console, 'log')

    function App() {
      useTilg()`The answer is ${42}`
      return null
    }
    const app = create(<App />)
    app.toJSON()
    act(() => app.unmount())

    expect(logSpy.mock.calls[1][0]).toContain('The answer is 42')
  })

  it('should log string arguments', async () => {
    const logSpy = vi.spyOn(console, 'log')

    function App() {
      useTilg()`The answer is ${'42'}`
      return null
    }
    const app = create(<App />)
    app.toJSON()
    act(() => app.unmount())

    expect(logSpy.mock.calls[1][0]).toContain('The answer is "42"')
  })

  it('should log object arguments', async () => {
    const logSpy = vi.spyOn(console, 'log')

    function App() {
      useTilg()`The answer is ${{ answer: 42 }}`
      return null
    }
    const app = create(<App />)
    app.toJSON()
    act(() => app.unmount())

    expect(logSpy.mock.calls[1][0]).toContain('The answer is %o')
    expect(logSpy.mock.calls[1][1]).toEqual({ answer: 42 })
  })

  describe('props', () => {
    it('should log props', async () => {
      const logSpy = vi.spyOn(console, 'log')

      function App({ answer }) {
        useTilg()
        return answer
      }
      const app = create(<App answer={42} />)
      app.toJSON()
      act(() => app.unmount())

      expect(logSpy.mock.calls[0][1]).toEqual({ answer: 42 })
    })

    it('should log props updates', async () => {
      const logSpy = vi.spyOn(console, 'log')

      function App({ answer }) {
        useTilg()
        return answer
      }
      const app = create(<App answer={42} />)
      app.toJSON()
      act(() => app.update(<App answer={43} />))
      act(() => app.unmount())

      expect(logSpy.mock.calls[0][1]).toEqual({ answer: 42 })
      expect(logSpy.mock.calls[2][1]).toEqual({ answer: 43 })
    })
  })
})
