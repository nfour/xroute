import { type XRouteConstructor } from './XRoute'
import type { z } from 'zod'

export * from 'zod'

export class XRouteSchema<
  CONSTRUCTOR extends XRouteConstructor<any, any, any, any>,
  SCHEMA extends RouteSchema = RouteSchema,
> {
  constructor(public config: CONSTRUCTOR, public schema: SCHEMA) {}

  readonly TYPE!: {
    pathname: z.infer<NonNullable<SCHEMA['pathname']>>
    search: z.infer<NonNullable<SCHEMA['search']>>
    hash?: z.infer<NonNullable<SCHEMA['hash']>>
  }
}

export interface RouteSchema<
  PATH extends z.AnyZodObject = z.ZodObject<{}>,
  SEARCH extends z.AnyZodObject = z.ZodObject<{}>,
  HASH extends undefined | z.ZodType = undefined,
> {
  pathname: PATH
  search: SEARCH
  hash: HASH extends undefined ? z.ZodType<undefined | string> : HASH
}
