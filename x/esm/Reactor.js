import { isEqual } from 'lodash';
import { reaction } from 'mobx';
export class Reactor {
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
                this.dispose = reaction(this.expression, this.effect, {
                    equals: isEqual,
                    ...this.options,
                });
                return this;
            }
        });
    }
}
