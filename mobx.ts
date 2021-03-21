import { History } from 'history';
import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { LiveRoute, RouteConfig, XRouter } from './XRouter';

export {
  ActiveLiveRoute,
  LiveRoute,
  ReactionFn,
  RouteConfig,
  XRoute,
  asActiveRoute,
  asActiveRoutes,
  findActiveRoute,
} from './XRouter';

/** A Mobx configured XRouter */
export class XRouterMobx<
  LIST extends RouteConfig[],
  KEYS extends LIST[number]['key'],
  ROUTES extends {
    [ITEM in LIST[number] as ITEM['key']]: LiveRoute<ITEM>;
  },
  ROUTE_CONFIG extends RouteConfig
> extends XRouter<LIST, KEYS, ROUTES, ROUTE_CONFIG> {
  constructor(public definition: LIST, public history: History) {
    super(definition, history, reaction);

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
