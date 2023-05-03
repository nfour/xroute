import { isEqual } from 'lodash';
import { makeAutoObservable, reaction } from 'mobx';
import { compile, match } from 'path-to-regexp';
import * as qs from 'qs';
/** Create a typed route config object */
export const XRoute = (key, resource, location) => ({ key, resource, location });
XRoute.Type = ((v) => v);
/**
 * Declarative routing via the History interface.
 */
export class XRouter {
    constructor(definition, history, config = {}) {
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
        /** The synced location object. Also available within `this.routes[route].location`. */
        Object.defineProperty(this, "location", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                hash: '',
                pathname: '',
                search: '',
            }
        });
        Object.defineProperty(this, "getLocationProperies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ({ hash, pathname, search, }) => {
                return { pathname, search, hash };
            }
        });
        Object.defineProperty(this, "go", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.history.go(...args)
        });
        Object.defineProperty(this, "back", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this.history.back()
        });
        Object.defineProperty(this, "forward", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this.history.forward()
        });
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
            definition: false,
            config: false,
        });
        this.startReacting();
    }
    setLocation(location) {
        this.location = this.getLocationProperies(location);
    }
    /** Start reacting to changes. This is automatically called on construction. */
    startReacting() {
        this.stopReacting();
        this.setLocation(this.history.location);
        this.stopReactingToHistory = this.history.listen(({ location }) => this.setLocation(location));
        this.stopReactingToLocation = reaction(() => this.location, (location) => {
            if (isEqual(this.getLocationProperies(this.history.location), location))
                return;
            this.history.replace(location);
        });
    }
    /** Stop reacting to all changes - disposer. */
    stopReacting() {
        this.stopReactingToHistory?.();
        this.stopReactingToLocation?.();
    }
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
     * router.routes.myRoute.push({ pathname: { myParam: 'banana' } })
     *
     * // on myRoute now...
     *
     * router.routes.someOtherRoute.push({})
     *
     * // On someOtherRoute now.
     *
     * router.routes.routeWithRequired.push({
     *   // router.route is always the activeRoute
     *   pathname: { myProp: router.route?.pathname?.myParam || 'something' }
     * })
     */
    get routes() {
        const location = this.location;
        // TODO: Should it be configurable to allow multiple matches?
        let isAlreadyMatched = false;
        return this.definition.reduce((routes, _route) => {
            const route = _route;
            const { key, resource } = route;
            const matched = match(resource, {
                decode: decodeURI,
                encode: encodeURI,
            })(location.pathname ?? '');
            const { index, params: pathname } = matched || {};
            const mergeLocation = (p = {}) => ({
                pathname: {
                    ...this.route?.pathname,
                    ...p.pathname,
                },
                search: {
                    ...(this.route?.key === route.key ? this.route.search : {}),
                    ...p.search,
                },
                hash: p.hash ?? this.route?.hash,
            });
            const isActive = isAlreadyMatched === false && index !== undefined;
            if (isActive)
                isAlreadyMatched = true;
            const search = qs.parse(location.search ?? '', {
                ignoreQueryPrefix: true,
                ...this.config.qs?.parse,
            });
            // TODO: convert to a class LiveRoute {}
            const newRoute = {
                isActive,
                key,
                resource,
                search,
                pathname,
                config: route,
                hash: location.hash,
                get location() {
                    return { ...location };
                },
                get uri() {
                    return `${location.pathname}${location.search}${location.hash}`;
                },
                push: (p) => this.push(route, mergeLocation(p)),
                pushExact: (p) => this.push(route, p),
                replace: (p) => this.replace(route, mergeLocation(p)),
                replaceExact: (p) => this.replace(route, p),
                toUri: (p) => this.toUri(route, mergeLocation(p)),
                toUriExact: (p) => this.toUri(route, p),
            };
            return { ...routes, [key]: newRoute };
        }, {});
    }
    /** The currently active route. */
    get route() {
        if (!this.routes)
            return;
        // Get routes in order.
        for (const { key } of this.definition) {
            const route = this.routes[key];
            if (route.isActive)
                return route;
        }
    }
    /** Converts a route to a string path. */
    toUri(route, location) {
        const { pathname, search, hash } = this.toUriParts(route, location);
        return `${pathname}${search}${hash}`;
    }
    /** Converts a route to a { pathname, search, hash } parts. */
    toUriParts(route, location) {
        const { resource, key } = route;
        try {
            const pathname = compile(resource)({ ...(location?.pathname ?? {}) }) || '/';
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
            throw new Error(`INVALID_PARAMS\nROUTE: ${key}\nPATH: ${resource}\n ${error}`);
        }
    }
    push(route, location) {
        this.navigate(route, location, 'push');
    }
    replace(route, location) {
        this.navigate(route, location, 'replace');
    }
    /**
     * Be aware, toPath will throw if missing params.
     * When navigating from another route, ensure you provide all required params.
     */
    navigate(route, location = {}, method = 'push') {
        if (typeof route === 'string') {
            return this.history[method](route);
        }
        const { pathname, search, hash } = this.toUriParts(route, location);
        this.history[method]({ pathname, search, hash });
    }
}
/** Cast a list of LiveRoute[] to ActiveLiveRoute[]  */
export function asActiveRoutes(routes) {
    return routes.map(asActiveRoute);
}
export function asActiveRoute(route) {
    return route;
}
/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
export function findActiveRoute(routes) {
    return asActiveRoutes(routes).find((r) => r?.isActive);
}
export var HistoryAction;
(function (HistoryAction) {
    HistoryAction["Pop"] = "POP";
    HistoryAction["Push"] = "PUSH";
    HistoryAction["Replace"] = "REPLACE";
})(HistoryAction || (HistoryAction = {}));
