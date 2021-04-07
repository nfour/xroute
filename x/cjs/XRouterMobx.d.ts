import { History } from 'history';
import { LiveRoute, RouteConfig, XRouter } from './XRouter';
export declare class XRouterMobx<LIST extends RouteConfig[], KEYS extends LIST[number]['key'], ROUTES extends {
    [ITEM in LIST[number] as ITEM['key']]: LiveRoute<ITEM>;
}, ROUTE_CONFIG extends RouteConfig> extends XRouter<LIST, KEYS, ROUTES, ROUTE_CONFIG> {
    definition: LIST;
    protected history: History;
    constructor(definition: LIST, history: History);
}
