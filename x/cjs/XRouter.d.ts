import * as qs from 'qs';
import { RouteConfig } from './XRoute';
import { LiveXRoute } from './LiveXRoute';
import { HistorySubset, LocationPrimitive } from './HistoryObserver';
export interface LocationType {
    pathname: {};
    search: {};
    hash?: string;
}
export interface XRouterOptions {
    /** @optional `qs` library option overrides */
    qs?: {
        parse?: qs.IParseOptions;
        format?: qs.IStringifyOptions;
    };
    /**
     * Whether to use `microdiff` to optimize `search` and `pathname` observability
     * @default true
     */
    useOptimizedObservability?: boolean;
}
/**
 * Declarative type safe routing synced to the browser location.
 *
 * @example
 *
 * const router = new XRouter([
 *  XRoute('home')
 *   .Resource('/')
 *   .Type<{ pathname: {}; search: {}; hash: '' }>(),
 * XRoute('app')
 *   .Resource('/app')
 *   .Type<{ pathname: {}; search: {}; hash: '' }>(),
 * XRoute('admin')
 *  .Resource('/admin/:section?')
 *  .Type<{
 *     pathname: { section?: 'upload' | 'settings' }
 *     search: {}
 *     hash: ''
 *   }>(),
 * ], createBrowserHistory(), {})
 */
export declare class XRouter<CONFIGS extends RouteConfig[]> {
    /**
     * An array of route configurations. Order matters for finding the active route.
     */
    definition: CONFIGS;
    /**
     * `history` instance
     * @example
     * createBrowserHistory()
     */
    history: HistorySubset;
    /**
     * Additional config options for various components.
     */
    options: XRouterOptions;
    /**
     * A map of routes `{ [route.key]: route }`
     *
     * @example
     *
     * // Read parameters
     * router.routes.myRoute.pathname?.myParam // string | undefined
     *
     * // Set the route and its parameters
     * // Can be used to set a route from a different route too
     * router.routes.myRoute.push({
     *   pathname: { myParam: 'banana' }, // Optional
     *   search: { foo: 1 }, // Optional
     *   hash: 'my has string' // Optional
     * })
     *
     * // on myRoute now...
     *
     * router.routes.someOtherRoute.push() // Even the object is optional
     *
     * // On someOtherRoute now.
     *
     * router.routes.routeWithRequired.replace({
     *   // router.route is always the activeRoute
     *   pathname: { myProp: router.route?.pathname?.myParam || 'something' }
     * })
     */
    routes: {
        [C in CONFIGS[number] as C['key']]: LiveXRoute<C, this>;
    };
    CONFIGS: CONFIGS[number];
    ROUTE: LiveXRoute<CONFIGS[number], this>;
    ROUTE_LOCATION: this['ROUTE']['LOCATION'];
    constructor(
    /**
     * An array of route configurations. Order matters for finding the active route.
     */
    definition: CONFIGS, 
    /**
     * `history` instance
     * @example
     * createBrowserHistory()
     */
    history: HistorySubset, 
    /**
     * Additional config options for various components.
     */
    options?: XRouterOptions);
    /**
     * Current pathname string
     * @example
     * '/app'
     */
    pathname: string;
    /**
     * Current search string
     * @example
     * '?foo=1'
     */
    search: string;
    /**
     * Current hash string
     * @example
     * '#my-hash'
     */
    hash: string;
    private historyObserver;
    /** The currently active route. */
    get route(): undefined | this['ROUTE'];
    /** Converts a route to a string path. */
    toUri<CONFIG extends RouteConfig>(config: CONFIG, location?: this['ROUTE_LOCATION']): string;
    push<CONFIG extends RouteConfig>(config: CONFIG | string, location?: this['ROUTE_LOCATION']): void;
    /**
     * `history.replace()` a given route
     */
    replace<CONFIG extends RouteConfig>(config: CONFIG | string, location?: this['ROUTE_LOCATION']): void;
    /** `history.go()` */
    go: HistorySubset['go'];
    /** `history.back()` */
    back: HistorySubset['back'];
    /** `history.forward()` */
    forward: HistorySubset['forward'];
    /** `history.block()` */
    block: HistorySubset['block'];
    /** Clean up any reactions/listeners */
    dispose: () => void;
    toJSON(): {
        pathname: string;
        search: string;
        hash: string;
        route: {
            key: CONFIGS[number]["key"];
            resource: CONFIGS[number]["resource"];
            pathname: CONFIGS[number]["location"]["pathname"];
            search: CONFIGS[number]["location"]["search"];
            hash: CONFIGS[number]["location"]["hash"];
            isActive: boolean;
            isMatching: boolean;
        } | undefined;
        routes: {
            [k: string]: {
                key: any;
                resource: any;
                pathname: any;
                search: any;
                hash: any;
                isActive: boolean;
                isMatching: boolean;
            };
        };
        history: HistorySubset;
    };
    protected setLocation(next?: LocationPrimitive): void;
    /** Converts a route to a { pathname, search, hash } parts. */
    protected toUriParts<CONFIG extends this['CONFIGS']>(config: CONFIG, location?: this['ROUTE_LOCATION']): {
        pathname: string;
        search: string;
        hash: string;
    };
    /**
     * Be aware, toPath will throw if missing params.
     */
    protected navigate<CONFIG extends this['CONFIGS']>(route: CONFIG | string, location?: this['ROUTE_LOCATION'], method?: 'push' | 'replace'): void;
}
