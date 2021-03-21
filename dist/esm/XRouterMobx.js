import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { XRouter } from './XRouter';
export class XRouterMobx extends XRouter {
    constructor(definition, history) {
        super(definition, history, reaction);
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
        makeObservable(this, {
            location: observable,
            route: computed,
            routes: computed,
            definition: observable,
            setLocation: action.bound,
            back: action.bound,
            block: action.bound,
            forward: action.bound,
            go: action.bound,
            push: action.bound,
            replace: action.bound,
            toPath: action.bound,
        });
    }
}
