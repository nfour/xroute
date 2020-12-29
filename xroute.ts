import { createHashHistory, History, Location } from 'history';
import isEqual from 'lodash-es/isEqual';
import { makeAutoObservable, reaction } from 'mobx';
import { compile, match } from 'path-to-regexp';
import { Union } from 'ts-toolbelt';

/** Create a typed route object of shape IXRoute */
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
 * The Mobx class which holds routes.
 */
export class XRouter<
  LIST extends IXRoute[],
  KEYS extends LIST[number]['key'],
  ROUTES extends {
    // Currently doesnt work with eslint and required TS 4.1
    // [ITEM in LIST[number] as ITEM['key']]: ILiveRoute<ITEM>;
    [KEY in KEYS]: ILiveRoute<Union.Select<LIST[number], { key: KEY }>>;
  },
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

      const newRoute: ILiveRoute<typeof route> = {
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
        }

      return { ...routes, [key]: newRoute, };
    }, {} as ROUTES);
  }

  /** The currently active route. */
  get route() {
    if (!this.routes) return;

    // Get routes in order.
    for (const { key } of this.definition) {
      const route = this.routes[key as KEYS]

      if (route.isActive) return route;
    }
  }

  /** history.push() a given route */
  push<ROUTE extends IXRoute>(route: ROUTE, params?: ROUTE['params']): void;

  /** Equal to history.push(pathname) */
  push(pathname: string): void;

  push<ROUTE extends IXRoute>(route: ROUTE | string, params?: ROUTE['params']) {
    this.navigate(route, params, 'push');
  }

  /** history.replace() a given route */
  replace<ROUTE extends IXRoute>(route: ROUTE, params?: ROUTE['params']): void;

  /** Equal to history.replace(pathname) */
  replace(pathname: string): void;

  replace(route: IXRoute | string, params?: {}) {
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
  protected navigate<ROUTE_DEF extends IXRoute>(
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

export type IXRoute = ReturnType<typeof XRoute>;

interface ILiveRoute<ITEM extends IXRoute> {
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
