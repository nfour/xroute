import { type IReactionDisposer, type IReactionOptions } from 'mobx';
export declare class Reactor<T> {
    expression: () => T;
    effect: (arg: T, prevArg?: T) => void;
    options: IReactionOptions<any, any>;
    constructor(expression: () => T, effect: (arg: T, prevArg?: T) => void, options?: IReactionOptions<any, any>);
    dispose?: IReactionDisposer;
    fire: () => this;
    react: () => this;
}
