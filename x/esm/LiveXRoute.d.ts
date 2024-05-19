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
    get key(): string;
    get resource(): string;
    private get pathnameMatch();
    /**
     * Whether this route's `resource` matches the current `pathname`.
     * More than one route can match at a time.
     */
    get isMatching(): boolean;
    /**
     * Whether this route is matched,
     * and is also the route which is ordered first
     * (takes precendent) on construction of the router.
     */
    get isActive(): boolean;
    /** pathname variables @example resource `/:foo/:bar` to uri `/1/2` resolves `{ foo: '1', bar: '2' }` */
    get pathname(): CONFIG['location']['pathname'];
    /** search variables @example uri `/?foo=1&bar=2` resolves to `{ foo: '1', bar: '2' }` */
    get search(): CONFIG['location']['search'];
    /** The hash string
     * @example `#foooo` resolves `foooo`
     */
    get hash(): CONFIG['location']['hash'];
    push(input?: ((location: this['L']) => this['PL']) | this['PL']): void;
    pushExact(input: ((location: this['L']) => this['L']) | this['L']): void;
    replace(input?: ((route: this['L']) => this['PL']) | this['PL']): void;
    replaceExact(input: ((route: this['L']) => this['L']) | this['L']): void;
    toUri(input?: ((route: this['L']) => this['PL']) | this['PL']): string;
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
        key: string;
        resource: string;
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
