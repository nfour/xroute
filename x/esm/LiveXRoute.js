import { makeAutoObservable, reaction, } from 'mobx';
import { match } from 'path-to-regexp';
import * as qs from 'qs';
import { isEqual, set, unset } from 'lodash';
import microdiff from 'microdiff';
class Reaction {
    constructor(expression, effect, options = {}) {
        Object.defineProperty(this, "expression", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: expression
        });
        Object.defineProperty(this, "effect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: effect
        });
        Object.defineProperty(this, "dispose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "trigger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this.effect(this.expression())
        });
        this.dispose = reaction(expression, effect, {
            equals: isEqual,
            ...options,
        });
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
        Object.defineProperty(this, "router", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: router
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
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
            value: void 0
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
            value: void 0
        });
        Object.defineProperty(this, "searchReactor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Reaction(() => qs.parse(this.router.search, {
                ignoreQueryPrefix: true,
                ...this.router.options.qs?.parse,
            }), (search) => {
                if (this.options.useOptimizedObservability) {
                    diffMerge(this.search, search);
                    return;
                }
                this.search = search;
            })
        });
        Object.defineProperty(this, "pathnameReactor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Reaction(() => this.pathnameMatch?.params ?? {}, (pathname) => {
                if (!this.options.useOptimizedObservability) {
                    this.pathname = pathname;
                    return;
                }
                diffMerge(this.pathname, pathname);
            })
        });
        /** Cleanup reactions */
        Object.defineProperty(this, "dispose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.searchReactor.dispose?.();
                this.pathnameReactor.dispose?.();
            }
        });
        this.options = {
            useOptimizedObservability: true,
            ...options,
        };
        this.search = this.searchReactor.expression();
        this.pathname = this.pathnameReactor.expression();
        makeAutoObservable(this, {
            toJSON: false,
            options: false,
        });
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
        return this.router.hash.split('#')[1];
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
        })(this.router.pathname) || undefined);
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
        return this.router.route?.key === this.key;
    }
    /**
     * Pushes a URI update to the history stack.
     * Input can be a subset of the route's location as it
     * mMerges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    push(input) {
        return this.router.push(this, this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)));
    }
    /**
     * Pushes a URI update to the history stack.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    pushExact(input) {
        return this.router.push(this, this.handlePolymorphicInput(input));
    }
    /**
     * Replaces the current URI in the history stack.
     * Input can be a subset of the route's location as it
     * Merges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    replace(input) {
        return this.router.replace(this, this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)));
    }
    /**
     * Replaces the current URI in the history stack.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    replaceExact(input) {
        return this.router.replace(this, this.handlePolymorphicInput(input));
    }
    /**
     * Converts the route to a URI string.
     * Input can be a subset of the route's location as it
     * Merges the current route with the input.
     *
     * Note: Due to the merge, calling this triggers observation the currently active route's pathname, search, hash
     */
    toUri(input) {
        return this.router.toUri(this, this.mergeLocationWithActiveRoute(this.handlePolymorphicInput(input)));
    }
    /**
     * Converts the route to a URI string.
     * Input must be an exact location defined when the route was created.
     *
     * Note: This does not implicitly trigger observation of the currently active route's pathname, search, hash
     */
    toUriExact(input) {
        return this.router.toUri(this, this.handlePolymorphicInput(input));
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
        return this.router.route;
    }
    handlePolymorphicInput(input) {
        if (typeof input === 'function')
            return input(this);
        return input;
    }
}
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
