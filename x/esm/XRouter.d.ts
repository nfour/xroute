import * as qs from 'qs';
interface LocationType {
    pathname: {};
    search: {};
    hash?: string;
}
export declare class XRouteConstructor<KEY extends string, RESOURCE extends string = '', LOCATION extends LocationType = LocationType> {
    key: KEY;
    resource: RESOURCE;
    location: LOCATION;
    /** @deprecated Use .Type on instance instead. */
    static Type: <T extends LocationType>(v: T) => T;
    constructor(key: KEY, resource?: RESOURCE, location?: LOCATION);
    Resource<T extends string>(r: T): XRouteConstructor<KEY, T, LOCATION>;
    Type<T extends LocationType>(l?: T): XRouteConstructor<KEY, RESOURCE, T>;
}
export declare const XRoute: <KEY extends string, RESOURCE extends string = "", LOCATION extends LocationType = LocationType>(key: KEY, resource?: RESOURCE | undefined, location?: LOCATION | undefined) => XRouteConstructor<KEY, RESOURCE, LOCATION>;
export interface IRouter extends XRouter<any, any, any> {
}
/**
 * Declarative routing via the History interface.
 */
export declare class XRouter<CONFIGS extends RouteConfig[], ROUTES extends {
    [C in CONFIGS[number] as C['key']]: LiveRoute<C>;
}, CONFIG extends CONFIGS[number]> {
    definition: CONFIGS;
    history: HistorySubset;
    config: {
        /** @optional `qs` library option OVERRIDES (careful!) */
        qs?: {
            parse?: qs.IParseOptions;
            format?: qs.IStringifyOptions;
        };
    };
    /** The synced location object. Also available within `this.routes[route].location`. */
    location: LocationPath;
    stopReactingToHistory?(): void;
    stopReactingToLocation?(): void;
    constructor(definition: CONFIGS, history: HistorySubset, config?: {
        /** @optional `qs` library option OVERRIDES (careful!) */
        qs?: {
            parse?: qs.IParseOptions;
            format?: qs.IStringifyOptions;
        };
    });
    private getLocationProperies;
    setLocation(location: this['location']): void;
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
    /** Converts a route to a { pathname, search, hash } parts. */
    toUriParts<ROUTE extends CONFIG>(route: ROUTE, location?: Partial2Deep<ROUTE['location']>): {
        pathname: string;
        search: string;
        hash: string;
    };
    /** history.push() a given route */
    push<ROUTE extends CONFIG>(route: ROUTE, location?: Partial2Deep<ROUTE['location']>): void;
    /** Equal to history.push(pathname) */
    push(fullPath: string): void;
    /** history.replace() a given route */
    /** Equal to history.replace(pathname) */
    replace<ROUTE extends CONFIG>(route: ROUTE, location?: Partial2Deep<ROUTE['location']>): void;
    replace(fullPath: string): void;
    go: HistorySubset['go'];
    back: HistorySubset['back'];
    forward: HistorySubset['forward'];
    block: HistorySubset['block'];
    /**
     * Be aware, toPath will throw if missing params.
     * When navigating from another route, ensure you provide all required params.
     */
    protected navigate<ROUTE_DEF extends CONFIG>(route: ROUTE_DEF | string, location?: Partial2Deep<ROUTE_DEF['location']>, method?: 'push' | 'replace'): void;
}
export type RouteConfig = ReturnType<typeof XRoute>;
interface LocationPath {
    hash: undefined | string;
    pathname: undefined | string;
    search: undefined | string;
}
/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */
export interface LiveRoute<CONFIG extends RouteConfig> {
    isActive: boolean;
    /** pathname variables @example resource `/:foo/:bar` to uri `/1/2` resolves `{ foo: '1', bar: '2' }` */
    pathname?: CONFIG['location']['pathname'];
    /** search variables @example uri `/?foo=1&bar=2` resolves `{ foo: '1', bar: '2' }` */
    search?: CONFIG['location']['search'];
    /** the hash string @example `/#foooo` resolves `foooo` */
    hash?: CONFIG['location']['hash'];
    /** Raw location object for current route state */
    location: LocationPath;
    /**
     * The full URI that the current route resolves to.
     * Essenitally a product of route.toUri(route)
     * Returns `undefined` when the current route is in an invalid state
     */
    uri: undefined | string;
    key: CONFIG['key'];
    resource: CONFIG['resource'];
    config: CONFIG;
    push(push: (location: Partial2Deep<CONFIG['location']>) => Partial2Deep<CONFIG['location']>): void;
    push(location?: Partial2Deep<CONFIG['location']>): void;
    pushExact(push: (location: CONFIG['location']) => CONFIG['location']): void;
    pushExact(location: CONFIG['location']): void;
    replace(replace: (location: Partial2Deep<CONFIG['location']>) => Partial2Deep<CONFIG['location']>): void;
    replace(location?: Partial2Deep<CONFIG['location']>): void;
    replaceExact(replace: (location: CONFIG['location']) => CONFIG['location']): void;
    replaceExact(location: CONFIG['location']): void;
    toUri(toUri: (location: Partial2Deep<CONFIG['location']>) => Partial2Deep<CONFIG['location']>): string;
    toUri(location?: Partial2Deep<CONFIG['location']>): string;
    toUriExact(toUriExact: (location: CONFIG['location']) => CONFIG['location']): string;
    toUriExact(location: CONFIG['location']): string;
}
export interface ActiveLiveRoute<CONFIG extends RouteConfig> extends LiveRoute<CONFIG> {
    isActive: true;
    pathname: CONFIG['location']['pathname'];
    search: CONFIG['location']['search'];
    hash: CONFIG['location']['hash'];
}
/** Cast a list of LiveRoute[] to ActiveLiveRoute[]  */
export declare function asActiveRoutes<ROUTE extends LiveRoute<RouteConfig>>(routes: (undefined | ROUTE)[]): (ActiveLiveRoute<ROUTE["config"]> | undefined)[];
export declare function asActiveRoute<ROUTE extends LiveRoute<RouteConfig>>(route: undefined | ROUTE): ActiveLiveRoute<ROUTE["config"]> | undefined;
/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
export declare function findActiveRoute<ROUTE extends LiveRoute<RouteConfig>>(routes: ROUTE[]): ActiveLiveRoute<ROUTE["config"]> | undefined;
type Partial2Deep<T> = {
    [P in keyof T]?: P extends {} ? Partial<T[P]> : P;
};
export interface HistorySubset {
    readonly location: LocationPath;
    push(to: To, state?: any): void;
    replace(to: To, state?: any): void;
    go(delta: number): void;
    back(): void;
    forward(): void;
    listen(listener: (update: HistoryUpdate) => void): () => void;
    block(blocker: (tx: {
        retry(): void;
    } & HistoryUpdate) => void): void;
}
type To = string | LocationPath;
interface HistoryUpdate {
    action: string;
    location: LocationPath;
}
export declare enum HistoryAction {
    Pop = "POP",
    Push = "PUSH",
    Replace = "REPLACE"
}
export {};
