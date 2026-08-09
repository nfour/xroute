# XRoute Quick Start Guide

Get up and running with XRoute in 5 minutes. This guide walks you through creating a type-safe router for your React application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Step 1: Define Routes](#step-1-define-routes)
- [Step 2: Create Router](#step-2-create-router)
- [Step 3: React Integration](#step-3-react-integration)
- [Step 4: Navigation](#step-4-navigation)
- [Step 5: Reading Route State](#step-5-reading-route-state)
- [Next Steps](#next-steps)

## Prerequisites

Before starting, ensure you have:
- Node.js >= 16.0.0
- A React project with TypeScript
- Basic familiarity with MobX (optional but recommended)

## Installation

Install XRoute and its peer dependencies:

```bash
npm install xroute history mobx zod
```

If using React with MobX:
```bash
npm install mobx-react-lite
```

## Step 1: Define Routes

Create a file `routes.ts` to define your application routes:

```typescript
// routes.ts
import { XRoute } from 'xroute'

// Home page route - no parameters
export const HomeRoute = XRoute('home')
  .Resource('/')
  .Type<{
    pathname: {}
    search: {}
  }>()

// User profile route - with path and search parameters
export const UserRoute = XRoute('user')
  .Resource('/user/:userId')
  .Type<{
    pathname: { userId: string }
    search: { tab?: 'profile' | 'settings' | 'posts' }
  }>()

// About page route - simple static route
export const AboutRoute = XRoute('about')
  .Resource('/about')
  .Type<{
    pathname: {}
    search: {}
  }>()

// 404 fallback route - catches unmatched paths
export const NotFoundRoute = XRoute('notFound')
  .Resource('/:path(.*)?')
  .Type<{
    pathname: { path?: string }
    search: {}
  }>()
```

### Route Definition Explained

- **`XRoute('routeName')`**: Creates a route with a unique identifier
- **`.Resource('/path')`**: Defines the URL pattern (supports parameters like `:userId`)
- **`.Type<{ ... }>()`**: Defines TypeScript types for pathname, search, and hash parameters

## Step 2: Create Router

Create a router instance with your routes:

```typescript
// router.ts
import { createBrowserHistory } from 'history'
import { XRouter } from 'xroute'
import { HomeRoute, UserRoute, AboutRoute, NotFoundRoute } from './routes'

export const router = new XRouter(
  [
    UserRoute,    // More specific routes first
    AboutRoute,
    HomeRoute,
    NotFoundRoute // Fallback route last
  ],
  createBrowserHistory()
)

// Export router type for use in components
export type AppRouter = typeof router
```

### Router Configuration Notes

- **Route Order**: More specific routes should come before general ones
- **Fallback Route**: Place catch-all routes (like 404) at the end
- **History**: Use `createBrowserHistory()` for standard web apps, `createHashHistory()` for hash routing

## Step 3: React Integration

Integrate the router with your React application:

```tsx
// App.tsx
import React from 'react'
import { observer } from 'mobx-react-lite'
import { router } from './router'

// Individual page components
const HomePage = () => <div>Welcome to the Home Page!</div>

const UserPage = observer(() => {
  const userId = router.routes.user.pathname?.userId
  const tab = router.routes.user.search?.tab || 'profile'
  
  return (
    <div>
      <h1>User Profile: {userId}</h1>
      <p>Active Tab: {tab}</p>
    </div>
  )
})

const AboutPage = () => <div>About Us</div>

const NotFoundPage = observer(() => {
  const path = router.routes.notFound.pathname?.path
  return <div>Page not found: {path}</div>
})

// Main App component
export const App = observer(() => {
  return (
    <div>
      <nav>
        <button onClick={() => router.routes.home.push({})}>
          Home
        </button>
        <button onClick={() => router.routes.user.push({ 
          pathname: { userId: '123' },
          search: { tab: 'profile' }
        })}>
          User Profile
        </button>
        <button onClick={() => router.routes.about.push({})}>
          About
        </button>
      </nav>

      <main>
        {router.route?.key === 'home' && <HomePage />}
        {router.route?.key === 'user' && <UserPage />}
        {router.route?.key === 'about' && <AboutPage />}
        {router.route?.key === 'notFound' && <NotFoundPage />}
      </main>
    </div>
  )
})
```

### Integration Notes

- **`observer`**: Wrap components that read router state to enable automatic re-rendering
- **Route Matching**: Use `router.route?.key` to determine the active route
- **Type Safety**: All route parameters are fully typed

## Step 4: Navigation

Navigate between routes programmatically:

```typescript
// Navigate to home page
router.routes.home.push({})

// Navigate to user profile with parameters
router.routes.user.push({
  pathname: { userId: '456' },
  search: { tab: 'settings' }
})

// Navigate using the router directly
router.push(UserRoute, {
  pathname: { userId: '789' },
  search: { tab: 'posts' }
})

// Replace current route (no history entry)
router.routes.user.replace({
  pathname: { userId: '123' },
  search: { tab: 'profile' }
})

// Navigate with exact parameters (ignores current state)
router.routes.user.pushExact({
  pathname: { userId: '999' },
  search: { tab: 'profile' }
})
```

### Navigation Methods

- **`push()`**: Adds new history entry, merges with current parameters
- **`replace()`**: Replaces current history entry
- **`pushExact()`**: Ignores current parameters, uses only provided ones

## Step 5: Reading Route State

Access current route information:

```typescript
// Get active route key
const activeRoute = router.route?.key // 'home' | 'user' | 'about' | 'notFound'

// Get route-specific parameters (type-safe)
const userId = router.routes.user.pathname?.userId
const tab = router.routes.user.search?.tab

// Check if a route is active
const isUserRouteActive = router.routes.user.isActive

// Get current URL
const currentUrl = router.location.pathname + router.location.search

// Generate URLs for links
const userProfileUrl = router.routes.user.toUri({
  pathname: { userId: '123' },
  search: { tab: 'profile' }
}) // "/user/123?tab=profile"
```

## Next Steps

Congratulations! You now have a working XRoute setup. Here's what to explore next:

### Advanced Features
- **[Route Inheritance](./Examples.md#route-inheritance)** - Create nested routes
- **[Schema Validation](./Examples.md#schema-validation)** - Use Zod schemas for validation
- **[Hash Parameters](./Examples.md#hash-parameters)** - Handle hash-based navigation

### Best Practices
- **[TypeScript Conventions](./conventions/TypeScript.md)** - Type safety patterns
- **[React Conventions](./conventions/React.md)** - Component integration patterns
- **[MobX Conventions](./conventions/MobX.md)** - Observable state management

### Troubleshooting
- **[Common Issues](./Troubleshooting.md)** - Solutions to frequent problems
- **[Migration Guide](./Migration.md)** - Upgrading from older versions

### Complete Examples
- **[Route Definitions](./routeDefinition.ts)** - Comprehensive route examples
- **[Full Application](./fullExample.tsx)** - Complete React/MobX integration
