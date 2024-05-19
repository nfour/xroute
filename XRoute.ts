import type { MergeDeep } from 'type-fest'
import { LocationType } from './XRouter'

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
> {
  constructor(
    public key: KEY,
    public resource = '' as RESOURCE,
    public location = {} as LOCATION,
  ) {}

  Resource<R extends string>(
    r: R,
  ): XRouteConstructor<KEY, `${RESOURCE}${R}`, LOCATION> {
    return new XRouteConstructor(
      this.key,
      `${this.resource}${r}`,
      this.location,
    )
  }

  Type<T extends LocationType>(
    l?: T,
  ): XRouteConstructor<
    KEY,
    RESOURCE,
    {
      pathname: MergeDeep<LOCATION['pathname'], T['pathname']>
      search: MergeDeep<LOCATION['search'], T['search']>
      hash: T['hash'] extends undefined | string ? T['hash'] : LOCATION['hash']
    }
  > {
    return new XRouteConstructor(this.key, this.resource, l as any)
  }

  Extend<NEW_KEY extends string>(
    key: NEW_KEY,
  ): XRouteConstructor<NEW_KEY, RESOURCE, LOCATION> {
    return new XRouteConstructor(key, this.resource, this.location)
  }
}

export type RouteConfig = ReturnType<typeof XRoute>
