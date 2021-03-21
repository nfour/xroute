import isEqual from 'lodash-es/isEqual';
import { compile, match } from 'path-to-regexp';
/** Create a typed route config object */
export const XRoute = (key, resource, params) => ({ key, resource, params });
/**
 * XRouter routing via the History interface.
 */
export class XRouter {
    constructor(definition, history, reaction) {
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
        Object.defineProperty(this, "location", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
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
        this.setLocation(this.history.location);
        this.stopReactingToHistory = this.history.listen(({ location }) => this.setLocation(location));
        this.stopReactingToLocation = reaction(() => this.location, (location) => {
            if (isEqual(this.history.location, location))
                return;
            this.history.replace({ ...location });
        });
    }
    setLocation(location) {
        if (isEqual(this.location, location))
            return;
        this.location = { ...location };
    }
    dispose() {
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
        const { pathname = '/', hash, search } = this.location;
        return this.definition.reduce((routes, _route) => {
            const route = _route;
            const { key, resource } = route;
            const matched = match(resource, {
                decode: decodeURI,
                encode: encodeURI,
            })(pathname);
            const { index, path, params } = matched || {};
            const mergeParams = (p = {}) => {
                var _a, _b;
                return ({
                    ...((_b = (_a = this.route) === null || _a === void 0 ? void 0 : _a.params) !== null && _b !== void 0 ? _b : {}),
                    ...p,
                });
            };
            const newRoute = {
                isActive: index !== undefined,
                key,
                index,
                params,
                resource,
                path,
                hash,
                search,
                push: (p) => this.push(route, mergeParams(p)),
                pushExact: (p) => this.push(route, p),
                replace: (p) => this.replace(route, mergeParams(p)),
                replaceExact: (p) => this.replace(route, p),
                toPath: (p) => this.toPath(route, mergeParams(p)),
                toPathExact: (p) => this.toPath(route, p),
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
                return asActiveRoute(route);
        }
    }
    toPath(route, params) {
        const { resource, key } = route;
        try {
            return compile(resource)({ ...params }) || '/';
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
    navigate(route, params = {}, method = 'push') {
        if (typeof route === 'string') {
            return this.history[method](route);
        }
        const path = this.toPath(route, params);
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
