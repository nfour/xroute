"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XRouter = exports.XRoute = void 0;
const history_1 = require("history");
const lodash_1 = require("lodash");
const mobx_1 = require("mobx");
const path_to_regexp_1 = require("path-to-regexp");
/** Create a typed route object of shape IXRoute */
const XRoute = (key, resource, params) => ({ key, resource, params });
exports.XRoute = XRoute;
/**
 * The Mobx class which holds routes.
 */
class XRouter {
    constructor(definition, history = history_1.createHashHistory()) {
        Object.defineProperty(this, "location", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "definition", {
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
        Object.defineProperty(this, "history", {
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
            if (lodash_1.isEqual(this.location, location))
                return;
            this.location = { ...location };
        };
        const setHistory = (location) => {
            if (lodash_1.isEqual(this.history.location, location))
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
        return this.definition.reduce((a, route) => {
            const { key, resource } = route;
            const matched = path_to_regexp_1.match(resource, {
                decode: decodeURI,
                encode: encodeURI,
            })(pathname);
            const { index, path, params } = matched || {};
            return {
                ...a,
                [key]: {
                    index,
                    params,
                    resource,
                    path,
                    key,
                    hash,
                    search,
                    isActive: index !== undefined,
                    push: (p) => this.push(route, p),
                    replace: (p) => this.replace(route, p),
                },
            };
        }, {});
    }
    /** The currently active route. */
    get route() {
        if (!this.routes)
            return;
        for (const route of Object.values(this.routes))
            if (route.isActive)
                return route;
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
        const { resource, key } = route;
        try {
            const path = path_to_regexp_1.compile(resource)({ ...params }) || '/';
            this.history[method](path);
        }
        catch (error) {
            throw new Error(`INVALID_PARAMS\nROUTE: ${key}\nPATH: ${resource}\n ${error}`);
        }
    }
}
exports.XRouter = XRouter;
