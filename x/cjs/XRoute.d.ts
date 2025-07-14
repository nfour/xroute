import type { Merge, MergeDeep, Replace } from 'type-fest';
import { type LocationType } from './XRouter';
import { XRouteSchema, type RouteSchema } from './XRouteSchema';
import { z } from 'zod';
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
export declare const XRoute: <KEY extends string, RESOURCE extends string = "", LOCATION extends LocationType = LocationType>(key: KEY, resource?: RESOURCE, location?: LOCATION) => XRouteConstructor<KEY, RESOURCE, LOCATION, XRouteSchema<any, RouteSchema<z.ZodObject<{}, z.UnknownKeysParam, z.ZodTypeAny, {}, {}>, z.ZodObject<{}, z.UnknownKeysParam, z.ZodTypeAny, {}, {}>, undefined>>>;
export declare class XRouteConstructor<KEY extends string, RESOURCE extends string = '', LOCATION extends LocationType = LocationType, SCHEMA extends XRouteSchema<any, RouteSchema> = XRouteSchema<any, RouteSchema>> {
    key: KEY;
    resource: RESOURCE;
    location: LOCATION;
    structure: SCHEMA;
    constructor(key: KEY, resource?: RESOURCE, location?: LOCATION, structure?: SCHEMA);
    Resource<R extends string>(r: R): XRouteConstructor<KEY, Replace<`${RESOURCE}${R}`, "//", "/">, LOCATION, SCHEMA>;
    Type<T extends LocationType>(l?: T): XRouteConstructor<KEY, RESOURCE, {
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
    }), SCHEMA>;
    Extend<NEW_KEY extends string>(key: NEW_KEY): XRouteConstructor<NEW_KEY, RESOURCE, LOCATION, SCHEMA>;
    Schema: <Z extends RouteSchema>(build: (s: SCHEMA) => Z) => XRouteConstructor<KEY, RESOURCE, {
        pathname: z.TypeOf<NonNullable<Z["pathname"]>>;
        search: z.TypeOf<NonNullable<Z["search"]>>;
        hash?: z.TypeOf<NonNullable<Z["hash"]>> | undefined;
    }, XRouteSchema<this, Z>>;
}
export type RouteConfig = {
    key: string;
    resource: string;
    location: LocationType;
};
