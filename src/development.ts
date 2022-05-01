// Created by Shu Ding (shud.in).

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'

function inIframe() {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

const IS_BROWSER = 
  typeof window !== 'undefined' && 
  window.navigator.product === 'Gecko'
const IS_UNSUPPORTED_CONSOLE =
  IS_BROWSER &&
  /(\.stackblitz\.io|\.csb\.app)$/.test(location.host) &&
  inIframe()

/**
 * This function is a `console.log` formatter with a subset of Markdown syntax
 * support, for both browser and CLI:
 */
const SEPARATOR = /[-–—!$%^&*()_+|~=`{}\[\]:\/\\"'“”‘’;<>?,.@#\s\n\t\r]$/
function md(strings, args = [], hints = {}, trace = '') {
  const disableStyling =
    IS_UNSUPPORTED_CONSOLE &&
    args.some((arg) => {
      return typeof arg === 'function' || (arg && typeof arg === 'object')
    })

  let tokens: Record<string, boolean> = {}
  let formatted = ''
  let char = ''

  const result = []
  const styles = []

  function setStylesAndFormatted(
    type: string,
    value: string,
    tokenType: boolean
  ) {
    if (!disableStyling) {
      if (IS_BROWSER) {
        if (formatted.endsWith('%c')) {
          styles[styles.length - 1] += value
        } else {
          formatted += '%c'
          styles.push(value)
        }
      } else {
        formatted += value
      }
    }
    tokens[type] = tokenType
    char = undefined
  }

  function checkNextOrPrev(value: string | undefined) {
    return typeof value === 'undefined' || SEPARATOR.test(value)
  }

  function process(
    type: string,
    open: string,
    close: string,
    next?: string | undefined,
    prev?: string | undefined
  ) {
    if (tokens[type] && checkNextOrPrev(next)) {
      setStylesAndFormatted(type, close, false)
    } else if (!tokens[type] && checkNextOrPrev(prev)) {
      setStylesAndFormatted(type, open, true)
    } else {
      char = type
    }
  }

  for (let i = 0; i < strings.length; i++) {
    formatted = ''
    let prev = undefined
    const str = strings[i]

    for (let j = 0; j < str.length; j++) {
      char = str[j]

      if (char === '*') {
        if (str[j + 1] === '*') {
          j++
          process(
            '**',
            IS_BROWSER ? 'font-weight: bold;' : '\u001B[1m',
            IS_BROWSER ? 'font-weight: normal;' : '\u001B[22m',
            str[j + 1],
            prev
          )
        } else {
          process(
            '*',
            IS_BROWSER ? 'font-style: italic;' : '\u001B[3m',
            IS_BROWSER ? 'font-style: normal;' : '\u001B[23m',
            str[j + 1],
            prev
          )
        }
      } else if (char === '_') {
        if (str[j + 1] === '_') {
          j++
          process(
            '__',
            IS_BROWSER ? 'font-weight: bold;' : '\u001B[1m',
            IS_BROWSER ? 'font-weight: normal;' : '\u001B[22m',
            str[j + 1],
            prev
          )
        } else {
          process(
            '_',
            IS_BROWSER ? 'font-style: italic;' : '\u001B[3m',
            IS_BROWSER ? 'font-style: normal;' : '\u001B[23m',
            str[j + 1],
            prev
          )
        }
      } else if (char === '`') {
        process(
          '`',
          IS_BROWSER
            ? 'background: hsla(0,0%,70%,.3); border-radius:3px; padding: 0 2px;'
            : '\u001B[96m\u001B[1m',
          IS_BROWSER ? 'background: unset;' : '\u001B[39m\u001B[22m',
          str[j + 1],
          prev
        )
      }

      prev = char
      if (typeof char !== 'undefined') {
        formatted += char
      }
    }

    const hasPrevSlot = i > 0
    const hasNextSlot = i < args.length
    if (disableStyling) {
      if (hasNextSlot && formatted.endsWith(' ')) {
        formatted = formatted.slice(0, -1)
      }
      if (hasPrevSlot && formatted.startsWith(' ')) {
        formatted = formatted.slice(1)
      }

      if (formatted !== '') {
        result.push(formatted)
      }

      if (hasNextSlot) {
        if (typeof args[i] === 'string') {
          result.push(JSON.stringify(args[i]))
        } else {
          result.push(args[i])
        }
      }
    } else {
      if (!result.length) result.push('')
      if (hasNextSlot && hints[i]) {
        process(
          '~',
          IS_BROWSER
            ? 'text-decoration: underline; text-decoration-color: green; text-decoration-style: wavy; padding-bottom: 1px; text-decoration-skip-ink: none;'
            : '',
          ''
        )
      }

      if (formatted !== '') {
        if (result.length) {
          result[result.length - 1] += formatted
        } else {
          result.push(formatted)
        }
      }

      if (hasNextSlot) {
        let serailized
        if (
          args[i] &&
          (typeof args[i] === 'object' || typeof args[i] === 'function')
        ) {
          result[result.length - 1] += '%o'
          styles.push(args[i])
        } else {
          try {
            serailized = JSON.stringify(args[i])
          } catch (e) {
            serailized = '' + args[i]
          }
          result[result.length - 1] += serailized
        }
      }

      if (hasNextSlot && hints[i]) {
        formatted = ''
        process(
          '~',
          IS_BROWSER ? 'text-decoration: none; padding-bottom: 0;' : '',
          ''
        )
        result[result.length - 1] += formatted
      }
    }
  }

  if (trace) {
    if (disableStyling) {
      result.push(` (@ ${trace})`)
    } else {
      if (!result.length) result.push('')
      if (IS_BROWSER) {
        result[result.length - 1] += `%c(@ ${trace})`
        styles.push(
          'color: #999; font-style: italic; font-size: 0.9em; padding-left: 2em;'
        )
      } else {
        result[result.length - 1] += `  \u001B[2m(@ ${trace})\u001B[22m`
      }
    }
  }

  result.push(...styles)

  return result
}

