import { History, Location } from 'history';
import * as qs from 'qs';
export interface ReactionFn {
    (reactTo: () => any, onChange: (v: any) => any): () => any;
}
/** Create a typed route config object */
export declare const XRoute: <KEY extends string, RESOURCE extends string, LOCATION extends {
    search?: {} | undefined;
    pathname?: {} | undefined;
    hash?: string | undefined;
}>(key: KEY, resource: RESOURCE, location: LOCATION) => {
    key: KEY;
    resource: RESOURCE;
    location: LOCATION;
};
export interface IRouter extends XRouter<any, any, any, any> {
}
/**
 * Declarative routing via the History interface.
 */
export declare class XRouter<LIST extends RouteConfig[], KEYS extends LIST[number]['key'], ROUTES extends {
    [ITEM in LIST[number] as ITEM['key']]: LiveRoute<ITEM>;
}, ROUTE_CONFIG extends RouteConfig> {
    definition: LIST;
    history: History;
    config: {
        qs?: {
            parse?: qs.IParseOptions;
            format?: qs.IStringifyOptions;
        };
    };
    location: Location;
    stopReactingToHistory?(): void;
    stopReactingToLocation?(): void;
    constructor(definition: LIST, history: History, config?: {
        qs?: {
            parse?: qs.IParseOptions;
            format?: qs.IStringifyOptions;
        };
    });
    setLocation(location: Location): void;
    startReacting(): void;
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
    get routes(): ROUTES;
    /** The currently active route. */
    get route(): undefined | ROUTES[keyof ROUTES];
    /** Converts a route to a string path. */
    toUri<ROUTE extends ROUTE_CONFIG>(route: ROUTE, params?: ROUTE['location']): string;
    /** history.push() a given route */
    push<ROUTE extends ROUTE_CONFIG>(route: ROUTE, params?: ROUTE['location']): void;
    /** Equal to history.push(pathname) */
    push(pathname: string): void;
    /** history.replace() a given route */
    /** Equal to history.replace(pathname) */
    replace<ROUTE extends ROUTE_CONFIG>(route: ROUTE, params?: ROUTE['location']): void;
    replace(pathname: string): void;
    go: History['go'];
    back: History['back'];
    forward: History['forward'];
    block: History['block'];
    /**
     * Be aware, toPath will throw if missing params.
     * When navigating from another route, ensure you provide all required params.
     */
    protected navigate<ROUTE_DEF extends ROUTE_CONFIG>(route: ROUTE_DEF | string, location?: Partial<ROUTE_DEF['location']>, method?: 'push' | 'replace'): void;
}
export declare type RouteConfig = ReturnType<typeof XRoute>;
/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */
export interface LiveRoute<ITEM extends RouteConfig> {
    key: ITEM['key'];
    resource: ITEM['resource'];
    location: Location;
    isActive: boolean;
    pathname?: ITEM['location']['pathname'];
    hash?: ITEM['location']['hash'];
    search?: ITEM['location']['search'];
    push(params?: Partial<ITEM['location']>): void;
    pushExact(params: ITEM['location']): void;
    replace(params?: Partial<ITEM['location']>): void;
    replaceExact(params: ITEM['location']): void;
    toUri(params?: Partial<ITEM['location']>): string;
    toPathExact(params: ITEM['location']): string;
}
export interface ActiveLiveRoute<ITEM extends RouteConfig> extends LiveRoute<ITEM> {
    pathname: ITEM['location']['pathname'];
    search: ITEM['location']['search'];
    hash: ITEM['location']['hash'];
    isActive: true;
}
/** Cast a list of LiveRoute[] to ActiveLiveRoute[]  */
export declare function asActiveRoutes<ROUTE extends undefined | LiveRoute<RouteConfig>>(routes: ROUTE[]): (ActiveLiveRoute<Required<NonNullable<ROUTE>>> | undefined)[];
export declare function asActiveRoute<ROUTE extends undefined | LiveRoute<any>>(route: ROUTE): ActiveLiveRoute<Required<NonNullable<ROUTE>>> | undefined;
/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
export declare function findActiveRoute<ROUTE extends undefined | LiveRoute<RouteConfig>>(routes: ROUTE[]): ActiveLiveRoute<Required<NonNullable<ROUTE>>> | undefined;
