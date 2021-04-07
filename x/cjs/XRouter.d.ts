import { History, Location } from 'history';
export interface ReactionFn {
    (reactTo: () => any, onChange: (v: any) => any): () => any;
}
/** Create a typed route config object */
export declare const XRoute: <KEY extends string, RESOURCE extends string, PARAMS extends {}>(key: KEY, resource: RESOURCE, params: PARAMS) => {
    key: KEY;
    resource: RESOURCE;
    params: PARAMS;
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
    location: Location;
    stopReactingToHistory?(): void;
    stopReactingToLocation?(): void;
    constructor(definition: LIST, history: History);
    startReacting(): void;
    setLocation(location: Location): void;
    dispose(): void;
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
    get route(): ActiveLiveRoute<Required<NonNullable<ROUTES[KEYS]>>> | undefined;
    toPath<ROUTE extends ROUTE_CONFIG>(route: ROUTE, params?: ROUTE['params']): string;
    /** history.push() a given route */
    push<ROUTE extends ROUTE_CONFIG>(route: ROUTE, params?: ROUTE['params']): void;
    /** Equal to history.push(pathname) */
    push(pathname: string): void;
    /** history.replace() a given route */
    /** Equal to history.replace(pathname) */
    replace<ROUTE extends ROUTE_CONFIG>(route: ROUTE, params?: ROUTE['params']): void;
    replace(pathname: string): void;
    go: History['go'];
    back: History['back'];
    forward: History['forward'];
    block: History['block'];
    /**
     * Be aware, toPath will throw if missing params.
     * When navigating from another route, ensure you provide all required params.
     */
    protected navigate<ROUTE_DEF extends ROUTE_CONFIG>(route: ROUTE_DEF | string, params?: Partial<ROUTE_DEF['params']>, method?: 'push' | 'replace'): void;
}
export declare type RouteConfig = ReturnType<typeof XRoute>;
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
    push(params?: Partial<ITEM['params']>): void;
    pushExact(params: ITEM['params']): void;
    replace(params?: Partial<ITEM['params']>): void;
    replaceExact(params: ITEM['params']): void;
    toPath(params?: Partial<ITEM['params']>): string;
    toPathExact(params: ITEM['params']): string;
}
export interface ActiveLiveRoute<ITEM extends RouteConfig> extends LiveRoute<ITEM> {
    params: ITEM['params'];
    resource: ITEM['resource'];
    key: ITEM['key'];
    path: string;
    index: number;
    hash: string;
    isActive: true;
}
/** Cast a list of LiveRoute[] to ActiveLiveRoute[]  */
export declare function asActiveRoutes<ROUTE extends undefined | LiveRoute<any>>(routes: ROUTE[]): (ActiveLiveRoute<Required<NonNullable<ROUTE>>> | undefined)[];
export declare function asActiveRoute<ROUTE extends undefined | LiveRoute<any>>(route: ROUTE): ActiveLiveRoute<Required<NonNullable<ROUTE>>> | undefined;
/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
export declare function findActiveRoute<ROUTE extends undefined | LiveRoute<any>>(routes: ROUTE[]): ActiveLiveRoute<Required<NonNullable<ROUTE>>> | undefined;
