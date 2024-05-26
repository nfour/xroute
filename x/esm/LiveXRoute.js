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
var _LiveXRoute_router, _LiveXRoute_searchReactor, _LiveXRoute_pathnameReactor;
import { makeAutoObservable, reaction, } from 'mobx';
import { match } from 'path-to-regexp';
import * as qs from 'qs';
import { isEqual, set, unset } from 'lodash';
import microdiff from 'microdiff';
class Reactor {
    constructor(fn, effect, options = {}) {
        Object.defineProperty(this, "dispose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        this.dispose?.();
        this.dispose = reaction(fn, effect, {
            fireImmediately: true,
            equals: isEqual,
            ...options,
        });
        return this;
    }
}
/**
 * A "live" route, typically found at:
 * @example new XRouter(...).routes.myFooRoute
 */
export class LiveXRoute {
    constructor(config, router, options = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        _LiveXRoute_router.set(this, void 0);
        /** Deep partial config location */
        Object.defineProperty(this, "LOCATION_INPUT", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Config location */
        Object.defineProperty(this, "LOCATION", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _LiveXRoute_searchReactor.set(this, new Reactor(() => qs.parse(__classPrivateFieldGet(this, _LiveXRoute_router, "f").search, {
            ignoreQueryPrefix: true,
            ...__classPrivateFieldGet(this, _LiveXRoute_router, "f").options.qs?.parse,
        }), (search) => {
            if (!this.options.useOptimizedObservability) {
                this.search = search;
                return;
            }
            diffMerge(this.search, search);
        }));
        _LiveXRoute_pathnameReactor.set(this, new Reactor(() => this.pathnameMatch?.params ?? {}, (pathname) => {
            if (!this.options.useOptimizedObservability) {
                this.pathname = pathname;
                return;
            }
            diffMerge(this.pathname, pathname);
        })
        /** Cleanup reactions */
        );
        /** Cleanup reactions */
        Object.defineProperty(this, "dispose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                __classPrivateFieldGet(this, _LiveXRoute_searchReactor, "f").dispose?.();
                __classPrivateFieldGet(this, _LiveXRoute_pathnameReactor, "f").dispose?.();
            }
        });
        /**
         * Pathname variables, as defined in the `resource` URL pattern.
         *
         * @example
         *
         * Given uri `/user/:id`
         * Resolves { id: '123' }
         */
        Object.defineProperty(this, "pathname", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        /**
         * Search variables
         *
         * @example
         *
         * Given uri `/myApp/?foo=1&bar=2&baz[a]=2`
         * Resolves { foo: '1', bar: '2', baz: { a: '2' } }
         */
        Object.defineProperty(this, "search", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this.options = {
            useOptimizedObservability: true,
            ...options,
        };
        __classPrivateFieldSet(this, _LiveXRoute_router, router, "f");
        makeAutoObservable(this, {
            toJSON: false,
            options: false,
        });
    }
    get key() {
        return this.config.key;
    }
    get resource() {
        return this.config.resource;
    }
    /** Warning: Use this.pathname, this.search, this.hash for optimal observability performance */
    get location() {
        return {
            pathname: this.pathname,
            search: this.search,
            hash: this.hash,
        };
    }
    get pathnameMatch() {
        return (match(this.resource, {
            decode: decodeURI,
            encode: encodeURI,
        })(__classPrivateFieldGet(this, _LiveXRoute_router, "f").pathname) || undefined);
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
_LiveXRoute_router = new WeakMap(), _LiveXRoute_searchReactor = new WeakMap(), _LiveXRoute_pathnameReactor = new WeakMap();
/** Merges by using `microdiff` */
function diffMerge(prev, next) {
    const diff = microdiff(prev, next);
    for (const event of diff) {
        switch (event.type) {
            case 'CREATE':
            case 'CHANGE':
                set(prev, event.path, event.value);
                break;
            case 'REMOVE':
                unset(prev, event.path);
                break;
        }
    }
    return null;
}
