# Changelog

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