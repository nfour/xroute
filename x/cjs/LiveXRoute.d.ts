import { RouteConfig } from './XRoute';
import { type XRouter } from './XRouter';
import type { PartialDeep } from 'type-fest';
/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */
export declare class LiveXRoute<CONFIG extends RouteConfig, ROUTER extends XRouter<any> = XRouter<any>> {
    #private;
    private config;
    /** Deep partial config location */
    PL: PartialDeep<CONFIG['location']>;
    /** Config location */
    L: CONFIG['location'];
    constructor(config: CONFIG, router: ROUTER);
    get key(): CONFIG['key'];
    get resource(): CONFIG['resource'];
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
    get pathname(): CONFIG['location']['pathname'];
    /**
     * Search variables
     *
     * @example
     *
     * Given uri `/myApp/?foo=1&bar=2&baz[a]=2`
     * Resolves { foo: '1', bar: '2', baz: { a: '2' } }
     */
    get search(): CONFIG['location']['search'];
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
    push(input?: ((location: this['L']) => this['PL']) | this['PL']): void;
    /**
     * Pushes a URI update to the history stack.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    pushExact(input: ((location: this['L']) => this['L']) | this['L']): void;
    /**
     * Replaces the current URI in the history stack.
     * Input can be a subset of the route's location as it
     * Merges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    replace(input?: ((route: this['L']) => this['PL']) | this['PL']): void;
    /**
     * Replaces the current URI in the history stack.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    replaceExact(input: ((route: this['L']) => this['L']) | this['L']): void;
    /**
     * Converts the route to a URI string.
     * Input can be a subset of the route's location as it
     * Merges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    toUri(input?: ((route: this['L']) => this['PL']) | this['PL']): string;
    /**
     * Converts the route to a URI string.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    toUriExact(input: ((route: this['L']) => this['L']) | this['L']): string;
    /** @deprecated use toUri() */
    get uri(): string | undefined;
    /** @deprecated Use router.pathname, router.search, router.hash */
    get location(): {
        pathname: string;
        search: string;
        hash: string;
    };
    toJSON(): {
        key: CONFIG["key"];
        resource: CONFIG["resource"];
        pathname: CONFIG["location"]["pathname"];
        search: CONFIG["location"]["search"];
        hash: CONFIG["location"]["hash"];
        isActive: boolean;
        isMatching: boolean;
    };
    protected mergeLocationWithActiveRoute(location?: this['PL']): {
        pathname: any;
        search: any;
        hash: any;
    };
    protected get activeRoute(): ROUTER["ROUTE"] | undefined;
    protected handlePolymorphicInput<P extends object>(input?: P | ((o: any) => P)): P | undefined;
}
