import { makeAutoObservable } from 'mobx'
import { RouteConfig } from './XRoute'
import { type XRouter, type XRouterOptions } from './XRouter'
import { match } from 'path-to-regexp'
import * as qs from 'qs'
import { set, unset } from 'lodash'
import microdiff from 'microdiff'
import { Reactor } from './Reactor'

type Partial2Deep<T, DEPTH = 1> = {
  [P in keyof T]?: DEPTH extends 2 ? T[P] : Partial2Deep<T[P], 2>
}

export type LiveXRouteOptions = Pick<
  XRouterOptions,
  'useOptimizedObservability'
>

/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */

export class LiveXRoute<
  CONFIG extends RouteConfig,
  ROUTER extends XRouter<any> = XRouter<any>,
> {
  /** Deep partial config location */
  public LOCATION_INPUT!: Partial2Deep<CONFIG['location']>
  /** Config location */
  public LOCATION!: CONFIG['location']

  constructor(
    private config: CONFIG,
    private router: ROUTER,
    public options = {} as LiveXRouteOptions,
  ) {
    this.options = {
      useOptimizedObservability: true,
      ...options,
    }

    this.search = this.searchReactor.expression()
    this.pathname = this.pathnameReactor.expression()

    makeAutoObservable(this, {
      toJSON: false,
      options: false,
    })

    this.searchReactor.react().fire()
    this.pathnameReactor.react().fire()
  }

  /**
   * Pathname variables, as defined in the `resource` URL pattern.
   *
   * @example
   *
   * Given uri `/user/:id`
   * Resolves { id: '123' }
   */
  pathname: CONFIG['location']['pathname']

  /**
   * Search variables
   *
   * @example
   *
   * Given uri `/myApp/?foo=1&bar=2&baz[a]=2`
   * Resolves { foo: '1', bar: '2', baz: { a: '2' } }
   */
  search: CONFIG['location']['search']

  /**
   * The hash string
   *
   * @example
   *
   * Given uri `/some/url/?aaaa=1#foooo`
   * Resolves 'foooo'
   */
  get hash(): CONFIG['location']['hash'] {
    return this.router.hash.split('#')[1]
  }

  private searchReactor = new Reactor(
    () =>
      qs.parse(this.router.search, {
        ignoreQueryPrefix: true,
        ...this.router.options.qs?.parse,
      }),
    (search) => {
      if (this.options.useOptimizedObservability) {
        diffMerge(this.search, search)

        return
      }

      this.search = search
    },
  )

  private pathnameReactor = new Reactor(
    () => this.pathnameMatch?.params ?? {},
    (pathname) => {
      if (!this.options.useOptimizedObservability) {
        this.pathname = pathname

        return
      }

      diffMerge(this.pathname, pathname)
    },
  )

  get key(): CONFIG['key'] {
    return this.config.key
  }

  get resource(): CONFIG['resource'] {
    return this.config.resource
  }

  /** Warning: Use this.pathname, this.search, this.hash for optimal observability performance */
  get location(): this['LOCATION'] {
    return {
      pathname: this.pathname,
      search: this.search,
      hash: this.hash,
    }
  }

  get pathnameMatch() {
    return (
      match(this.resource, {
        decode: decodeURI,
        encode: encodeURI,
      })(this.router.pathname) || undefined
    )
  }

  /**
   * Whether this route's `resource` matches the current `pathname`.
   * More than one route can match at a time.
   */
  get isMatching() {
    return !!this.pathnameMatch
  }

  /**
   * Whether this route is matched,
   * and is also the route which is matched **first** in order of definition in the router.
   */
  get isActive() {
    return this.router.route?.key === this.key
  }

  /**
   * Pushes a URI update to the history stack.
   * Input can be a subset of the route's location as it
   * mMerges the current route with the input.
   *
   * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
   */
  push(
    input?:
      | ((location: this['LOCATION']) => this['LOCATION_INPUT'])
      | this['LOCATION_INPUT'],
  ) {
    return this.router.push(
      this,
      this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)),
    )
  }

  /**
   * Pushes a URI update to the history stack.
   * Input must be an exact location defined when the route was created.
   *
   * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
   */
  pushExact(
    input:
      | ((location: this['LOCATION']) => this['LOCATION'])
      | this['LOCATION'],
  ) {
    return this.router.push(this, this.handlePolymorphicInput(input))
  }

  /**
   * Replaces the current URI in the history stack.
   * Input can be a subset of the route's location as it
   * Merges the current route with the input.
   *
   * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
   */
  replace(
    input?:
      | ((route: this['LOCATION']) => this['LOCATION_INPUT'])
      | this['LOCATION_INPUT'],
  ) {
    return this.router.replace(
      this,
      this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)),
    )
  }

  /**
   * Replaces the current URI in the history stack.
   * Input must be an exact location defined when the route was created.
   *
   * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
   */
  replaceExact(
    input: ((route: this['LOCATION']) => this['LOCATION']) | this['LOCATION'],
  ) {
    return this.router.replace(this, this.handlePolymorphicInput(input))
  }

  /**
   * Converts the route to a URI string.
   * Input can be a subset of the route's location as it
   * Merges the current route with the input.
   *
   * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
   */
  toUri(
    input?:
      | ((route: this['LOCATION']) => this['LOCATION_INPUT'])
      | this['LOCATION_INPUT'],
  ): string {
    return this.router.toUri(
      this,
      this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)),
    )
  }

  /**
   * Converts the route to a URI string.
   * Input must be an exact location defined when the route was created.
   *
   * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
   */
  toUriExact(
    input: ((route: this['LOCATION']) => this['LOCATION']) | this['LOCATION'],
  ) {
    return this.router.toUri(this, this.handlePolymorphicInput(input))
  }

  /** @deprecated use toUri() */
  get uri(): string | undefined {
    try {
      return this.toUri()
    } catch {
      return undefined
    }
  }

  toJSON() {
    return {
      key: this.key,
      resource: this.resource,
      pathname: this.pathname,
      search: this.search,
      hash: this.hash,
      isActive: this.isActive,
      isMatching: this.isMatching,
    }
  }

  /** Cleanup reactions */
  dispose = () => {
    this.searchReactor.dispose?.()
    this.pathnameReactor.dispose?.()
  }

  protected mergeLocationWithActiveRoute(location?: this['LOCATION_INPUT']) {
    const activeRoute = this.activeRoute

    return {
      pathname: {
        ...activeRoute?.pathname,
        ...location?.pathname,
      },
      search: {
        ...(activeRoute?.key === this.key ? activeRoute?.search : {}),
        ...location?.search,
      },
      hash: location?.hash ?? activeRoute?.hash ?? undefined,
    }
  }

  protected get activeRoute() {
    return this.router.route
  }

  protected handlePolymorphicInput<P extends object>(
    input?: P | ((o: any) => P),
  ): P | undefined {
    if (typeof input === 'function') return input(this)

    return input
  }
}

/** Merges by using `microdiff` */
function diffMerge(prev: object, next: object) {
  const diff = microdiff(prev, next)

  for (const event of diff) {
    switch (event.type) {
      case 'CREATE':
      case 'CHANGE':
        set(prev, event.path, event.value)
        break
      case 'REMOVE':
        unset(prev, event.path)
        break
    }
  }

  return null
}
