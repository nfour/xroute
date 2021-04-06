import { History, Location } from 'history';
import isEqual from 'lodash-es/isEqual';
import { makeAutoObservable, reaction } from 'mobx';
import { compile, match } from 'path-to-regexp';
import * as qs from 'qs';

export interface ReactionFn {
  (reactTo: () => any, onChange: (v: any) => any): () => any;
}

/** Create a typed route config object */
export const XRoute = <
  KEY extends string,
  RESOURCE extends string,
  PARAMS extends {
    search?: string | {};
    pathname?: string | {};
    hash?: string;
  }
>(
  key: KEY,
  resource: RESOURCE,
  location: PARAMS,
) => ({ key, resource, location });

export interface IRouter extends XRouter<any, any, any, any> {}

/**
 * Declarative routing via the History interface.
 */
export class XRouter<
  LIST extends RouteConfig[],
  KEYS extends LIST[number]['key'],
  ROUTES extends {
    [ITEM in LIST[number] as ITEM['key']]: LiveRoute<ITEM>;
  },
  ROUTE_CONFIG extends RouteConfig
> {
  location: Location = {
    hash: '',
    key: '',
    pathname: '',
    search: '',
    state: {},
  };

  stopReactingToHistory?(): void;
  stopReactingToLocation?(): void;

  constructor(public definition: LIST, public history: History) {
    this.definition = definition;
    this.history = history;

    makeAutoObservable(this);

    this.startReacting();
  }

  setLocation(location: Location) {
    if (isEqual(this.location, location)) return;

    this.location = { ...location };
  }

  startReacting() {
    this.setLocation(this.history.location);

    this.stopReactingToHistory = this.history.listen(({ location }) =>
      this.setLocation(location),
    );

    this.stopReactingToLocation = reaction(
      () => this.location,
      (location) => {
        if (isEqual(this.history.location, location)) return;

        this.history.replace({ ...location });
      },
    );
  }

  stopReacting() {
    this.stopReactingToHistory?.();
    this.stopReactingToLocation?.();
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
   * router.routes.myRoute.push({ myParam: 'banana' })
   *
   * // on myRoute now...
   *
   * router.routes.someOtherRoute.push({})
   *
   * // On someOtherRoute now.
   *
   * router.routes.routeWithRequired.push({
   *   // router.route is always the activeRoute
   *   myProp: router.route?.params?.myParam || 'something'
   * })
   */
  get routes(): ROUTES {
    const location = this.location;

    // TODO: Should it be configurable to allow multiple matches?
    let isAlreadyMatched = false;

    return this.definition.reduce((routes, _route) => {
      const route = _route as ROUTE_CONFIG;
      const { key, resource } = route;
      const matched = match(resource, {
        decode: decodeURI,
        encode: encodeURI,
      })(location.pathname);

      const { index, path, params } = matched || {};

      const mergeParams = (p = {}) => ({
        ...((this.route?.pathname as {}) ?? {}),
        ...p,
      });

      const isActive = isAlreadyMatched === false && index !== undefined;

      if (isActive) isAlreadyMatched = true;

      const newRoute: LiveRoute<typeof route> = {
        isActive,
        key,
        index,
        resource,
        path,
        get pathname() {
          return params;
        },
        get hash() {
          return location.hash;
        },
        get search() {
          return qs.parse(location.search ?? '');
        },
        get location() {
          return location;
        },
        push: (p: {}) => this.push(route, mergeParams(p)),
        pushExact: (p: {}) => this.push(route, p),
        replace: (p: {}) => this.replace(route, mergeParams(p)),
        replaceExact: (p: {}) => this.replace(route, p),
        toUri: (p: {}) => this.toPath(route, mergeParams(p)),
        toPathExact: (p: {}) => this.toPath(route, p),
      };

      return { ...routes, [key]: newRoute };
    }, {} as ROUTES);
  }

  /** The currently active route. */
  get route() {
    if (!this.routes) return;

    // Get routes in order.
    for (const { key } of this.definition) {
      const route = this.routes[key as KEYS];

      if (route.isActive) return asActiveRoute(route);
    }
  }

  toPath<ROUTE extends ROUTE_CONFIG>(route: ROUTE, params?: ROUTE['location']) {
    const { resource, key } = route;

    try {
      return compile(resource)({ ...params }) || '/';
    } catch (error) {
      throw new Error(
        `INVALID_PARAMS\nROUTE: ${key}\nPATH: ${resource}\n ${error}`,
      );
    }
  }

  /** history.push() a given route */
  push<ROUTE extends ROUTE_CONFIG>(
    route: ROUTE,
    params?: ROUTE['location'],
  ): void;

  /** Equal to history.push(pathname) */
  push(pathname: string): void;
  push<ROUTE extends ROUTE_CONFIG>(
    route: ROUTE | string,
    params?: ROUTE['location'],
  ) {
    this.navigate(route, params, 'push');
  }

  /** history.replace() a given route */

  /** Equal to history.replace(pathname) */
  replace<ROUTE extends ROUTE_CONFIG>(
    route: ROUTE,
    params?: ROUTE['location'],
  ): void;

  replace(pathname: string): void;
  replace(route: ROUTE_CONFIG | string, params?: {}) {
    this.navigate(route, params, 'replace');
  }

  go: History['go'] = (...args) => this.history.go(...args);
  back: History['back'] = () => this.history.back();
  forward: History['forward'] = () => this.history.forward();
  block: History['block'] = (...args) => this.history.block(...args);

  /**
   * Be aware, toPath will throw if missing params.
   * When navigating from another route, ensure you provide all required params.
   */
  protected navigate<ROUTE_DEF extends ROUTE_CONFIG>(
    route: ROUTE_DEF | string,
    params: Partial<ROUTE_DEF['location']> = {},
    method: 'push' | 'replace' = 'push',
  ): void {
    if (typeof route === 'string') {
      return this.history[method](route);
    }

    const path = this.toPath(route, params);

    this.history[method](path);
  }
}

export type RouteConfig = ReturnType<typeof XRoute>;

/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */
export interface LiveRoute<ITEM extends RouteConfig> {
  key: ITEM['key'];
  resource: ITEM['resource'];
  pathname?: ITEM['location']['pathname'];
  hash?: ITEM['location']['hash'];
  search?: ITEM['location']['search'];
  index?: number;
  path?: string;
  isActive: boolean;
  location: any;

  push(params?: Partial<ITEM['location']>): void;
  pushExact(params: ITEM['location']): void;

  replace(params?: Partial<ITEM['location']>): void;
  replaceExact(params: ITEM['location']): void;

  toUri(params?: Partial<ITEM['location']>): string;
  toPathExact(params: ITEM['location']): string;
}

export interface ActiveLiveRoute<ITEM extends RouteConfig>
  extends LiveRoute<ITEM> {
  pathname: ITEM['location']['pathname'];
  search: ITEM['location']['search'];
  hash: ITEM['location']['hash'];
  resource: ITEM['resource'];
  key: ITEM['key'];
  path: string;
  index: number;
  isActive: true;
}

/** Cast a list of LiveRoute[] to ActiveLiveRoute[]  */
export function asActiveRoutes<
  ROUTE extends undefined | LiveRoute<RouteConfig>
>(routes: ROUTE[]) {
  return routes.map(asActiveRoute);
}

export function asActiveRoute<ROUTE extends undefined | LiveRoute<any>>(
  route: ROUTE,
) {
  return route as undefined | ActiveLiveRoute<Required<NonNullable<ROUTE>>>;
}

/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
export function findActiveRoute<
  ROUTE extends undefined | LiveRoute<RouteConfig>
>(routes: ROUTE[]) {
  return asActiveRoutes(routes).find((r) => r?.isActive);
}
