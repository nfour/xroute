/**
 * Creating routes
 */

import { XRoute } from 'xroute'

/**
 * In this route we store data only in the `pathname`
 * @example `/blue/100/0.5` or `/blue/100`
 *
 * The ? denotes optional parameters.
 */
export const blueRoute = XRoute('blue')
  .Resource('/blue/:saturation/:alpha?')
  .Type<{
    pathname: {
      /** 0-100 */
      saturation: string
      /** 0-100 */
      alpha?: string
    }
    search: {}
  }>()

// The above is the same as:

export const blueRoute2 = XRoute(
  'blue',
  '/blue/:saturation/:alpha?', // Optional param
  {} as {
    pathname: {
      /** 0-100 */
      saturation: string
      /** 0-100 */
      alpha?: string
    }
    search: {}
  },
)

/**
 * In this route we store data only in the search string
 * @example `?alpha=0.5&hue.red=255&hue.green=0&hue.blue=0`
 */
export const hueRoute = XRoute(
  'hue',
  '/hue',
  {} as {
    pathname: {}
    search: {
      alpha?: string
      hue?: { red?: string; green?: string; blue?: string }
    }
  },
)

/**
 * In this route we store data in both the pathname and search
 * @example `/red/100?saturation=0.5`
 */
export const redRoute = XRoute(
  'red',
  '/red/:alpha?',
  {} as {
    pathname: {
      /** 0-100 */
      alpha: string
    }
    search: {
      /** 0-100 */
      saturation: string
    }
  },
)
