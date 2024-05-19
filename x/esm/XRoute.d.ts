import type { MergeDeep } from 'type-fest';
import { LocationType } from './XRouter';
/**
 * Route definition.
 *
 * @example
 *
 * const AppRoute = XRoute('app')
 *   .Resource('/app/:section?')
 *   .Type<{
 *     pathname: { section?: 'a'|'b' };
 *     search: { language?: 'en'|'da' };
 *     hash?: 'foo'|'bar'
 *   }>()
 */
export declare const XRoute: <KEY extends string, RESOURCE extends string = "", LOCATION extends LocationType = LocationType>(key: KEY, resource?: RESOURCE, location?: LOCATION) => XRouteConstructor<KEY, RESOURCE, LOCATION>;
export declare class XRouteConstructor<KEY extends string, RESOURCE extends string = '', LOCATION extends LocationType = LocationType> {
    key: KEY;
    resource: RESOURCE;
    location: LOCATION;
    constructor(key: KEY, resource?: RESOURCE, location?: LOCATION);
    Resource<R extends string>(r: R): XRouteConstructor<KEY, `${RESOURCE}${R}`, LOCATION>;
    Type<T extends LocationType>(l?: T): XRouteConstructor<KEY, RESOURCE, {
        pathname: MergeDeep<LOCATION['pathname'], T['pathname']>;
        search: MergeDeep<LOCATION['search'], T['search']>;
        hash: T['hash'] extends undefined | string ? T['hash'] : LOCATION['hash'];
    }>;
    Extend<NEW_KEY extends string>(key: NEW_KEY): XRouteConstructor<NEW_KEY, RESOURCE, LOCATION>;
}
export type RouteConfig = ReturnType<typeof XRoute>;
