export default function useTilg(...args) {
  if (args.length) return args[0]
  return (_strings, ...innerArgs) => {
    if (innerArgs && innerArgs.length) return innerArgs[0]
  }
}
