# Changelog

## 10.0.0-0

Rewrite of core to optimize for performance and reduce observable overhead.

Any deprecated methods have been annotated with alternative usages.


## 6.1.0

- Add missing `qs` dependency
- Remove unecessary deps

### Internal

- Using `pnpm` instead of `yarn`
- Using `vite` instead of `snowpack`

## 6.0.1

- Allow for search params to inherit shallow props when changing within the same route.
  - > Note: Switching between different routes will still NOT preserve properties in `search`.
  - Old behaviour:
     ```ts
      router.routes.a.push({ search: { a: 1 } })
      // /a/?a=1
      router.routes.a.push({ search: { b: 2 } })
      // /a/?b=1
     ```
  - New behaviour:
     ```ts
      router.routes.a.push({ search: { a: 1 } })
      // /a/?a=1
      router.routes.a.push({ search: { b: 2 } })
      // /a/?a=1&b=1

      // Moving to a new route will NOT keep old variables - this would be too confusing to keep track of
      router.routes.b.push({ search: { z: 1 } })
      // /b/?z=1
     ```
  - Remember, you can use `.pushExact({ search: { } })` to ignore old properties.

## 5.4.0

- Ensure search & hash location params get reset while iteracting with `history` via workaround
  - https://github.com/ReactTraining/history/issues/811
- Can now switch between routes and have the `search` and `hash` reset properly

## 5.3.1

- Remove a console.log statement
  
## 5.3.0

- Correctly rename `toPathExact` to `toUriExact` as it should be for v5
  
## 5.2.0

- Fixes types for active route helper functions

## 5.1.0

- Added `search` querystring support

### Breaking
- `toPath` renamed to `toUri`
- Pathname parameters are now set differently:
  - ❌ Old: `router.routes.myRoute.push({ myVar: 2 })`
  - ✅ New: `router.routes.myRoute.push({ pathname: { myVar: 2 } })`
- Pathname params now accessable from `router.routes.myRoute.pathname?.myVar`

## 4.0.0

- Add `mjs` modules from `./dist/es/`
  
## 3.1.0

- Make `findActiveRoute` and other utilities allow for undefined items
  
## 3.0.0

- Added `toPath`, which generates a pathname.
  - `xrouter.routes.myRoute.toPath({ someParam: 'foo' }) // "/blahblah/foo"`
  - `xrouter.toPath(MyFancyRoute, { someParam: 'foo' }) // "/blahblah/foo"`

## 2.0.0

- Includes breaking changes from 1.6.0 

## 1.6.0

- Added `router.routes.myRoute.pushExact` and `router.routes.myRoute.replaceExact`
  - These methods will only use the provided parameters
- Changed `routes.myRoute.push` and `routes.myRoute.replace`
  - These methods will now spread the currently active params in for you so you can apply a partial update
- Published as minor by accent - see v2.0.0

## 1.5.0

...