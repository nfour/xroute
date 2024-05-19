

## Initial improvements

Currently router.routes* is recomputed every time any part of the URI is updated.

## Example:

Recompute:
- router.routes
  - on any change
- router.routes.someRoute
  - on any change
- router.routes.someRoute.isActive
  - on any change
- router.routes.someRoute.pathname
  - on any change
- router.routes.someRoute.search
  - on any change
- router.routes.someRoute.uri
  - on any change
  
### Implementation

```ts

// Below is simplified AGI implementation of proposed refactor
class LiveXRoute {
  constructor(private ctx: { pathname: () => string, search: () => string, hash: () => string }) {}

  get isActive(): boolean {
    return this.ctx.pathname() === this.pathname;
  }

  get pathname(): string {
    return this.ctx.pathname();
  }

  get search(): string {
    return this.ctx.search();
  }

  get hash(): string {
    return this.ctx.hash();
  }
}

class XRouter {
  routes: LiveXRoute[] = [];


  locationPathname = ''
  locationSearch = ''
  locationHash = ''

  updateLocation = () => {
    history.on('update', () => {
      // Updates each individually, avoiding unecessary updates propagating down
      this.locationPathname = location.pathname;
      this.locationSearch = location.search;
      this.locationHash = location.hash
  })
}

// Pass ovservables to LiveXRoute
new LiveXRoute({ pathname: () => router.locationPathname, search: () => router.locationSearch, hash: () => router.locationHash });
```

### Expectations

Recompute:
- router.routes
  - never
- router.routes.someRoute
  - never
- router.routes.someRoute.isActive
  - on router.location.pathname 
- router.routes.someRoute.pathname
  - on router.location.pathname 
- router.routes.someRoute.search
  - on router.location.search 
- router.routes.someRoute.uri
  - on router.location.pathname 
  - on router.location.search 
  - on router.location.hash 
- 
