import { isEqual } from 'lodash'
import { makeAutoObservable, reaction } from 'mobx'
import { compile } from 'path-to-regexp'
import * as qs from 'qs'
import { RouteConfig } from './XRoute'
import { LiveXRoute } from './LiveXRoute'

export interface LocationType {
  pathname: Record<string, any>
  search: Record<string, any>
  hash?: string
}

/**
 * Declarative routing via the History interface.
 */
export class XRouter<CONFIGS extends RouteConfig[]> {
  ROUTES!: {
    [C in CONFIGS[number] as C['key']]: LiveXRoute<C, this>
  }

  ROUTE!: LiveXRoute<CONFIGS[number], this>
  ROUTE_LOCATION!: this['ROUTE']['PL']

  pathname = ''
  search = ''
  hash = ''

  constructor(
    public definition: CONFIGS,
    public history: HistorySubset,
    public config: {
      /** @optional `qs` library option OVERRIDES (careful!) */
      qs?: {
        parse?: qs.IParseOptions
        format?: qs.IStringifyOptions
      }
      /**
       * Passed to the mobx reaction which is responsible for updating the URI when the observable state changes.
       * @default is 1ms */
      delayToUpdateUri?: number
    } = {},
  ) {
    this.definition = definition
    this.history = history
    this.config = config

    this.setLocation(this.history.location)

    makeAutoObservable(this, {
      history: false,
      definition: false,
      config: false,
      // routes: false,
      // location: observable.ref
    })

    this.startReacting()
  }

  // OPTIMIZE: put all this in its own HistoryMobxObserver class??
  public stopReactingToHistory?(): void
  public stopReactingToLocation?(): void

  // OPTIMIZE: better to have an action for each location part??
  public setLocation({ pathname, hash, search }: LocationPrimitive = {}) {
    this.pathname = pathname ?? ''
    this.search = search ?? ''
    this.hash = hash ?? ''
  }

  /** Start reacting to changes. This is automatically called on construction. */
  public startReacting() {
    this.stopReacting()
    this.setLocation(this.history.location)

    this.stopReactingToHistory = this.history.listen(({ location }) => {
      // OPTIMIZE: is this breaking behaviour??
      if (isEqual(extractLocation(this), location)) return

      return this.setLocation(location)
    })

    this.stopReactingToLocation = reaction(
      () => extractLocation(this),
      (location) => {
        if (isEqual(extractLocation(this.history.location), location)) return

        this.history.replace(location)
      },
      // {
      //   delay: this.config.delayToUpdateUri ?? 1,
      // },
    )
  }

  /** Stop reacting to all changes - disposer. */
  public stopReacting() {
    this.stopReactingToHistory?.()
    this.stopReactingToLocation?.()
  }

  /**
   * A map of routes `{ [route.key]: route }`
   *
   * @example
   *
   * // Read parameters
   * router.routes.myRoute.params?.myParam // string|undefined
   *
   * // Set the route and its parameters
   * // Can be used to set a route from a different route too
   * router.routes.myRoute.push({ pathname: { myParam: 'banana' } })
   *
   * // on myRoute now...
   *
   * router.routes.someOtherRoute.push({})
   *
   * // On someOtherRoute now.
   *
   * router.routes.routeWithRequired.push({
   *   // router.route is always the activeRoute
   *   pathname: { myProp: router.route?.pathname?.myParam || 'something' }
   * })
   */
  get routes() {
    return Object.fromEntries(
      this.definition.map((config) => [
        config.key,
        new LiveXRoute(config, this),
      ]),
    ) as unknown as this['ROUTES']
  }

  /** The currently active route. */
  get route(): undefined | this['ROUTE'] {
    for (const config of this.definition) {
      const route = this.routes[
        config.key as keyof (typeof this)['routes']
      ] as this['ROUTE']

      if (route.isMatching) return route
    }
  }

  /** Converts a route to a string path. */
  toUri<ROUTE extends this['ROUTE']>(
    route: ROUTE,
    location?: this['ROUTE_LOCATION'],
  ) {
    const { pathname, search, hash } = this.toUriParts(route, location)

    return `${pathname}${search}${hash}`
  }

