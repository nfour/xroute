import { History, Location } from 'history';
/** Create a typed route config object */
export declare const XRoute: <KEY extends string, RESOURCE extends string, PARAMS extends {}>(key: KEY, resource: RESOURCE, params: PARAMS) => {
    key: KEY;
    resource: RESOURCE;
    params: PARAMS;
};
/**
 * The Mobx class which handles routing over History.
 */
export declare class XRouter<LIST extends RouteConfig[], KEYS extends LIST[number]['key'], ROUTES extends {
    [ITEM in LIST[number] as ITEM['key']]: LiveRoute<ITEM>;
}> {
    location: Location;
    definition: LIST;
    dispose: () => void;
    protected history: History;
    constructor(definition: LIST, history?: History);
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
    get route(): ActiveLiveRoute<Required<ROUTES[KEYS]>> | undefined;
    /** history.push() a given route */
    push<ROUTE extends RouteConfig>(route: ROUTE, params?: ROUTE['params']): void;
    /** Equal to history.push(pathname) */
    push(pathname: string): void;
    /** history.replace() a given route */
    replace<ROUTE extends RouteConfig>(route: ROUTE, params?: ROUTE['params']): void;
    /** Equal to history.replace(pathname) */
    replace(pathname: string): void;
    go: History['go'];
    back: History['back'];
    forward: History['forward'];
    block: History['block'];
    /**
     * Be aware, toPath will throw if missing params.
     * When navigating from another route, ensure you provide all required params.
     */
    protected navigate<ROUTE_DEF extends RouteConfig>(route: ROUTE_DEF | string, params?: Partial<ROUTE_DEF['params']>, method?: 'push' | 'replace'): void;
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
    push(params: ITEM['params']): void;
    replace(params: ITEM['params']): void;
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
export declare function asActiveRoutes<ROUTE extends LiveRoute<any>>(routes: ROUTE[]): ActiveLiveRoute<Required<ROUTE>>[];
export declare function asActiveRoute<ROUTE extends LiveRoute<any>>(route: ROUTE): ActiveLiveRoute<Required<ROUTE>>;
/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
export declare function findActiveRoute<ROUTE extends LiveRoute<any>>(routes: ROUTE[]): ActiveLiveRoute<Required<ROUTE>> | undefined;
