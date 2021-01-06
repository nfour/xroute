# Changelog


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