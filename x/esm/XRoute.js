import { XRouteSchema } from './XRouteSchema';
import { z } from 'zod';
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
    constructor(key, resource = '', location = {}, structure = {}) {
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
        Object.defineProperty(this, "structure", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: structure
        });
        Object.defineProperty(this, "Schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (build) => {
                const newStructure = new XRouteSchema(this, build(this.structure));
                return new XRouteConstructor(this.key, this.resource, this.location, newStructure);
            }
        });
        this.structure = new XRouteSchema(this, {
            pathname: z.object({}),
            search: z.object({}),
            hash: z.string().optional(),
        });
    }
    Resource(r) {
        return new XRouteConstructor(this.key, `${this.resource}${r}`.replace('//', '/'), this.location, this.structure);
    }
    Type(l) {
        return new XRouteConstructor(this.key, this.resource, l, this.structure);
    }
    Extend(key) {
        return new XRouteConstructor(key, this.resource, this.location, this.structure);
    }
}
