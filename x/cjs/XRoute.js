"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XRouteConstructor = exports.XRoute = void 0;
const XRouteSchema_1 = require("./XRouteSchema");
const zod_1 = require("zod");
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
const XRoute = (key, resource = '', location = {}) => new XRouteConstructor(key, resource, location);
exports.XRoute = XRoute;
class XRouteConstructor {
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
                const newStructure = new XRouteSchema_1.XRouteSchema(this, build(this.structure));
                return new XRouteConstructor(this.key, this.resource, this.location, newStructure);
            }
        });
        this.structure = new XRouteSchema_1.XRouteSchema(this, {
            pathname: zod_1.z.object({}),
            search: zod_1.z.object({}),
            hash: zod_1.z.string().optional(),
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
exports.XRouteConstructor = XRouteConstructor;
