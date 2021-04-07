import isEqual from 'lodash-es/isEqual';
import { makeAutoObservable, reaction } from 'mobx';
import { compile, match } from 'path-to-regexp';
import * as qs from 'qs';
/** Create a typed route config object */
export const XRoute = (key, resource, location) => ({ key, resource, location });
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
        Object.defineProperty(this, "location", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                hash: '',
                key: '',
                pathname: '',
                search: '',
                state: {},
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
        makeAutoObservable(this);
        this.startReacting();
    }
    setLocation(location) {
        if (isEqual(this.location, location))
            return;
        this.location = { ...location };
    }
    startReacting() {
        this.setLocation(this.history.location);
        this.stopReactingToHistory = this.history.listen(({ location }) => this.setLocation(location));
        this.stopReactingToLocation = reaction(() => this.location, (location) => {
            if (isEqual(this.history.location, location))
                return;
            this.history.replace({ ...location });
        });
    }
    stopReacting() {
        var _a, _b;
        (_a = this.stopReactingToHistory) === null || _a === void 0 ? void 0 : _a.call(this);
        (_b = this.stopReactingToLocation) === null || _b === void 0 ? void 0 : _b.call(this);
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
    get routes() {
        const location = this.location;
        // TODO: Should it be configurable to allow multiple matches?
        let isAlreadyMatched = false;
        return this.definition.reduce((routes, _route) => {
            var _a;
            const route = _route;
            const { key, resource } = route;
            const matched = match(resource, {
                decode: decodeURI,
                encode: encodeURI,
            })(location.pathname);
            const { index, params: pathname } = matched || {};
            const mergeLocation = (p = {}) => {
                var _a, _b, _c;
                return ({
                    pathname: {
                        ...(_a = this.route) === null || _a === void 0 ? void 0 : _a.pathname,
                        ...p.pathname,
                    },
                    search: { ...p.search },
                    hash: (_b = p.hash) !== null && _b !== void 0 ? _b : (_c = this.route) === null || _c === void 0 ? void 0 : _c.hash,
                });
            };
            const isActive = isAlreadyMatched === false && index !== undefined;
            if (isActive)
                isAlreadyMatched = true;
            const search = qs.parse((_a = location.search) !== null && _a !== void 0 ? _a : '', {
                ignoreQueryPrefix: true,
            });
            // TODO: convert to a class LiveRoute {}
            const newRoute = {
                isActive,
                key,
                resource,
                search,
                pathname,
                hash: location.hash,
                get location() {
                    return { ...location };
                },
                push: (p) => this.push(route, mergeLocation(p)),
                pushExact: (p) => this.push(route, p),
                replace: (p) => this.replace(route, mergeLocation(p)),
                replaceExact: (p) => this.replace(route, p),
                toUri: (p) => this.toUri(route, mergeLocation(p)),
                toPathExact: (p) => this.toUri(route, p),
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
    toUri(route, params) {
        var _a, _b;
        const { resource, key } = route;
        try {
            const pathname = compile(resource)({ ...((_a = params === null || params === void 0 ? void 0 : params.pathname) !== null && _a !== void 0 ? _a : {}) }) || '/';
            const search = typeof (params === null || params === void 0 ? void 0 : params.search) === 'string'
                ? params.search
                : qs.stringify((_b = params === null || params === void 0 ? void 0 : params.search) !== null && _b !== void 0 ? _b : {}, {
                    addQueryPrefix: false,
                    encodeValuesOnly: true,
                    format: 'RFC3986',
                });
            const hash = (params === null || params === void 0 ? void 0 : params.hash) ? `#${params.hash}` : '';
            const uri = `${pathname}${search ? `?${search}` : ''}${hash}`;
            console.log({ nextUri: uri, search, params });
            return uri;
        }
        catch (error) {
            throw new Error(`INVALID_PARAMS\nROUTE: ${key}\nPATH: ${resource}\n ${error}`);
        }
    }
    push(route, params) {
        this.navigate(route, params, 'push');
    }
    replace(route, params) {
        this.navigate(route, params, 'replace');
    }
    /**
     * Be aware, toPath will throw if missing params.
     * When navigating from another route, ensure you provide all required params.
     */
    navigate(route, location = {}, method = 'push') {
        if (typeof route === 'string') {
            return this.history[method](route);
        }
        const path = this.toUri(route, location);
        this.history[method](path);
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
    return asActiveRoutes(routes).find((r) => r === null || r === void 0 ? void 0 : r.isActive);
}
