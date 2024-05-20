import { makeAutoObservable } from 'mobx';
import { compile } from 'path-to-regexp';
import * as qs from 'qs';
import { LiveXRoute } from './LiveXRoute';
import { HistoryObserver, } from './HistoryObserver';
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
export class XRouter {
    constructor(
    /**
     * An array of route configurations. Order matters for finding the active route.
     */
    definition, 
    /**
     * `history` instance
     * @example
     * createBrowserHistory()
     */
    history, 
    /**
     * Additional config options for various components.
     */
    config = {}) {
        Object.defineProperty(this, "definition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: definition
        });
        Object.defineProperty(this, "history", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: history
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
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
        Object.defineProperty(this, "routes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ROUTE", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ROUTE_LOCATION", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Current pathname string
         * @example
         * '/app'
         */
        Object.defineProperty(this, "pathname", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        /**
         * Current search string
         * @example
         * '?foo=1'
         */
        Object.defineProperty(this, "search", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        /**
         * Current hash string
         * @example
         * '#my-hash'
         */
        Object.defineProperty(this, "hash", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "historyObserver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new HistoryObserver(() => this.history, ({ location }) => this.setLocation(location))
        });
        /** `history.go()` */
        Object.defineProperty(this, "go", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.history.go(...args)
        });
        /** `history.back()` */
        Object.defineProperty(this, "back", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this.history.back()
        });
        /** `history.forward()` */
        Object.defineProperty(this, "forward", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this.history.forward()
        });
        /** `history.block()` */
        Object.defineProperty(this, "block", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.history.block(...args)
        });
        this.definition = definition;
        this.history = history;
        this.config = config;
        makeAutoObservable(this, {
            history: false,
            toJSON: false,
            routes: false,
        });
        this.historyObserver.listen();
        this.routes = Object.fromEntries(this.definition.map((config) => [
            config.key,
            new LiveXRoute(config, this),
        ]));
    }
    /** The currently active route. */
    get route() {
        for (const config of this.definition) {
            const route = this.routes[config.key];
            if (route.isMatching)
                return route;
        }
    }
    /** Converts a route to a string path. */
    toUri(route, location) {
        const { pathname, search, hash } = this.toUriParts(route, location);
        return `${pathname}${search}${hash}`;
    }
    push(route, location) {
        this.navigate(route, location, 'push');
    }
    replace(route, location) {
        this.navigate(route, location, 'replace');
    }
    toJSON() {
        return {
            pathname: this.pathname,
            search: this.search,
            hash: this.hash,
            route: this.route?.toJSON(),
            routes: Object.fromEntries(Object.entries(this.routes).map(([k, v]) => [
                k,
                v.toJSON(),
            ])),
            history: this.history,
        };
    }
    setLocation(next = {}) {
        if (this.pathname !== next.pathname)
            this.pathname = next.pathname ?? '';
        if (this.search !== next.search)
            this.search = next.search ?? '';
        if (this.hash !== next.hash)
            this.hash = next.hash ?? '';
    }
    /** Converts a route to a { pathname, search, hash } parts. */
    toUriParts(route, location) {
        const { resource, key } = route;
        try {
            const pathname = compile(resource, {
                encode: encodeURI,
            })({ ...(location?.pathname ?? {}) }) || '/';
            const searchQs = typeof location?.search === 'string'
                ? location.search
                : qs.stringify(location?.search ?? {}, {
                    addQueryPrefix: false,
                    encodeValuesOnly: true,
                    format: 'RFC3986',
                    ...this.config.qs?.format,
                });
            const hash = location?.hash ? `#${location.hash}`.replace(/^#+/, '#') : '';
            const search = searchQs ? `?${searchQs}` : '';
            return { pathname, search, hash };
        }
        catch (error) {
            throw new Error(`XRoute INVALID_PARAMS:\n\nROUTE    : ${key}\nRESOURCE : ${resource}\nLOCATION : ${JSON.stringify(location)}\n\n ${error}`);
        }
    }
    /**
     * Be aware, toPath will throw if missing params.
     */
    navigate(route, location, method = 'push') {
        if (typeof route === 'string') {
            return this.history[method](route);
        }
        const { pathname, search, hash } = this.toUriParts(route, location);
        // this.setLocation({ pathname, search, hash })
        this.history[method]({ pathname, search, hash });
    }
}
