"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LiveXRoute_router;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveXRoute = void 0;
const mobx_1 = require("mobx");
const path_to_regexp_1 = require("path-to-regexp");
const qs = require("qs");
/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */
class LiveXRoute {
    constructor(config, router) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        _LiveXRoute_router.set(this, void 0);
        /** Deep partial config location */
        Object.defineProperty(this, "PL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Config location */
        Object.defineProperty(this, "L", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        __classPrivateFieldSet(this, _LiveXRoute_router, router, "f");
        (0, mobx_1.makeAutoObservable)(this, {
            toJSON: false,
        });
    }
    get key() {
        return this.config.key;
    }
    get resource() {
        return this.config.resource;
    }
    get pathnameMatch() {
        const pathname = __classPrivateFieldGet(this, _LiveXRoute_router, "f").pathname;
        if (pathname == null)
            return;
        return ((0, path_to_regexp_1.match)(this.resource, {
            decode: decodeURI,
            encode: encodeURI,
        })(pathname) || undefined);
    }
    /**
     * Whether this route's `resource` matches the current `pathname`.
     * More than one route can match at a time.
     */
    get isMatching() {
        return !!this.pathnameMatch;
    }
    /**
     * Whether this route is matched,
     * and is also the route which is matched **first** in order of definition in the router.
     */
    get isActive() {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").route?.key === this.key;
    }
    /**
     * Pathname variables, as defined in the `resource` URL pattern.
     *
     * @example
     *
     * Given uri `/user/:id`
     * Resolves { id: '123' }
     */
    get pathname() {
        return this.pathnameMatch?.params ?? {};
    }
    /**
     * Search variables
     *
     * @example
     *
     * Given uri `/myApp/?foo=1&bar=2&baz[a]=2`
     * Resolves { foo: '1', bar: '2', baz: { a: '2' } }
     */
    get search() {
        return (qs.parse(__classPrivateFieldGet(this, _LiveXRoute_router, "f").search ?? '', {
            ignoreQueryPrefix: true,
            ...__classPrivateFieldGet(this, _LiveXRoute_router, "f").config.qs?.parse,
        }) ?? {});
    }
    /**
     * The hash string
     *
     * @example
     *
     * Given uri `/some/url/?aaaa=1#foooo`
     * Resolves 'foooo'
     */
    get hash() {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").hash.split('#')[1];
    }
    /**
     * Pushes a URI update to the history stack.
     * Input can be a subset of the route's location as it
     * mMerges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    push(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").push(this, this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)));
    }
    /**
     * Pushes a URI update to the history stack.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    pushExact(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").push(this, this.handlePolymorphicInput(input));
    }
    /**
     * Replaces the current URI in the history stack.
     * Input can be a subset of the route's location as it
     * Merges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    replace(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").replace(this, this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)));
    }
    /**
     * Replaces the current URI in the history stack.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    replaceExact(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").replace(this, this.handlePolymorphicInput(input));
    }
    /**
     * Converts the route to a URI string.
     * Input can be a subset of the route's location as it
     * Merges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    toUri(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").toUri(this, this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)));
    }
    /**
     * Converts the route to a URI string.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    toUriExact(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").toUri(this, this.handlePolymorphicInput(input));
    }
    /** @deprecated use toUri() */
    get uri() {
        try {
            return this.toUri();
        }
        catch {
            return undefined;
        }
    }
    /** @deprecated Use router.pathname, router.search, router.hash */
    get location() {
        return {
            pathname: __classPrivateFieldGet(this, _LiveXRoute_router, "f").pathname,
            search: __classPrivateFieldGet(this, _LiveXRoute_router, "f").search,
            hash: __classPrivateFieldGet(this, _LiveXRoute_router, "f").hash,
        };
    }
    toJSON() {
        return {
            key: this.key,
            resource: this.resource,
            pathname: this.pathname,
            search: this.search,
            hash: this.hash,
            isActive: this.isActive,
            isMatching: this.isMatching,
        };
    }
    mergeLocationWithActiveRoute(location) {
        const activeRoute = this.activeRoute;
        return {
            pathname: {
                ...activeRoute?.pathname,
                ...location?.pathname,
            },
            search: {
                ...(activeRoute?.key === this.key ? activeRoute?.search : {}),
                ...location?.search,
            },
            hash: location?.hash ?? activeRoute?.hash ?? undefined,
        };
    }
    get activeRoute() {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").route;
    }
    handlePolymorphicInput(input) {
        if (typeof input === 'function')
            return input(this);
        return input;
    }
}
exports.LiveXRoute = LiveXRoute;
_LiveXRoute_router = new WeakMap();