function log(...args) {
  console.log(...args)
}

/**
 * This function gets the name of the component which calls the useTilg hook.
 * Returns null if not able to retrieve the information.
 */
const components = new WeakMap()
const instances = new Map()
function useTilgCurrentComponentContext() {
  const owner = (React as any)
    .__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner
    .current || { type: { name: 'unknown' }, memoizedProps: undefined }

  const name = owner.type.name
  const id = owner.type

  let path = ''
  let logPath = ''

  const stack = new Error().stack.split('\n')
  for (const line of stack) {
    const match = line.match(/^\s*at\s+(.*?)\s+\((.*?)\)$/)
    const callerName = match?.[1]
    const callerPath = match?.[2]

    if (callerPath) path += callerPath + ','

    if (callerName && !callerName.startsWith('useTilg')) {
      logPath = match[2]
    }

    if (
      callerName &&
      !callerName.startsWith('use') &&
      !/.+\.use.+/.test(callerName)
    ) {
      break
    }
  }

  return [name, owner, id, path, logPath]
}

export default function useTilg(...inlined: any[]) {
  const mark = useState(Math.random())[0]
  const [name, owner, id, hookPath, logPath] = useTilgCurrentComponentContext()

  const compute = () => {
    let hookId = 0

    if (!components.has(id)) {
      components.set(id, [])
    }
    const hooks = components.get(id)
    hookId = hooks.indexOf(hookPath)
    if (hookId === -1) {
      hookId = hooks.length
      hooks.push(hookPath)
    }

    let componentName = name
    if (name) {
      componentName = '`<' + name + '/>`'
    } else {
      componentName = 'Component'
    }

    // Only log the life cycle message for the first hook.
    if (hookId !== 0) return [componentName, hookId, 0]

    // Which component instance is this hook located in.
    if (!instances.has(id)) {
      instances.set(id, [])
    }
    const instanceMarks = instances.get(id)
    let index = instanceMarks.indexOf(mark)
    if (index === -1) {
      index = instanceMarks.length
      instanceMarks.push(mark)
    }

    return [componentName, hookId, index]
  }

  useEffect(() => {
    const [componentName, hookId, instanceId] = compute()

    // Only log the life cycle message for the first hook.
    if (hookId !== 0) return
    const note = instanceId > 0 ? ` (${instanceId + 1})` : ''

    log(...md([`${componentName}${note} mounted.`]))
    return () => {
      if (!instances.has(id)) {
        instances.set(id, [])
      }
      const instanceMarks = instances.get(id)
      let index = instanceMarks.indexOf(mark)
      if (index !== -1) {
        instanceMarks[index] = instanceMarks[instanceMarks.length - 1]
        instanceMarks.length--
      }

      if (!components.has(id)) {
        components.set(id, [])
      }
      const hooks = components.get(id)
      index = hooks.indexOf(hookPath)
      if (index !== -1) {
        hooks[index] = hooks[hooks.length - 1]
        hooks.length--
      }

      log(...md([`${componentName}${note} unmounted.`]))
    }
  }, [])

  const loggerEffectContent = useRef(null)
  loggerEffectContent.current = null
  const loggerPrevArgsContent = useRef(null)
  const loggerArgsContent = useRef([])
  loggerArgsContent.current = []

  useLayoutEffect(() => {
    const [componentName, hookId, instanceId] = compute()

    // Only log the life cycle message for the first hook.
    if (hookId === 0) {
      const note = instanceId > 0 ? ` (${instanceId + 1})` : ''
      log(
        ...md(
          [`${componentName}${note} rendered with props: \``, '`.'],
          [owner.memoizedProps]
        )
      )
    }

    let changed = false
    let changedHint = {}

    const prev = loggerPrevArgsContent.current
    const now = loggerArgsContent.current
    if (!prev || prev.length !== now.length) {
      // An arg has been removed or added, do nothing.
      changed = true
    } else {
      for (let i = 0; i < prev.length; i++) {
        if (prev[i] !== now[i]) {
          changed = true
          changedHint[i] = true
        }
      }
    }
    loggerPrevArgsContent.current = now

    if (changed && loggerEffectContent.current) {
      loggerEffectContent.current(changedHint)
    }
  })

  if (inlined.length > 0) {
    loggerArgsContent.current = inlined
    loggerEffectContent.current = (hints) => {
      const message = md(
        inlined.map((_, i) => (i > 0 ? ', ' : '')).concat(''),
        inlined,
        hints,
        logPath
      )

      log(...message)
    }
    return inlined[0]
  }

  return function useTilgInner(strings, ...args: any[]) {
    loggerEffectContent.current = (hints: Record<number, boolean>) => {
      const message = strings.length ? md(strings, args, hints, logPath) : ''

      if (message) {
        // This is a work around to get rid of the hook count mismatch bug.
        log(...message)
      }
    }

    loggerArgsContent.current = args

    return args[0]
  }
}
