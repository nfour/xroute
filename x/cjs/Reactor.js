"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reactor = void 0;
const es_toolkit_1 = require("es-toolkit");
const mobx_1 = require("mobx");
class Reactor {
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
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "dispose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fire", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.effect(this.expression());
                return this;
            }
        });
        Object.defineProperty(this, "react", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.dispose = (0, mobx_1.reaction)(this.expression, this.effect, {
                    equals: es_toolkit_1.isEqual,
                    ...this.options,
                });
                return this;
            }
        });
    }
}
exports.Reactor = Reactor;
