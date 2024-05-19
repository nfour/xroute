import { Action } from 'history'

/** Wrapper around History to abstract the API surface & types */
export class HistoryObserver {
  constructor(
    private history: () => HistorySubset,
    private onChange: (update: HistoryUpdate) => void,
  ) {}

  public dispose?(): void

  public listen() {
    const history = this.history()

    this.dispose?.()
    this.onChange({ location: history.location, action: Action.Pop })

    this.dispose = history.listen(this.onChange)

    return this
  }
}

export interface HistorySubset {
  readonly location: LocationPrimitive

  push(to: To, state?: any): void
  replace(to: To, state?: any): void
  go(delta: number): void
  back(): void
  forward(): void
  listen(listener: (update: HistoryUpdate) => void): () => void
  block(blocker: (tx: { retry(): void } & HistoryUpdate) => void): void
}

type To = string | LocationPrimitive

export interface HistoryUpdate {
  action: Action
  location: LocationPrimitive
}
export enum HistoryAction {
  Pop = 'POP',
  Push = 'PUSH',
  Replace = 'REPLACE',
}

export interface LocationPrimitive {
  hash?: undefined | string
  pathname?: undefined | string
  search?: undefined | string
}
