import { History, Location } from 'history';
import { Union } from 'ts-toolbelt';
/** Create a typed route object of shape IXRoute */
export declare const XRoute: <KEY extends string, RESOURCE extends string, PARAMS extends {}>(key: KEY, resource: RESOURCE, params: PARAMS) => {
    key: KEY;
    resource: RESOURCE;
    params: PARAMS;
};
/**
 * The Mobx class which holds routes.
 */
export declare class XRouter<LIST extends IXRoute[], KEYS extends LIST[number]['key'], ROUTES extends {
    [KEY in KEYS]: ILiveRoute<Union.Select<LIST[number], {
        key: KEY;
    }>>;
}, LOOSE_ROUTE extends ILiveRoute<LIST[number]>> {
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
    get route(): undefined | LOOSE_ROUTE;
    /** history.push() a given route */
    push<ROUTE extends IXRoute>(route: ROUTE, params?: ROUTE['params']): void;
    /** Equal to history.push(pathname) */
    push(pathname: string): void;
    /** history.replace() a given route */
    replace<ROUTE extends IXRoute>(route: ROUTE, params?: ROUTE['params']): void;
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
    protected navigate<ROUTE_DEF extends IXRoute>(route: ROUTE_DEF | string, params?: Partial<ROUTE_DEF['params']>, method?: 'push' | 'replace'): void;
}
export declare type IXRoute = ReturnType<typeof XRoute>;
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
export {};
