import * as qs from 'qs';
import { RouteConfig } from './XRoute';
import { LiveXRoute } from './LiveXRoute';
import { HistoryObserver, HistorySubset, LocationPrimitive } from './HistoryObserver';
export interface LocationType {
    pathname: Record<string, any>;
    search: Record<string, any>;
    hash?: string;
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
    definition: CONFIGS;
    history: HistorySubset;
    config: {
        /** @optional `qs` library option OVERRIDES (careful!) */
        qs?: {
            parse?: qs.IParseOptions;
            format?: qs.IStringifyOptions;
        };
        /**
         * Passed to the mobx reaction which is responsible for updating the URI when the observable state changes.
         * @default is 1ms */
        delayToUpdateUri?: number;
    };
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
    ROUTE: LiveXRoute<CONFIGS[number], this>;
    ROUTE_LOCATION: this['ROUTE']['PL'];
    pathname: string;
    search: string;
    hash: string;
    historyObserver: HistoryObserver;
    constructor(definition: CONFIGS, history: HistorySubset, config?: {
        /** @optional `qs` library option OVERRIDES (careful!) */
        qs?: {
            parse?: qs.IParseOptions;
            format?: qs.IStringifyOptions;
        };
        /**
         * Passed to the mobx reaction which is responsible for updating the URI when the observable state changes.
         * @default is 1ms */
        delayToUpdateUri?: number;
    });
    /** The currently active route. */
    get route(): undefined | this['ROUTE'];
    /** Converts a route to a string path. */
    toUri<ROUTE extends this['ROUTE']>(route: ROUTE, location?: this['ROUTE_LOCATION']): string;
    /** history.push() a given route */
    push<ROUTE extends this['ROUTE']>(route: ROUTE, location?: this['ROUTE_LOCATION']): void;
    /** Equal to history.push(pathname) */
    push(fullPath: string): void;
    /** history.replace() a given route */
    /** Equal to history.replace(pathname) */
    replace<ROUTE extends this['ROUTE']>(route: ROUTE, location?: this['ROUTE_LOCATION']): void;
    replace(fullPath: string): void;
    go: HistorySubset['go'];
    back: HistorySubset['back'];
    forward: HistorySubset['forward'];
    block: HistorySubset['block'];
    toJSON(): {
        pathname: string;
        search: string;
        hash: string;
        route: {
            key: CONFIGS[number]["key"];
            /** Equal to history.push(pathname) */
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
                /** Equal to history.push(pathname) */
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
    protected toUriParts<ROUTE extends this['ROUTE']>(route: ROUTE, location?: this['ROUTE_LOCATION']): {
        pathname: string;
        search: string;
        hash: string;
    };
    /**
     * Be aware, toPath will throw if missing params.
     */
    protected navigate<ROUTE extends this['ROUTE']>(route: ROUTE | string, location?: this['ROUTE_LOCATION'], method?: 'push' | 'replace'): void;
}
