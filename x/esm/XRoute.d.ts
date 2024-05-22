import type { Merge, MergeDeep, Replace } from 'type-fest';
import { type LocationShape } from './XRouter';
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
export declare const XRoute: <KEY extends string, RESOURCE extends string = "", LOCATION extends LocationShape = LocationShape>(key: KEY, resource?: RESOURCE, location?: LOCATION) => XRouteConstructor<KEY, RESOURCE, LOCATION>;
export declare class XRouteConstructor<KEY extends string, RESOURCE extends string = '', LOCATION extends LocationShape = LocationShape> {
    key: KEY;
    resource: RESOURCE;
    location: LOCATION;
    constructor(key: KEY, resource?: RESOURCE, location?: LOCATION);
    Resource<R extends string>(r: R): XRouteConstructor<KEY, Replace<`${RESOURCE}${R}`, "//", "/">, LOCATION>;
    Type<T extends LocationShape>(l?: T): XRouteConstructor<KEY, RESOURCE, {
        pathname: Merge<LOCATION['pathname'], T['pathname']>;
        search: MergeDeep<LOCATION['search'], T['search']>;
    } & (T extends {
        hash: string;
    } ? {
        hash: T['hash'];
    } : T extends {
        hash?: string;
    } ? {
        hash?: T['hash'];
    } : {
        hash?: LOCATION['hash'];
    })>;
    Extend<NEW_KEY extends string>(key: NEW_KEY): XRouteConstructor<NEW_KEY, RESOURCE, LOCATION>;
}
export type RouteConfig = {
    key: string;
    resource: string;
    location: LocationShape;
};
