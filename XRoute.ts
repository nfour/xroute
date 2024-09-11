import type { Merge, MergeDeep, Replace } from 'type-fest'
import { type LocationType } from './XRouter'
import { XRouteSchema, type RouteSchema } from './XRouteSchema'
import { z } from 'zod'

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
export const XRoute = <
  KEY extends string,
  RESOURCE extends string = '',
  LOCATION extends LocationType = LocationType,
>(
  key: KEY,
  resource = '' as RESOURCE,
  location = {} as LOCATION,
) => new XRouteConstructor(key, resource, location)

export class XRouteConstructor<
  KEY extends string,
  RESOURCE extends string = '',
  LOCATION extends LocationType = LocationType,
  SCHEMA extends XRouteSchema<any, RouteSchema> = XRouteSchema<
    any,
    RouteSchema
  >,
> {
  constructor(
    public key: KEY,
    public resource = '' as RESOURCE,
    public location = {} as LOCATION,
    public structure = {} as SCHEMA,
  ) {
    this.structure = new XRouteSchema(this, {
      pathname: z.object({}),
      search: z.object({}),
      hash: z.string().optional(),
    } as RouteSchema) as SCHEMA
  }

  Resource<R extends string>(r: R) {
    return new XRouteConstructor(
      this.key,
      `${this.resource}${r}`.replace('//', '/'),
      this.location,
      this.structure,
    ) as XRouteConstructor<
      KEY,
      Replace<`${RESOURCE}${R}`, '//', '/'>,
      LOCATION,
      SCHEMA
    >
  }

  Type<T extends LocationType>(
    l?: T,
  ): XRouteConstructor<
    KEY,
    RESOURCE,
    {
      pathname: Merge<LOCATION['pathname'], T['pathname']>
      search: MergeDeep<LOCATION['search'], T['search']>
    } & (T extends { hash: string }
      ? { hash: T['hash'] }
      : T extends { hash?: string }
      ? { hash?: T['hash'] }
      : { hash?: LOCATION['hash'] }),
    SCHEMA
  > {
    return new XRouteConstructor(
      this.key,
      this.resource,
      l as any,
      this.structure,
    )
  }

  Extend<NEW_KEY extends string>(
    key: NEW_KEY,
  ): XRouteConstructor<NEW_KEY, RESOURCE, LOCATION, SCHEMA> {
    return new XRouteConstructor(
      key,
      this.resource,
      this.location,
      this.structure,
    )
  }

  Schema = <Z extends RouteSchema>(build: (s: SCHEMA) => Z) => {
    const newStructure = new XRouteSchema(this, build(this.structure))

    return new XRouteConstructor(
      this.key,
      this.resource,
      this.location as (typeof newStructure)['TYPE'],
      newStructure,
    )
  }
}

export type RouteConfig = {
  key: string
  resource: string
  location: LocationType
}
