import { History } from 'history'
import { isEqual } from 'lodash'
import { makeAutoObservable, reaction } from 'mobx'
import { compile, match } from 'path-to-regexp'
import * as qs from 'qs'

/** Create a typed route config object */
export const XRoute = <
  KEY extends string,
  RESOURCE extends string,
  LOCATION extends {
    pathname: {}
    search: {}
    hash?: string
  },
>(
  key: KEY,
  resource: RESOURCE,
  location: LOCATION,
) => ({ key, resource, location })

export interface IRouter extends XRouter<any, any, any> {}

/**
 * Declarative routing via the History interface.
 */
export class XRouter<
  CONFIGS extends RouteConfig[],
  ROUTES extends {
    [C in CONFIGS[number] as C['key']]: LiveRoute<C>
  },
  CONFIG extends CONFIGS[number],
> {
  /** The synced location object. Also available within `this.routes[route].location`. */
  public location: Location = {
    hash: '',
    pathname: '',
    search: '',
  }

  public stopReactingToHistory?(): void
  public stopReactingToLocation?(): void

  constructor(
    public definition: CONFIGS,
    public history: History,
    public config: {
      /** @optional `qs` library option OVERRIDES (careful!) */
      qs?: {
        parse?: qs.IParseOptions
        format?: qs.IStringifyOptions
      }
    } = {},
  ) {
    this.definition = definition
    this.history = history
    this.config = config

    makeAutoObservable(this, {
      history: false,
      definition: false,
      config: false,
    })

    this.startReacting()
  }

  private getLocationProperies = ({
    hash,
    pathname,
    search,
  }: this['location']) => {
    return { pathname, search, hash }
  }

  public setLocation(location: this['location']) {
    this.location = this.getLocationProperies(location)
  }

  /** Start reacting to changes. This is automatically called on construction. */
  public startReacting() {
    this.stopReacting()
    this.setLocation(this.history.location)

    this.stopReactingToHistory = this.history.listen(({ location }) =>
      this.setLocation(location),
    )

    this.stopReactingToLocation = reaction(
      () => this.location,
      (location) => {
        if (isEqual(this.getLocationProperies(this.history.location), location))
          return

        this.history.replace(location)
      },
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
  get routes(): ROUTES {
    const location = this.location
    // TODO: Should it be configurable to allow multiple matches?
    let isAlreadyMatched = false

    return this.definition.reduce((routes, _route) => {
      const route = _route as CONFIG
      const { key, resource } = route
      const matched = match(resource, {
        decode: decodeURI,
        encode: encodeURI,
      })(location.pathname ?? '')

      const { index, params: pathname } = matched || {}
      const mergeLocation = (p: Partial<LiveRoute<any>> = {}) => ({
        pathname: {
          ...(this.route?.pathname as {} | undefined),
          ...p.pathname,
        },
        search: {
          ...(this.route?.key === route.key ? this.route.search : {}),
          ...p.search,
        },
        hash: p.hash ?? this.route?.hash,
      })

      const isActive = isAlreadyMatched === false && index !== undefined

      if (isActive) isAlreadyMatched = true

      const search = qs.parse(location.search ?? '', {
        ignoreQueryPrefix: true,
        ...this.config.qs?.parse,
      })

      // TODO: convert to a class LiveRoute {}
      const newRoute: LiveRoute<typeof route> = {
        isActive,
        key,
        resource,
        search,
        pathname,
        config: route,
        hash: location.hash,
        get location() {
          return { ...location }
        },
        get uri() {
          return `${location.pathname}${location.search}${location.hash}`
        },
        push: (p: {}) => this.push(route, mergeLocation(p)),
        pushExact: (p: {}) => this.push(route, p),
        replace: (p: {}) => this.replace(route, mergeLocation(p)),
        replaceExact: (p: {}) => this.replace(route, p),
        toUri: (p: {}) => this.toUri(route, mergeLocation(p)),
        toUriExact: (p: {}) => this.toUri(route, p),
      }

      return { ...routes, [key]: newRoute }
    }, {} as ROUTES)
  }

  /** The currently active route. */
  get route(): undefined | ActiveLiveRoute<CONFIG> {
    if (!this.routes) return

    // Get routes in order.
    for (const { key } of this.definition) {
      const route = this.routes[
        key as keyof this['routes']
      ] as ActiveLiveRoute<CONFIG>

      if (route.isActive) return route
    }
  }

  /** Converts a route to a string path. */
  toUri<ROUTE extends CONFIG>(
    route: ROUTE,
    location?: Partial2Deep<ROUTE['location']>,
  ) {
    const { pathname, search, hash } = this.toUriParts(route, location)

    return `${pathname}${search}${hash}`
  }

  /** Converts a route to a { pathname, search, hash } parts. */
  toUriParts<ROUTE extends CONFIG>(
    route: ROUTE,
    location?: Partial2Deep<ROUTE['location']>,
  ) {
    const { resource, key } = route

    try {
      const pathname =
        compile(resource)({ ...(location?.pathname ?? {}) }) || '/'

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
        `INVALID_PARAMS\nROUTE: ${key}\nPATH: ${resource}\n ${error}`,
      )
    }
  }

  /** history.push() a given route */
  push<ROUTE extends CONFIG>(
    route: ROUTE,
    location?: Partial2Deep<ROUTE['location']>,
  ): void

  /** Equal to history.push(pathname) */
  push(fullPath: string): void
  push<ROUTE extends CONFIG>(
    route: ROUTE | string,
    location?: Partial2Deep<ROUTE['location']>,
  ) {
    this.navigate(route, location, 'push')
  }

  /** history.replace() a given route */

  /** Equal to history.replace(pathname) */
  replace<ROUTE extends CONFIG>(
    route: ROUTE,
    location?: Partial2Deep<ROUTE['location']>,
  ): void

  replace(fullPath: string): void
  replace<ROUTE extends CONFIG>(
    route: ROUTE | string,
    location?: Partial2Deep<ROUTE['location']>,
  ) {
    this.navigate(route, location, 'replace')
  }

  go: History['go'] = (...args) => this.history.go(...args)
  back: History['back'] = () => this.history.back()
  forward: History['forward'] = () => this.history.forward()
  block: History['block'] = (...args) => this.history.block(...args)

  /**
   * Be aware, toPath will throw if missing params.
   * When navigating from another route, ensure you provide all required params.
   */
  protected navigate<ROUTE_DEF extends CONFIG>(
    route: ROUTE_DEF | string,
    location: Partial2Deep<ROUTE_DEF['location']> = {},
    method: 'push' | 'replace' = 'push',
  ): void {
    if (typeof route === 'string') {
      return this.history[method](route)
    }

    const { pathname, search, hash } = this.toUriParts(route, location)

    this.history[method]({ pathname, search, hash })
  }
}

export type RouteConfig = ReturnType<typeof XRoute>

interface Location {
  hash: undefined | string
  pathname: undefined | string
  search: undefined | string
}

/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */
export interface LiveRoute<CONFIG extends RouteConfig> {
  isActive: boolean

  /** pathname variables @example resource `/:foo/:bar` to uri `/1/2` resolves `{ foo: '1', bar: '2' }` */
  pathname?: CONFIG['location']['pathname']
  /** search variables @example uri `/?foo=1&bar=2` resolves `{ foo: '1', bar: '2' }` */
  search?: CONFIG['location']['search']
  /** the hash string @example `/#foooo` resolves `foooo` */
  hash?: CONFIG['location']['hash']

  /** Raw location object for current route state */
  location: Location
  /**
   * The full URI that the current route resolves to.
   * Essenitally a product of route.toUri(route)
   * Returns `undefined` when the current route is in an invalid state
   */
  uri: undefined | string

  key: CONFIG['key']
  resource: CONFIG['resource']
  config: CONFIG
  push(location?: Partial2Deep<CONFIG['location']>): void
  pushExact(location: CONFIG['location']): void

  replace(location?: Partial2Deep<CONFIG['location']>): void
  replaceExact(location: CONFIG['location']): void

  toUri(location?: Partial2Deep<CONFIG['location']>): string
  toUriExact(location: CONFIG['location']): string
}

export interface ActiveLiveRoute<CONFIG extends RouteConfig>
  extends LiveRoute<CONFIG> {
  isActive: true

  pathname: CONFIG['location']['pathname']
  search: CONFIG['location']['search']
  hash: CONFIG['location']['hash']
}

/** Cast a list of LiveRoute[] to ActiveLiveRoute[]  */
export function asActiveRoutes<ROUTE extends LiveRoute<RouteConfig>>(
  routes: (undefined | ROUTE)[],
) {
  return routes.map(asActiveRoute)
}

export function asActiveRoute<ROUTE extends LiveRoute<RouteConfig>>(
  route: undefined | ROUTE,
) {
  return route as undefined | ActiveLiveRoute<ROUTE['config']>
}

/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
export function findActiveRoute<ROUTE extends LiveRoute<RouteConfig>>(
  routes: ROUTE[],
) {
  return asActiveRoutes(routes).find((r) => r?.isActive)
}

type Partial2Deep<T> = {
  [P in keyof T]?: P extends {} ? Partial<T[P]> : P
}
