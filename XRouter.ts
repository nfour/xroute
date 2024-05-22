import { makeAutoObservable } from 'mobx'
import { compile } from 'path-to-regexp'
import * as qs from 'qs'
import { RouteConfig } from './XRoute'
import { LiveXRoute } from './LiveXRoute'
import {
  HistoryObserver,
  HistorySubset,
  LocationPrimitive,
} from './HistoryObserver'

export interface LocationType {
  pathname: {}
  search: {}
  hash?: string
}

/**
 * Declarative type safe routing synced to the browser location.
 *
 * @example
 *
 * const router = new XRouter([
 *  XRoute('home')
 *   .Resource('/')
 *   .Type<{ pathname: {}; search: {}; hash: '' }>(),
 * XRoute('app')
 *   .Resource('/app')
 *   .Type<{ pathname: {}; search: {}; hash: '' }>(),
 * XRoute('admin')
 *  .Resource('/admin/:section?')
 *  .Type<{
 *     pathname: { section?: 'upload' | 'settings' }
 *     search: {}
 *     hash: ''
 *   }>(),
 * ], createBrowserHistory(), {})
 */
export class XRouter<CONFIGS extends RouteConfig[]> {
  /**
   * A map of routes `{ [route.key]: route }`
   *
   * @example
   *
   * // Read parameters
   * router.routes.myRoute.pathname?.myParam // string | undefined
   *
   * // Set the route and its parameters
   * // Can be used to set a route from a different route too
   * router.routes.myRoute.push({
   *   pathname: { myParam: 'banana' }, // Optional
   *   search: { foo: 1 }, // Optional
   *   hash: 'my has string' // Optional
   * })
   *
   * // on myRoute now...
   *
   * router.routes.someOtherRoute.push() // Even the object is optional
   *
   * // On someOtherRoute now.
   *
   * router.routes.routeWithRequired.replace({
   *   // router.route is always the activeRoute
   *   pathname: { myProp: router.route?.pathname?.myParam || 'something' }
   * })
   */
  routes: {
    [C in CONFIGS[number] as C['key']]: LiveXRoute<C, this>
  }

  CONFIGS!: CONFIGS[number]
  ROUTE!: LiveXRoute<CONFIGS[number], this>
  ROUTE_LOCATION!: this['ROUTE']['LOCATION']

  constructor(
    /**
     * An array of route configurations. Order matters for finding the active route.
     */
    public definition: CONFIGS,
    /**
     * `history` instance
     * @example
     * createBrowserHistory()
     */
    public history: HistorySubset,
    /**
     * Additional config options for various components.
     */
    public config: {
      /** @optional `qs` library option overrides */
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
      toJSON: false,
      routes: false,
    })

    this.historyObserver.listen()

    this.routes = Object.fromEntries(
      this.definition.map((config) => [
        config.key,
        new LiveXRoute(config, this),
      ]),
    ) as any
  }

  /**
   * Current pathname string
   * @example
   * '/app'
   */
  pathname = ''
  /**
   * Current search string
   * @example
   * '?foo=1'
   */
  search = ''
  /**
   * Current hash string
   * @example
   * '#my-hash'
   */
  hash = ''

  private historyObserver = new HistoryObserver(
    () => this.history,
    ({ location }) => this.setLocation(location),
  )

  /** The currently active route. */
  get route(): undefined | this['ROUTE'] {
    for (const config of this.definition) {
      const route = this.routes[
        config.key as CONFIGS[number]['key']
      ] as this['ROUTE']

      if (route.isMatching) return route
    }
  }

  /** Converts a route to a string path. */
  toUri<CONFIG extends RouteConfig>(
    config: CONFIG,
    location?: this['ROUTE_LOCATION'],
  ) {
    const { pathname, search, hash } = this.toUriParts(config, location)

    return `${pathname}${search}${hash}`
  }

  push<CONFIG extends RouteConfig>(
    config: CONFIG | string,
    location?: this['ROUTE_LOCATION'],
  ) {
    this.navigate(config, location, 'push')
  }

  /**
   * `history.replace()` a given route
   */
  replace<CONFIG extends RouteConfig>(
    config: CONFIG | string,
    location?: this['ROUTE_LOCATION'],
  ) {
    this.navigate(config, location, 'replace')
  }

  /** `history.go()` */
  go: HistorySubset['go'] = (...args) => this.history.go(...args)
  /** `history.back()` */
  back: HistorySubset['back'] = () => this.history.back()
  /** `history.forward()` */
  forward: HistorySubset['forward'] = () => this.history.forward()
  /** `history.block()` */
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

  protected setLocation(next: LocationPrimitive = {}) {
    if (this.pathname !== next.pathname) this.pathname = next.pathname ?? ''
    if (this.search !== next.search) this.search = next.search ?? ''
    if (this.hash !== next.hash) this.hash = next.hash ?? ''
  }

  /** Converts a route to a { pathname, search, hash } parts. */
  protected toUriParts<CONFIG extends this['CONFIGS']>(
    config: CONFIG,
    location?: this['ROUTE_LOCATION'],
  ) {
    const { resource, key } = config

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

  /**
   * Be aware, toPath will throw if missing params.
   */
  protected navigate<CONFIG extends this['CONFIGS']>(
    route: CONFIG | string,
    location?: this['ROUTE_LOCATION'],
    method: 'push' | 'replace' = 'push',
  ): void {
    if (typeof route === 'string') {
      return this.history[method](route)
    }

    const { pathname, search, hash } = this.toUriParts(route, location)

    this.setLocation({ pathname, search, hash })
    this.history[method]({ pathname, search, hash })
  }
}