  /** Converts a route to a { pathname, search, hash } parts. */
  toUriParts<ROUTE extends this['ROUTE']>(
    route: ROUTE,
    location?: this['ROUTE_LOCATION'],
  ) {
    const { resource, key } = route

    try {
      const pathname =
        compile(resource, {
          encode: encodeURI,
        })({ ...(location?.pathname ?? {}) }) || '/'

      const searchQs =
        typeof location?.search === 'string'
          ? location.search
          : qs.stringify(location?.search ?? {}, {
              addQueryPrefix: false,
              encodeValuesOnly: true,
              format: 'RFC3986',
              ...this.config.qs?.format,
            })

      const hash = location?.hash ? `#${location.hash}`.replace(/^#+/, '#') : ''
      const search = searchQs ? `?${searchQs}` : ''

      return { pathname, search, hash }
    } catch (error) {
      throw new Error(
        `XRoute INVALID_PARAMS:\n\nROUTE    : ${key}\nRESOURCE : ${resource}\nLOCATION : ${JSON.stringify(
          location,
        )}\n\n ${error}`,
      )
    }
  }

  /** history.push() a given route */
  push<ROUTE extends this['ROUTE']>(
    route: ROUTE,
    location?: this['ROUTE_LOCATION'],
  ): void

  /** Equal to history.push(pathname) */
  push(fullPath: string): void
  push<ROUTE extends this['ROUTE']>(
    route: ROUTE | string,
    location?: this['ROUTE_LOCATION'],
  ) {
    this.navigate(route, location, 'push')
  }

  /** history.replace() a given route */

  /** Equal to history.replace(pathname) */
  replace<ROUTE extends this['ROUTE']>(
    route: ROUTE,
    location?: this['ROUTE_LOCATION'],
  ): void

  replace(fullPath: string): void
  replace<ROUTE extends this['ROUTE']>(
    route: ROUTE | string,
    location?: this['ROUTE_LOCATION'],
  ) {
    this.navigate(route, location, 'replace')
  }

  go: HistorySubset['go'] = (...args) => this.history.go(...args)
  back: HistorySubset['back'] = () => this.history.back()
  forward: HistorySubset['forward'] = () => this.history.forward()
  block: HistorySubset['block'] = (...args) => this.history.block(...args)

  toJSON() {
    return {
      pathname: this.pathname,
      search: this.search,
      hash: this.hash,
      route: this.route?.toJSON(),
      routes: Object.fromEntries(
        Object.entries(this.routes).map(([k, v]) => [
          k,
          (v as LiveXRoute<any>).toJSON(),
        ]),
      ),
      history: this.history,
    }
  }

  /**
   * Be aware, toPath will throw if missing params.
   * When navigating from another route, ensure you provide all required params.
   */
  protected navigate<ROUTE extends this['ROUTE']>(
    route: ROUTE | string,
    location?: this['ROUTE_LOCATION'],
    method: 'push' | 'replace' = 'push',
  ): void {
    if (typeof route === 'string') {
      return this.history[method](route)
    }

    const { pathname, search, hash } = this.toUriParts(route, location)

    console.log({ pathname, search, hash })

    this.history[method]({ pathname, search, hash })
  }
}

function extractLocation(location: LocationPrimitive) {
  const { pathname, search, hash } = location

  return { pathname, search, hash }
}

export interface LocationPrimitive {
  hash?: undefined | string
  pathname?: undefined | string
  search?: undefined | string
}

/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
export function findActiveRoute<ROUTE extends LiveXRoute<any, XRouter<any>>>(
  routes: ROUTE[],
): ROUTE | undefined {
  return routes.find((r) => r.isActive)
}

export interface HistorySubset {
  readonly location: LocationPrimitive

  push(to: To, state?: any): void
  replace(to: To, state?: any): void
  go(delta: number): void
  back(): void
  forward(): void
  listen(listener: (update: HistoryUpdate) => void): () => void
  block(blocker: (tx: { retry(): void } & HistoryUpdate) => void): void
}

type To = string | LocationPrimitive

interface HistoryUpdate {
  action: string
  location: LocationPrimitive
}
export enum HistoryAction {
  Pop = 'POP',
  Push = 'PUSH',
  Replace = 'REPLACE',
}

// get routes2(): ROUTES {
//   const location = this.location
//   // TODO: Should it be configurable to allow multiple matches?
//   let isAlreadyMatched = false

//   return this.definition.reduce((routes, _route) => {
//     const route = _route as CONFIG
//     const { key, resource } = route
//     const matched = match(resource, {
//       decode: decodeURI,
//       encode: encodeURI,
//     })(location.pathname ?? '')

//     const { index, params: pathname } = matched || {}
//     const mergeLocation = (p: Partial<LiveRoute<any>> = {}) => ({
//       pathname: {
//         ...(this.route?.pathname as {} | undefined),
//         ...p.pathname,
//       },
//       search: {
//         ...(this.route?.key === route.key ? this.route.search : {}),
//         ...p.search,
//       },
//       hash: p.hash ?? this.route?.hash,
//     })

//     const isActive = isAlreadyMatched === false && index !== undefined

//     if (isActive) isAlreadyMatched = true

//     const search = qs.parse(location.search ?? '', {
//       ignoreQueryPrefix: true,
//       ...this.config.qs?.parse,
//     })

//     const inputHandler =
//       (handler: (p: {}) => any) => (input: Function | {} | undefined) => {
//         const value = typeof input === 'function' ? input(newRoute) : input

//         return handler(value)
//       }

//     // TODO: convert to a class LiveRoute {}
//     const newRoute: LiveRoute<typeof route> = {
//       isActive,
//       key,
//       resource,
//       search,
//       pathname,
//       config: route,
//       hash: location.hash,
//       get location() {
//         return { ...location }
//       },
//       get uri() {
//         return `${location.pathname}${location.search}${location.hash}`
//       },
//       push: inputHandler((p) => this.push(route, mergeLocation(p))),
//       pushExact: inputHandler((p) => this.push(route, p)),
//       replace: inputHandler((p) => this.replace(route, mergeLocation(p))),
//       replaceExact: inputHandler((p) => this.replace(route, p)),
//       toUri: inputHandler((p) => this.toUri(route, mergeLocation(p))),
//       toUriExact: inputHandler((p) => this.toUri(route, p)),
//     }

//     return { ...routes, [key]: newRoute }
//   }, {} as ROUTES)
// }
