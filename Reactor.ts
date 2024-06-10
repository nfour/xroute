import { isEqual } from 'lodash'
import { reaction, type IReactionDisposer, type IReactionOptions } from 'mobx'

export class Reactor<T> {
  constructor(
    public expression: () => T,
    public effect: (arg: T, prevArg?: T) => void,
    public options: IReactionOptions<any, any> = {},
  ) {}

  dispose?: IReactionDisposer

  fire = () => {
    this.effect(this.expression())

    return this
  }

  react = () => {
    this.dispose = reaction(this.expression, this.effect, {
      equals: isEqual,
      ...this.options,
    })

    return this
  }
}
