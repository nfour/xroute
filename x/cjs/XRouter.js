"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryAction = exports.findActiveRoute = exports.asActiveRoute = exports.asActiveRoutes = exports.XRouter = exports.XRoute = exports.XRouteConstructor = void 0;
const lodash_1 = require("lodash");
const mobx_1 = require("mobx");
const path_to_regexp_1 = require("path-to-regexp");
const qs = require("qs");
class XRouteConstructor {
    constructor(key, resource = '', location = {}) {
        Object.defineProperty(this, "key", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: key
        });
        Object.defineProperty(this, "resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: resource
        });
        Object.defineProperty(this, "location", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: location
        });
    }
    Resource(r) {
        return new XRouteConstructor(this.key, r, this.location);
    }
    Type(l) {
        return new XRouteConstructor(this.key, this.resource, l);
    }
}
exports.XRouteConstructor = XRouteConstructor;
/** @deprecated Use .Type on instance instead. */
Object.defineProperty(XRouteConstructor, "Type", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: (v) => v
});
const XRoute = (key, resource, location) => new XRouteConstructor(key, resource, location);
exports.XRoute = XRoute;
/**
 * Declarative routing via the History interface.
 */
class XRouter {
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
        (0, mobx_1.makeAutoObservable)(this, {
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
        this.stopReactingToLocation = (0, mobx_1.reaction)(() => this.location, (location) => {
            if ((0, lodash_1.isEqual)(this.getLocationProperies(this.history.location), location))
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
            const matched = (0, path_to_regexp_1.match)(resource, {
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
            const inputHandler = (handler) => (input) => {
                const value = typeof input === 'function' ? input(newRoute) : input;
                return handler(value);
            };
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
                push: inputHandler((p) => this.push(route, mergeLocation(p))),
                pushExact: inputHandler((p) => this.push(route, p)),
                replace: inputHandler((p) => this.replace(route, mergeLocation(p))),
                replaceExact: inputHandler((p) => this.replace(route, p)),
                toUri: inputHandler((p) => this.toUri(route, mergeLocation(p))),
                toUriExact: inputHandler((p) => this.toUri(route, p)),
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
            const pathname = (0, path_to_regexp_1.compile)(resource)({ ...(location?.pathname ?? {}) }) || '/';
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
exports.XRouter = XRouter;
/** Cast a list of LiveRoute[] to ActiveLiveRoute[]  */
function asActiveRoutes(routes) {
    return routes.map(asActiveRoute);
}
exports.asActiveRoutes = asActiveRoutes;
function asActiveRoute(route) {
    return route;
}
exports.asActiveRoute = asActiveRoute;
/** Within LiveRoute[] find where isActive === true and return ActiveLiveRoute */
function findActiveRoute(routes) {
    return asActiveRoutes(routes).find((r) => r?.isActive);
}
exports.findActiveRoute = findActiveRoute;
var HistoryAction;
(function (HistoryAction) {
    HistoryAction["Pop"] = "POP";
    HistoryAction["Push"] = "PUSH";
    HistoryAction["Replace"] = "REPLACE";
})(HistoryAction || (exports.HistoryAction = HistoryAction = {}));
