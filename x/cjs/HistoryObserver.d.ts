import { Action } from 'history';
/** Wrapper around History to abstract the API surface & types */
export declare class HistoryObserver {
    private history;
    private onChange;
    constructor(history: () => HistorySubset, onChange: (update: HistoryUpdate) => void);
    dispose?(): void;
    listen(): this;
}
export interface HistorySubset {
    readonly location: LocationPrimitive;
    push(to: To, state?: any): void;
    replace(to: To, state?: any): void;
    go(delta: number): void;
    back(): void;
    forward(): void;
    listen(listener: (update: HistoryUpdate) => void): () => void;
    block(blocker: (tx: {
        retry(): void;
    } & HistoryUpdate) => void): void;
}
type To = string | LocationPrimitive;
export interface HistoryUpdate {
    action: Action;
    location: LocationPrimitive;
}
export declare enum HistoryAction {
    Pop = "POP",
    Push = "PUSH",
    Replace = "REPLACE"
}
export interface LocationPrimitive {
    hash?: undefined | string;
    pathname?: undefined | string;
    search?: undefined | string;
}
export {};
