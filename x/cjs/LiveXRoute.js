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
        (0, mobx_1.makeObservable)(this, {
            isActive: true,
            isMatching: true,
            pathname: true,
            search: true,
            hash: true,
            push: true,
            pushExact: true,
            replace: true,
            replaceExact: true,
            toUriExact: true,
            toUri: true,
            key: false,
            resource: false,
            uri: false,
            location: false,
            toJSON: false,
        }, { proxy: false });
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
     * and is also the route which is ordered first
     * (takes precendent) on construction of the router.
     */
    get isActive() {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").route?.key === this.key;
    }
    /** pathname variables @example resource `/:foo/:bar` to uri `/1/2` resolves `{ foo: '1', bar: '2' }` */
    get pathname() {
        return this.pathnameMatch?.params ?? {};
    }
    /** search variables @example uri `/?foo=1&bar=2` resolves to `{ foo: '1', bar: '2' }` */
    get search() {
        return (qs.parse(__classPrivateFieldGet(this, _LiveXRoute_router, "f").search ?? '', {
            ignoreQueryPrefix: true,
            ...__classPrivateFieldGet(this, _LiveXRoute_router, "f").config.qs?.parse,
        }) ?? {});
    }
    /** The hash string
     * @example `#foooo` resolves `foooo`
     */
    get hash() {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").hash.split('#')[1];
    }
    push(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").push(this, this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)));
    }
    pushExact(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").push(this, this.handlePolymorphicInput(input));
    }
    replace(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").replace(this, this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)));
    }
    replaceExact(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").replace(this, this.handlePolymorphicInput(input));
    }
    toUri(input) {
        return __classPrivateFieldGet(this, _LiveXRoute_router, "f").toUri(this, this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)));
    }
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
