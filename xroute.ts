import { createHashHistory, History, Location } from 'history';
import isEqual from 'lodash/isEqual';
import { makeAutoObservable, reaction } from 'mobx';
import { compile, match } from 'path-to-regexp';

/** Create a typed route config object */
export const XRoute = <
  KEY extends string,
  RESOURCE extends string,
  PARAMS extends {}
>(
  key: KEY,
  resource: RESOURCE,
  params: PARAMS,
) => ({ key, resource, params });

/**
 * The Mobx class which handles routing over History.
 */
export class XRouter<
  LIST extends RouteConfig[],
  KEYS extends LIST[number]['key'],
  ROUTES extends {
    [ITEM in LIST[number] as ITEM['key']]: LiveRoute<ITEM>;
  }
> {
  location!: Location;
  definition: LIST;
  dispose: () => void;

  protected history: History;

  constructor(definition: LIST, history: History = createHashHistory()) {
    this.definition = definition;
    this.history = history;

    const setLocation = (location: Location) => {
      if (isEqual(this.location, location)) return;

      this.location = { ...location };
    };

    const setHistory = (location: Location) => {
      if (isEqual(this.history.location, location)) return;

      this.history.replace({ ...location });
    };

    const stopSettingHistory = reaction(
      () => this.location,
      (location) => {
        setHistory(location);
      },
    );

    const stopSettingLocation = history.listen(({ location }) =>
      setLocation(location),
    );

    this.dispose = () => {
      stopSettingLocation();
      stopSettingHistory();
    };

    setLocation(history.location);

    makeAutoObservable(this);
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
    const { pathname = '/', hash, search } = this.location ?? {};

    return this.definition.reduce((routes, route) => {
      const { key, resource } = route;
      const matched = match(resource, {
        decode: decodeURI,
        encode: encodeURI,
      })(pathname);

      const { index, path, params } = matched || {};

      const newRoute: LiveRoute<typeof route> = {
        index,
        params,
        resource,
        path,
        key,
        hash,
        search,
        isActive: index !== undefined,
        push: (p: {}) => this.push(route, p),
        replace: (p: {}) => this.replace(route, p),
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

  /** history.push() a given route */
  push<ROUTE extends RouteConfig>(route: ROUTE, params?: ROUTE['params']): void;

  /** Equal to history.push(pathname) */
  push(pathname: string): void;

  push<ROUTE extends RouteConfig>(
    route: ROUTE | string,
    params?: ROUTE['params'],
  ) {
    this.navigate(route, params, 'push');
  }

  /** history.replace() a given route */
  replace<ROUTE extends RouteConfig>(
    route: ROUTE,
    params?: ROUTE['params'],
  ): void;

  /** Equal to history.replace(pathname) */
  replace(pathname: string): void;

  replace(route: RouteConfig | string, params?: {}) {
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
  protected navigate<ROUTE_DEF extends RouteConfig>(
    route: ROUTE_DEF | string,
    params: Partial<ROUTE_DEF['params']> = {},
    method: 'push' | 'replace' = 'push',
  ): void {
    if (typeof route === 'string') {
      return this.history[method](route);
    }

    const { resource, key } = route;

    try {
      const path = compile(resource)({ ...params }) || '/';

      this.history[method](path);
    } catch (error) {
      throw new Error(
        `INVALID_PARAMS\nROUTE: ${key}\nPATH: ${resource}\n ${error}`,
      );
    }
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
  params?: ITEM['params'];
  hash?: string;
  search?: string;
  index?: number;
  path?: string;
  isActive: boolean;
  push(params: ITEM['params']): void;
  replace(params: ITEM['params']): void;
}

export interface ActiveLiveRoute<ITEM extends RouteConfig>
  extends LiveRoute<ITEM> {
  params: ITEM['params'];
  resource: ITEM['resource'];
  key: ITEM['key'];
  path: string;
  index: number;
  hash: string;
  isActive: true;
}

/** Cast a list of LiveRoute[] to ActiveLiveRoute[]  */
export function asActiveRoutes<ROUTE extends LiveRoute<any>>(routes: ROUTE[]) {
  return routes.map(asActiveRoute);
}

export function asActiveRoute<ROUTE extends LiveRoute<any>>(route: ROUTE) {
  return route as ActiveLiveRoute<Required<ROUTE>>;
}

/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
export function findActiveRoute<ROUTE extends LiveRoute<any>>(routes: ROUTE[]) {
  return asActiveRoutes(routes).find(({ isActive }) => isActive);
}
