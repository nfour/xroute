"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XRouteSchema = void 0;
class XRouteSchema {
    constructor(config, schema) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: schema
        });
        Object.defineProperty(this, "TYPE", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
exports.XRouteSchema = XRouteSchema;
