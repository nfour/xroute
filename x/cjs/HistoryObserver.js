"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryAction = exports.HistoryObserver = void 0;
const history_1 = require("history");
/** Wrapper around History to abstract the API surface & types */
class HistoryObserver {
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
        this.onChange({ location: history.location, action: history_1.Action.Pop });
        this.dispose = history.listen(this.onChange);
        return this;
    }
}
exports.HistoryObserver = HistoryObserver;
var HistoryAction;
(function (HistoryAction) {
    HistoryAction["Pop"] = "POP";
    HistoryAction["Push"] = "PUSH";
    HistoryAction["Replace"] = "REPLACE";
})(HistoryAction || (exports.HistoryAction = HistoryAction = {}));
