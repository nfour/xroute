# XRoute

A type-safe, MobX-powered router for React applications with declarative route definitions and observable navigation state.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Documentation](#documentation)
- [Examples](#examples)
- [What's New](#whats-new)
- [Requirements](#requirements)
- [Contributing](#contributing)

## Overview

XRoute provides a modern, type-safe routing solution that integrates seamlessly with MobX and React. It offers:

- **Type Safety**: Full TypeScript support for pathname, search, and hash parameters
- **MobX Integration**: Observable router state with automatic re-rendering
- **Declarative Routes**: Clean, composable route definitions
- **Route Inheritance**: Nested routes with parameter inheritance
- **History Integration**: Built on the standard `history` library
- **Performance Optimized**: Efficient observable updates and render optimization

## Installation

```bash
npm install xroute history mobx zod
# or
yarn add xroute history mobx zod
# or
pnpm add xroute history mobx zod
```

### Peer Dependencies

- `history` ^5.0.0
- `mobx` ^6.0.0
- `zod` ^3.0.0

## Quick Start

### 1. Define Your Routes

```typescript
import { XRoute } from 'xroute'

// Simple route with no parameters
const HomeRoute = XRoute('home')
  .Resource('/')
  .Type<{
    pathname: {}
    search: {}
  }>()

// Route with parameters
const UserRoute = XRoute('user')
  .Resource('/user/:userId')
  .Type<{
    pathname: { userId: string }
    search: { tab?: 'profile' | 'settings' }
  }>()
```

### 2. Create a Router

```typescript
import { createBrowserHistory } from 'history'
import { XRouter } from 'xroute'

const router = new XRouter(
  [UserRoute, HomeRoute], // Order matters - first match wins
  createBrowserHistory()
)
```

### 3. Navigate Programmatically

```typescript
// Navigate to home
router.routes.home.push({})

// Navigate to user profile
router.routes.user.push({
  pathname: { userId: '123' },
  search: { tab: 'profile' }
})

// Get current route information
console.log(router.route?.key) // 'user'
console.log(router.routes.user.pathname?.userId) // '123'
```

### 4. React Integration

```tsx
import { observer } from 'mobx-react-lite'

const App = observer(() => {
  return (
    <div>
      {router.route?.key === 'home' && <HomePage />}
      {router.route?.key === 'user' && <UserPage />}
    </div>
  )
})
```

## Core Concepts

### Route Definition
Routes are defined using the fluent API with `.Resource()` for URL patterns and `.Type<>()` for TypeScript types.

### Route Inheritance
Use `.Extend()` to create nested routes that inherit parent parameters and paths.

### Observable State
Router state is fully observable - components automatically re-render when routes change.

### Type Safety
All route parameters are type-checked at compile time, preventing runtime errors.

## Documentation

- **[Quick Start Guide](./docs/QuickStart.md)** - Step-by-step tutorial
- **[API Reference](./docs/API.md)** - Complete API documentation
- **[Examples](./docs/Examples.md)** - Common patterns and use cases
- **[Troubleshooting](./docs/Troubleshooting.md)** - Common issues and solutions
- **[Migration Guide](./docs/Migration.md)** - Upgrading between versions

### Convention Guides
- **[TypeScript Conventions](./docs/conventions/TypeScript.md)** - Type safety patterns
- **[React Conventions](./docs/conventions/React.md)** - Component integration patterns
- **[MobX Conventions](./docs/conventions/MobX.md)** - Observable state patterns

## Examples

### Basic Route Definition
See [docs/routeDefinition.ts](./docs/routeDefinition.ts) for comprehensive route examples.

### Complete React Application
See [docs/fullExample.tsx](./docs/fullExample.tsx) for a full React/MobX integration example.

### Interactive Examples
Explore the [Storybook examples](./stories/mobx.stories.tsx) for interactive demonstrations.

## What's New

### Version 15.0.0
- **Performance**: Added `useOptimizedObservability` for better render performance
- **Schema Support**: Zod schema integration for route validation
- **Type Safety**: Enhanced TypeScript support and error messages

See the [CHANGELOG.md](./CHANGELOG.md) for complete version history.

## Requirements

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.5.0 (recommended >= 5.0.0)
- **React**: >= 16.8.0 (for hooks support)
- **MobX**: >= 6.0.0

### Browser Support
- Modern browsers with ES2020 support
- IE11+ with polyfills

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Issues**: Report bugs or request features via GitHub Issues
2. **Pull Requests**: Follow our PR template and ensure tests pass
3. **Documentation**: Help improve these docs by submitting PRs
4. **Examples**: Share your XRoute patterns and use cases

### Development Setup

```bash
# Clone the repository
git clone https://github.com/nfour/xroute.git
cd xroute

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build the library
pnpm build
```

### Project Structure
- `src/` - Source code
- `docs/` - Documentation and examples
- `stories/` - Storybook examples
- `x/` - Built output (CJS and ESM)

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Need Help?**
- 📖 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/nfour/xroute/issues)
- 💬 [Discussions](https://github.com/nfour/xroute/discussions)
- 📚 [Examples](./docs/Examples.md)