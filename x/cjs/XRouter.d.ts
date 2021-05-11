import { History, Location } from 'history';
import * as qs from 'qs';
/** Create a typed route config object */
export declare const XRoute: <KEY extends string, RESOURCE extends string, LOCATION extends {
    pathname: {};
    search: {};
    hash?: string | undefined;
}>(key: KEY, resource: RESOURCE, location: LOCATION) => {
    key: KEY;
    resource: RESOURCE;
    location: LOCATION;
};
export interface IRouter extends XRouter<any, any, any> {
}
/**
 * Declarative routing via the History interface.
 */
export declare class XRouter<CONFIGS extends RouteConfig[], ROUTES extends {
    [C in CONFIGS[number] as C['key']]: LiveRoute<C>;
}, CONFIG extends CONFIGS[number]> {
    definition: CONFIGS;
    history: History;
    config: {
        /** @optional `qs` library option OVERRIDES (careful!) */
        qs?: {
            parse?: qs.IParseOptions;
            format?: qs.IStringifyOptions;
        };
    };
    /** The synced location object. Also available within `this.routes[route].location`. */
    location: Location;
    stopReactingToHistory?(): void;
    stopReactingToLocation?(): void;
    constructor(definition: CONFIGS, history: History, config?: {
        /** @optional `qs` library option OVERRIDES (careful!) */
        qs?: {
            parse?: qs.IParseOptions;
            format?: qs.IStringifyOptions;
        };
    });
    setLocation(location: Location): void;
    /** Start reacting to changes. This is automatically called on construction. */
    startReacting(): void;
    /** Stop reacting to all changes - disposer. */
    stopReacting(): void;
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
    get routes(): ROUTES;
    /** The currently active route. */
    get route(): undefined | ActiveLiveRoute<CONFIG>;
    /** Converts a route to a string path. */
    toUri<ROUTE extends CONFIG>(route: ROUTE, location?: Partial2Deep<ROUTE['location']>): string;
    /** history.push() a given route */
    push<ROUTE extends CONFIG>(route: ROUTE, location?: Partial2Deep<ROUTE['location']>): void;
    /** Equal to history.push(pathname) */
    push(fullPath: string): void;
    /** history.replace() a given route */
    /** Equal to history.replace(pathname) */
    replace<ROUTE extends CONFIG>(route: ROUTE, location?: Partial2Deep<ROUTE['location']>): void;
    replace(fullPath: string): void;
    go: History['go'];
    back: History['back'];
    forward: History['forward'];
    block: History['block'];
    /**
     * Be aware, toPath will throw if missing params.
     * When navigating from another route, ensure you provide all required params.
     */
    protected navigate<ROUTE_DEF extends CONFIG>(route: ROUTE_DEF | string, location?: Partial2Deep<ROUTE_DEF['location']>, method?: 'push' | 'replace'): void;
}
export declare type RouteConfig = ReturnType<typeof XRoute>;
/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */
export interface LiveRoute<CONFIG extends RouteConfig> {
    isActive: boolean;
    pathname?: CONFIG['location']['pathname'];
    search?: CONFIG['location']['search'];
    hash?: CONFIG['location']['hash'];
    location: Location;
    key: CONFIG['key'];
    resource: CONFIG['resource'];
    config: CONFIG;
    push(location?: Partial2Deep<CONFIG['location']>): void;
    pushExact(location: CONFIG['location']): void;
    replace(location?: Partial2Deep<CONFIG['location']>): void;
    replaceExact(location: CONFIG['location']): void;
    toUri(location?: Partial2Deep<CONFIG['location']>): string;
    toPathExact(location: CONFIG['location']): string;
}
export interface ActiveLiveRoute<CONFIG extends RouteConfig> extends LiveRoute<CONFIG> {
    isActive: true;
    pathname: CONFIG['location']['pathname'];
    search: CONFIG['location']['search'];
    hash: CONFIG['location']['hash'];
}
/** Cast a list of LiveRoute[] to ActiveLiveRoute[]  */
export declare function asActiveRoutes<ROUTE extends undefined | LiveRoute<RouteConfig>>(routes: ROUTE[]): (ActiveLiveRoute<NonNullable<ROUTE>["config"]> | undefined)[];
export declare function asActiveRoute<ROUTE extends undefined | LiveRoute<any>>(route: ROUTE): ActiveLiveRoute<NonNullable<ROUTE>["config"]> | undefined;
/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
export declare function findActiveRoute<ROUTE extends undefined | LiveRoute<RouteConfig>>(routes: ROUTE[]): ActiveLiveRoute<NonNullable<ROUTE>["config"]> | undefined;
declare type Partial2Deep<T> = {
    [P in keyof T]?: P extends {} ? Partial<T[P]> : P;
};
export {};
