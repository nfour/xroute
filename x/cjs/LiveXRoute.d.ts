import { RouteConfig } from './XRoute';
import { type XRouter, type XRouterOptions } from './XRouter';
type Partial2Deep<T, DEPTH = 1> = {
    [P in keyof T]?: DEPTH extends 2 ? T[P] : Partial2Deep<T[P], 2>;
};
export type LiveXRouteOptions = Pick<XRouterOptions, 'useOptimizedObservability'>;
/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */
export declare class LiveXRoute<CONFIG extends RouteConfig, ROUTER extends XRouter<any> = XRouter<any>> {
    #private;
    private config;
    options: LiveXRouteOptions;
    /** Deep partial config location */
    LOCATION_INPUT: Partial2Deep<CONFIG['location']>;
    /** Config location */
    LOCATION: CONFIG['location'];
    constructor(config: CONFIG, router: ROUTER, options?: LiveXRouteOptions);
    /** Cleanup reactions */
    dispose: () => void;
    get key(): CONFIG['key'];
    get resource(): CONFIG['resource'];
    /** Warning: Use this.pathname, this.search, this.hash for optimal observability performance */
    get location(): this['LOCATION'];
    get pathnameMatch(): import("path-to-regexp").MatchResult<object> | undefined;
    /**
     * Whether this route's `resource` matches the current `pathname`.
     * More than one route can match at a time.
     */
    get isMatching(): boolean;
    /**
     * Whether this route is matched,
     * and is also the route which is matched **first** in order of definition in the router.
     */
    get isActive(): boolean;
    /**
     * Pathname variables, as defined in the `resource` URL pattern.
     *
     * @example
     *
     * Given uri `/user/:id`
     * Resolves { id: '123' }
     */
    pathname: CONFIG["location"]["pathname"];
    /**
     * Search variables
     *
     * @example
     *
     * Given uri `/myApp/?foo=1&bar=2&baz[a]=2`
     * Resolves { foo: '1', bar: '2', baz: { a: '2' } }
     */
    search: CONFIG["location"]["search"];
    /**
     * The hash string
     *
     * @example
     *
     * Given uri `/some/url/?aaaa=1#foooo`
     * Resolves 'foooo'
     */
    get hash(): CONFIG['location']['hash'];
    /**
     * Pushes a URI update to the history stack.
     * Input can be a subset of the route's location as it
     * mMerges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    push(input?: ((location: this['LOCATION']) => this['LOCATION_INPUT']) | this['LOCATION_INPUT']): void;
    /**
     * Pushes a URI update to the history stack.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    pushExact(input: ((location: this['LOCATION']) => this['LOCATION']) | this['LOCATION']): void;
    /**
     * Replaces the current URI in the history stack.
     * Input can be a subset of the route's location as it
     * Merges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    replace(input?: ((route: this['LOCATION']) => this['LOCATION_INPUT']) | this['LOCATION_INPUT']): void;
    /**
     * Replaces the current URI in the history stack.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    replaceExact(input: ((route: this['LOCATION']) => this['LOCATION']) | this['LOCATION']): void;
    /**
     * Converts the route to a URI string.
     * Input can be a subset of the route's location as it
     * Merges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    toUri(input?: ((route: this['LOCATION']) => this['LOCATION_INPUT']) | this['LOCATION_INPUT']): string;
    /**
     * Converts the route to a URI string.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    toUriExact(input: ((route: this['LOCATION']) => this['LOCATION']) | this['LOCATION']): string;
    /** @deprecated use toUri() */
    get uri(): string | undefined;
    toJSON(): {
        key: CONFIG["key"];
        resource: CONFIG["resource"];
        pathname: CONFIG["location"]["pathname"];
        search: CONFIG["location"]["search"];
        hash: CONFIG["location"]["hash"];
        isActive: boolean;
        isMatching: boolean;
    };
    protected mergeLocationWithActiveRoute(location?: this['LOCATION_INPUT']): {
        pathname: any;
        search: any;
        hash: any;
    };
    protected get activeRoute(): ROUTER["ROUTE"] | undefined;
    protected handlePolymorphicInput<P extends object>(input?: P | ((o: any) => P)): P | undefined;
}
export {};
