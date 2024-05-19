import { isEqual } from 'lodash'
import { makeAutoObservable, transaction } from 'mobx'
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
  pathname: Record<string, any>
  search: Record<string, any>
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
  ROUTES!: {
    [C in CONFIGS[number] as C['key']]: LiveXRoute<C, this>
  }

  ROUTE!: LiveXRoute<CONFIGS[number], this>
  ROUTE_LOCATION!: this['ROUTE']['PL']

  pathname = ''
  search = ''
  hash = ''

  historyObserver = new HistoryObserver(
    () => this.history,
    ({ location }) => this.setLocation(location),
  )

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

    makeAutoObservable(this, {
      definition: false,
      config: false,
      routes: false,
      // location: observable.ref
    })

    this.historyObserver.listen()
  }

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

  protected setLocation(next: LocationPrimitive = {}) {
    if (
      isEqual(
        {
          pathname: this.pathname,
          search: this.search,
          hash: this.hash,
        },
        next,
      )
    )
      return

    transaction(() => {
      this.pathname = next.pathname ?? ''
      this.search = next.search ?? ''
      this.hash = next.hash ?? ''
    })
  }

  /** Converts a route to a { pathname, search, hash } parts. */
  protected toUriParts<ROUTE extends this['ROUTE']>(
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

  /**
   * Be aware, toPath will throw if missing params.
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
