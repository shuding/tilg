export function spyConsole() {
  const originalConsoleLog = console.log

  const logs = []
  console.log = (...args) => {
    logs.push(args)
    return originalConsoleLog.apply(console, args)
  }

  return [
    logs,
    () => {
      console.log = originalConsoleLog
    },
  ] as const
}
