# XRoute API Reference

Complete API documentation for XRoute classes, methods, and types.

## Table of Contents

- [XRoute Class](#xroute-class)
- [XRouter Class](#xrouter-class)
- [Route Instance Methods](#route-instance-methods)
- [Type Definitions](#type-definitions)
- [Configuration Options](#configuration-options)
- [Utility Functions](#utility-functions)

## XRoute Class

The `XRoute` class is used to define individual routes with their URL patterns and type information.

### Constructor

```typescript
XRoute<TKey extends string>(key: TKey): XRouteBuilder<TKey>
```

Creates a new route builder with the specified key.

**Parameters:**
- `key`: Unique string identifier for the route

**Returns:** XRouteBuilder instance for method chaining

**Example:**
```typescript
const HomeRoute = XRoute('home')
```

### XRouteBuilder Methods

#### `.Resource(pattern: string)`

Defines the URL pattern for the route.

**Parameters:**
- `pattern`: URL pattern string (supports path-to-regexp syntax)

**Supported Pattern Features:**
- Static segments: `/users`
- Parameters: `/users/:userId`
- Optional parameters: `/users/:userId?`
- Wildcards: `/files/*`
- Regex constraints: `/users/:id(\\d+)`

**Example:**
```typescript
const UserRoute = XRoute('user')
  .Resource('/users/:userId')
```

#### `.Type<TRouteType>()`

Defines TypeScript types for route parameters.

**Type Parameters:**
- `TRouteType`: Object with `pathname`, `search`, and optional `hash` properties

**Example:**
```typescript
const UserRoute = XRoute('user')
  .Resource('/users/:userId')
  .Type<{
    pathname: { userId: string }
    search: { tab?: 'profile' | 'settings' }
    hash?: 'section1' | 'section2'
  }>()
```

#### `.Extend(key: string)`

Creates a child route that inherits from the current route.

**Parameters:**
- `key`: Unique identifier for the child route

**Returns:** New XRouteBuilder for the child route

**Example:**
```typescript
const AdminRoute = XRoute('admin').Resource('/admin')
const AdminUsersRoute = AdminRoute.Extend('adminUsers')
  .Resource('/users') // Results in /admin/users
```

#### `.Schema(schema: ZodSchema)`

Defines Zod schema for runtime validation (optional).

**Parameters:**
- `schema`: Zod schema object with `pathname`, `search`, and `hash` properties

**Example:**
```typescript
import { z } from 'zod'

const UserRoute = XRoute('user')
  .Resource('/users/:userId')
  .Schema({
    pathname: z.object({ userId: z.string() }),
    search: z.object({ tab: z.enum(['profile', 'settings']).optional() })
  })
```

## XRouter Class

The `XRouter` class manages route matching, navigation, and observable state.

### Constructor

```typescript
new XRouter<TRoutes>(
  routes: TRoutes,
  history: History,
  options?: XRouterOptions
)
```

**Parameters:**
- `routes`: Array of route definitions
- `history`: History instance from the `history` library
- `options`: Optional configuration object

**Example:**
```typescript
import { createBrowserHistory } from 'history'

const router = new XRouter(
  [UserRoute, HomeRoute],
  createBrowserHistory(),
  { useOptimizedObservability: true }
)
```

### Properties

#### `router.route`

```typescript
readonly route: ActiveRoute | null
```

The currently active route, or `null` if no route matches.

**Properties of ActiveRoute:**
- `key`: Route identifier
- `pathname`: Parsed pathname parameters
- `search`: Parsed search parameters
- `hash`: Current hash value

#### `router.routes`

```typescript
readonly routes: RouteInstances<TRoutes>
```

Object containing route instances keyed by route names.

**Example:**
```typescript
router.routes.user.push({ pathname: { userId: '123' } })
```

#### `router.location`

```typescript
readonly location: Location
```

Current browser location object from the History API.

#### `router.history`

```typescript
readonly history: History
```

The underlying History instance.

### Methods

#### `router.push(route, params)`

Navigate to a specific route.

**Parameters:**
- `route`: Route definition
- `params`: Route parameters object

**Example:**
```typescript
router.push(UserRoute, {
  pathname: { userId: '123' },
  search: { tab: 'profile' }
})
```

#### `router.replace(route, params)`

Replace current route without adding history entry.

**Parameters:**
- `route`: Route definition
- `params`: Route parameters object

#### `router.back()`

Navigate back in history.

#### `router.forward()`

Navigate forward in history.

#### `router.go(delta: number)`

Navigate to a specific point in history.

**Parameters:**
- `delta`: Number of steps to move (negative for back, positive for forward)

## Route Instance Methods

Each route in `router.routes` has the following methods:

### Navigation Methods

#### `route.push(params)`

Navigate to this route, merging with current parameters.

```typescript
router.routes.user.push({
  pathname: { userId: '456' },
  search: { tab: 'settings' }
})
```

#### `route.replace(params)`

Replace current route with this route.

#### `route.pushExact(params | callback)`

Navigate using exact parameters (no merging).

```typescript
// With object
router.routes.user.pushExact({
  pathname: { userId: '789' },
  search: { tab: 'profile' }
})

// With callback
router.routes.user.pushExact((current) => ({
  ...current,
  search: { tab: 'settings' }
}))
```

### State Properties

#### `route.isActive`

```typescript
readonly isActive: boolean
```

Whether this route is currently active.

#### `route.pathname`

```typescript
readonly pathname: PathnameType | null
```

Current pathname parameters for this route (null if not active).

#### `route.search`

```typescript
readonly search: SearchType | null
```

Current search parameters for this route (null if not active).

#### `route.hash`

```typescript
readonly hash: HashType | null
```

Current hash value for this route (null if not active).

### Utility Methods

#### `route.toUri(params)`

Generate URL string for this route.

```typescript
const url = router.routes.user.toUri({
  pathname: { userId: '123' },
  search: { tab: 'profile' }
})
// Returns: "/users/123?tab=profile"
```

#### `route.toUriExact(params)`

Generate URL string using exact parameters.

## Type Definitions

### Core Types

```typescript
// Route parameter structure
interface RouteParams<T = any> {
  pathname?: T['pathname']
  search?: T['search']
  hash?: T['hash']
}

// Active route information
interface ActiveRoute {
  key: string
  pathname: Record<string, any>
  search: Record<string, any>
  hash?: string
}

// Router configuration
interface XRouterOptions {
  useOptimizedObservability?: boolean
}
```

### History Types

XRoute uses the standard `history` library types:

```typescript
import { History, Location } from 'history'
```

## Configuration Options

### XRouterOptions

#### `useOptimizedObservability`

```typescript
useOptimizedObservability?: boolean = true
```

Enables optimized observable updates for better performance. When `true`, only changed properties trigger re-renders.

**Example:**
```typescript
const router = new XRouter(
  routes,
  history,
  { useOptimizedObservability: false } // Disable optimization
)
```

## Utility Functions

### Route Matching

XRoute internally uses `path-to-regexp` for route matching. You can access these utilities:

```typescript
import { pathToRegexp, compile } from 'path-to-regexp'

// Generate regex for route matching
const regex = pathToRegexp('/users/:userId')

// Generate URL from parameters
const toPath = compile('/users/:userId')
const url = toPath({ userId: '123' }) // "/users/123"
```

### Query String Handling

XRoute uses the `qs` library for search parameter serialization:

```typescript
import qs from 'qs'

// Parse search string
const params = qs.parse('?tab=profile&items[]=1&items[]=2')

// Stringify parameters
const search = qs.stringify({ tab: 'profile', items: [1, 2] })
```

## Error Handling

### Common Errors

#### Route Not Found
When no route matches the current URL, `router.route` will be `null`.

#### Type Errors
TypeScript will catch parameter type mismatches at compile time:

```typescript
// ❌ Type error - userId should be string
router.routes.user.push({
  pathname: { userId: 123 }
})

// ✅ Correct
router.routes.user.push({
  pathname: { userId: '123' }
})
```

#### Schema Validation
When using Zod schemas, validation errors are thrown at runtime:

```typescript
try {
  router.routes.user.push({
    pathname: { userId: 'invalid' }
  })
} catch (error) {
  console.error('Validation failed:', error)
}
```

## Performance Considerations

### Observable Optimization

- Use `useOptimizedObservability: true` (default) for better performance
- Wrap components with `observer` only when they read router state
- Avoid reading router state in render-heavy components

### Route Order

- Place more specific routes before general ones
- Use catch-all routes sparingly
- Consider route complexity when ordering

### Memory Management

- Router instances are automatically cleaned up
- History listeners are managed internally
- No manual cleanup required in most cases
