const { DEBUG_LEVEL = '' } = process.env

const LEVELS = ['error', 'warn', 'info', 'debug', 'trace']

let isMaxLevel = false
const noop = () => undefined

/**
 * a very simple console logger. Far from being performant
 * consider alternative options like:
 * - [pino](https://npmjs.com/package/pino)
 * - [debug-level](https://npmjs.com/package/debug-level)
 */
export const log = LEVELS.reduce((o, level) => {
  const oo = {
    ...o,
    [level]: isMaxLevel
      ? noop
      : (...args) => {
          const str = level.toUpperCase()
          if (typeof args[0] === 'string') {
            // may contain formatting
            args[0] = `${str}: ${args[0]}`
          } else {
            args.unshift(str)
          }
          console[level](...args)
        }
  }
  if (DEBUG_LEVEL.toLowerCase() === level) {
    isMaxLevel = true
  }
  return oo
}, {})
