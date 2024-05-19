import { Action } from 'history';
/** Wrapper around History to abstract the API surface & types */
export class HistoryObserver {
    constructor(history, onChange) {
        Object.defineProperty(this, "history", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: history
        });
        Object.defineProperty(this, "onChange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onChange
        });
    }
    listen() {
        const history = this.history();
        this.dispose?.();
        this.onChange({ location: history.location, action: Action.Pop });
        this.dispose = history.listen(this.onChange);
        return this;
    }
}
export var HistoryAction;
(function (HistoryAction) {
    HistoryAction["Pop"] = "POP";
    HistoryAction["Push"] = "PUSH";
    HistoryAction["Replace"] = "REPLACE";
})(HistoryAction || (HistoryAction = {}));
