"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XRouterMobx = void 0;
const mobx_1 = require("mobx");
const XRouter_1 = require("./XRouter");
class XRouterMobx extends XRouter_1.XRouter {
    constructor(definition, history) {
        super(definition, history, mobx_1.reaction);
        Object.defineProperty(this, "definition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: definition
        });
        Object.defineProperty(this, "history", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: history
        });
        mobx_1.makeObservable(this, {
            location: mobx_1.observable,
            route: mobx_1.computed,
            routes: mobx_1.computed,
            definition: mobx_1.observable,
            setLocation: mobx_1.action.bound,
            back: mobx_1.action.bound,
            block: mobx_1.action.bound,
            forward: mobx_1.action.bound,
            go: mobx_1.action.bound,
            push: mobx_1.action.bound,
            replace: mobx_1.action.bound,
            toPath: mobx_1.action.bound,
        });
    }
}
exports.XRouterMobx = XRouterMobx;
