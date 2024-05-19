/**
 * Route definition.
 *
 * @example
 *
 * const AppRoute = XRoute('app')
 *   .Resource('/app/:section?')
 *   .Type<{
 *     pathname: { section?: 'a'|'b' };
 *     search: { language?: 'en'|'da' };
 *     hash?: 'foo'|'bar'
 *   }>()
 */
export const XRoute = (key, resource = '', location = {}) => new XRouteConstructor(key, resource, location);
export class XRouteConstructor {
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
        return new XRouteConstructor(this.key, `${this.resource}${r}`, this.location);
    }
    Type(l) {
        return new XRouteConstructor(this.key, this.resource, l);
    }
    Extend(key) {
        return new XRouteConstructor(key, this.resource, this.location);
    }
}
