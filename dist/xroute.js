"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActiveRoute = exports.asActiveRoute = exports.asActiveRoutes = exports.XRouter = exports.XRoute = void 0;
const history_1 = require("history");
const isEqual_1 = __importDefault(require("lodash/isEqual"));
const mobx_1 = require("mobx");
const path_to_regexp_1 = require("path-to-regexp");
/** Create a typed route config object */
const XRoute = (key, resource, params) => ({ key, resource, params });
exports.XRoute = XRoute;
/**
 * The Mobx class which handles routing over History.
 */
class XRouter {
    constructor(definition, history = history_1.createHashHistory()) {
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
        Object.defineProperty(this, "dispose", {
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
        this.definition = definition;
        this.history = history;
        const setLocation = (location) => {
            if (isEqual_1.default(this.location, location))
                return;
            this.location = { ...location };
        };
        const setHistory = (location) => {
            if (isEqual_1.default(this.history.location, location))
                return;
            this.history.replace({ ...location });
        };
        const stopSettingHistory = mobx_1.reaction(() => this.location, (location) => {
            setHistory(location);
        });
        const stopSettingLocation = history.listen(({ location }) => setLocation(location));
        this.dispose = () => {
            stopSettingLocation();
            stopSettingHistory();
        };
        setLocation(history.location);
        mobx_1.makeAutoObservable(this);
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
        var _a;
        const { pathname = '/', hash, search } = (_a = this.location) !== null && _a !== void 0 ? _a : {};
        return this.definition.reduce((routes, _route) => {
            const route = _route;
            const { key, resource } = route;
            const matched = path_to_regexp_1.match(resource, {
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
            return path_to_regexp_1.compile(resource)({ ...params }) || '/';
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
    return asActiveRoutes(routes).find(({ isActive }) => isActive);
}
exports.findActiveRoute = findActiveRoute;
