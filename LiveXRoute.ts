import { makeObservable } from 'mobx'
import { RouteConfig } from './XRoute'
import { type XRouter } from './XRouter'
import { match } from 'path-to-regexp'
import * as qs from 'qs'
import type { PartialDeep } from 'type-fest'

/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */

export class LiveXRoute<
  CONFIG extends RouteConfig,
  ROUTER extends XRouter<any> = XRouter<any>,
> {
  #router: ROUTER
  /** Deep partial config location */
  public PL!: PartialDeep<CONFIG['location']>
  /** Config location */
  public L!: CONFIG['location']

  constructor(private config: CONFIG, router: ROUTER) {
    this.#router = router

    makeObservable(
      this,
      {
        isActive: true,
        isMatching: true,
        pathname: true,
        search: true,
        hash: true,

        push: true,
        pushExact: true,
        replace: true,
        replaceExact: true,
        toUriExact: true,
        toUri: true,

        key: false,
        resource: false,
        uri: false,
        location: false,
        toJSON: false,
      },
      { proxy: false },
    )
  }

  get key() {
    return this.config.key
  }

  get resource() {
    return this.config.resource
  }

  private get pathnameMatch() {
    const pathname = this.#router.pathname

    if (pathname == null) return

    return (
      match(this.resource, {
        decode: decodeURI,
        encode: encodeURI,
      })(pathname) || undefined
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
   * and is also the route which is ordered first
   * (takes precendent) on construction of the router.
   */
  get isActive() {
    return this.#router.route?.key === this.key
  }

  /** pathname variables @example resource `/:foo/:bar` to uri `/1/2` resolves `{ foo: '1', bar: '2' }` */
  get pathname(): CONFIG['location']['pathname'] {
    return this.pathnameMatch?.params ?? {}
  }

  /** search variables @example uri `/?foo=1&bar=2` resolves to `{ foo: '1', bar: '2' }` */
  get search(): CONFIG['location']['search'] {
    return (
      qs.parse(this.#router.search ?? '', {
        ignoreQueryPrefix: true,
        ...this.#router.config.qs?.parse,
      }) ?? {}
    )
  }

  /** The hash string
   * @example `#foooo` resolves `foooo`
   */
  get hash(): CONFIG['location']['hash'] {
    return this.#router.hash.split('#')[1]
  }

  push(input?: ((location: this['L']) => this['PL']) | this['PL']) {
    return this.#router.push(
      this,
      this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)),
    )
  }

  pushExact(input: ((location: this['L']) => this['L']) | this['L']) {
    return this.#router.push(this, this.handlePolymorphicInput(input))
  }

  replace(input?: ((route: this['L']) => this['PL']) | this['PL']) {
    return this.#router.replace(
      this,
      this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)),
    )
  }

  replaceExact(input: ((route: this['L']) => this['L']) | this['L']) {
    return this.#router.replace(this, this.handlePolymorphicInput(input))
  }

  toUri(input?: ((route: this['L']) => this['PL']) | this['PL']): string {
    return this.#router.toUri(
      this,
      this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)),
    )
  }

  toUriExact(input: ((route: this['L']) => this['L']) | this['L']) {
    return this.#router.toUri(this, this.handlePolymorphicInput(input))
  }

  /** @deprecated use toUri() */
  get uri(): string | undefined {
    try {
      return this.toUri()
    } catch {
      return undefined
    }
  }

  /** @deprecated Use router.pathname, router.search, router.hash */
  get location() {
    return {
      pathname: this.#router.pathname,
      search: this.#router.search,
      hash: this.#router.hash,
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

  protected mergeLocationWithActiveRoute(location?: this['PL']) {
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
    return this.#router.route
  }

  protected handlePolymorphicInput<P extends object>(
    input?: P | ((o: any) => P),
  ): P | undefined {
    if (typeof input === 'function') return input(this)

    return input
  }
}
