# Changelog

All notable changes to XRoute will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [15.0.0] - 2024-XX-XX

### 🚀 Added
- **Performance Optimization**: `useOptimizedObservability` option for router (enabled by default)
  - Optimizes `search` and `pathname` updates to only trigger on actual property changes
  - Significantly improves render performance in complex applications
- **Schema Support**: `XRoute('routeName').Schema({ ... })` method for Zod schema integration
  - Accepts Zod schemas for `pathname`, `search`, and `hash` parameters
  - Currently provides type-only validation (runtime validation planned)
  - Manual validation available via `route.schema.schema.pathname.parse(route.pathname)`

### 📚 Documentation
- Complete documentation restructure with improved organization
- Added comprehensive API reference
- Added quick start guide with step-by-step instructions
- Added troubleshooting guide and migration documentation

## [12.0.0] - 2024-XX-XX

### 🔧 Improved
- Enhanced inline JSDoc comments for better IDE support
- Removed unused configuration options for cleaner API

### 🧹 Maintenance
- Code cleanup and optimization

## [11.0.0] - 2024-XX-XX

### 🔧 Improved
- Refined refactor from 10.0.0-0 with stability improvements
- Comprehensive testing and bug fixes

### ✅ Testing
- Enhanced test coverage for core functionality

## [10.0.0] - 2024-XX-XX

### ⚡ Performance
- **BREAKING**: Major rewrite of core architecture for performance optimization
- Reduced observable overhead for better memory usage
- Optimized route matching and parameter parsing

### 🔄 Migration
- Deprecated methods have been annotated with alternative usage patterns
- See [Migration Guide](./docs/Migration.md) for detailed upgrade instructions

## [6.1.0] - 2023-XX-XX

### 🔧 Fixed
- Added missing `qs` dependency to package.json
- Removed unnecessary dependencies for smaller bundle size

### 🛠️ Internal
- Migrated from `yarn` to `pnpm` for package management
- Migrated from `snowpack` to `vite` for build tooling

## [6.0.1] - 2023-XX-XX

### 🚀 Added
- **Search Parameter Inheritance**: Search params now inherit shallow properties when navigating within the same route

### 🔄 Behavior Changes
- **Previous Behavior**:
  ```typescript
  router.routes.a.push({ search: { a: 1 } })  // /a/?a=1
  router.routes.a.push({ search: { b: 2 } })  // /a/?b=2 (lost 'a')
  ```
- **New Behavior**:
  ```typescript
  router.routes.a.push({ search: { a: 1 } })  // /a/?a=1
  router.routes.a.push({ search: { b: 2 } })  // /a/?a=1&b=2 (preserved 'a')

  // Cross-route navigation still resets parameters
  router.routes.b.push({ search: { z: 1 } })  // /b/?z=1 (no inheritance)
  ```

### 💡 Usage Notes
- Use `.pushExact({ search: { } })` to ignore inherited properties when needed
- Parameter inheritance only applies within the same route

## [5.4.0] - 2023-XX-XX

### 🔧 Fixed
- **History Integration**: Fixed search & hash parameter reset issues
  - Implemented workaround for [History library issue #811](https://github.com/ReactTraining/history/issues/811)
  - Route switching now properly resets `search` and `hash` parameters

### ✅ Improved
- Enhanced route transition reliability

## [5.3.1] - 2023-XX-XX

### 🧹 Maintenance
- Removed debug console.log statement

## [5.3.0] - 2023-XX-XX

### 🔧 Fixed
- Correctly renamed `toPathExact` to `toUriExact` for consistency with v5 API

## [5.2.0] - 2023-XX-XX

### 🔧 Fixed
- Fixed TypeScript types for active route helper functions

## [5.1.0] - 2023-XX-XX

### 🚀 Added
- **Search Parameter Support**: Full querystring parameter support with type safety

### 💥 BREAKING CHANGES
- **Method Rename**: `toPath` → `toUri`
- **Parameter Structure**: Changed pathname parameter API
  ```typescript
  // ❌ Old API
  router.routes.myRoute.push({ myVar: 2 })

  // ✅ New API
  router.routes.myRoute.push({ pathname: { myVar: 2 } })
  ```
- **Parameter Access**: Updated parameter access pattern
  ```typescript
  // Access pathname parameters
  router.routes.myRoute.pathname?.myVar
  ```

## [4.0.0] - 2022-XX-XX

### 🚀 Added
- **ES Modules**: Added `mjs` modules in `./dist/es/` for better tree-shaking

## [3.1.0] - 2022-XX-XX

### 🔧 Improved
- Enhanced `findActiveRoute` and utility functions to handle undefined values gracefully

## [3.0.0] - 2022-XX-XX

### 🚀 Added
- **URL Generation**: New `toPath` method for generating pathnames
  ```typescript
  // Generate URL from route and parameters
  xrouter.routes.myRoute.toPath({ someParam: 'foo' })  // "/blahblah/foo"
  xrouter.toPath(MyFancyRoute, { someParam: 'foo' })   // "/blahblah/foo"
  ```

## [2.0.0] - 2022-XX-XX

### 💥 BREAKING CHANGES
- Includes all breaking changes from v1.6.0 (see below)

## [1.6.0] - 2022-XX-XX

### 🚀 Added
- **Exact Navigation Methods**:
  - `router.routes.myRoute.pushExact` - Uses only provided parameters
  - `router.routes.myRoute.replaceExact` - Uses only provided parameters

### 🔄 Changed
- **Parameter Merging**: `push` and `replace` methods now merge with current parameters
  - Enables partial parameter updates
  - Use `pushExact`/`replaceExact` for previous behavior

### ⚠️ Note
- Originally published as minor version, promoted to major in v2.0.0

## [1.5.0] - 2022-XX-XX

### 🚀 Legacy Features
- Initial feature set and API establishment

---

## Migration Guides

- **v15.x**: See [Migration Guide](./docs/Migration.md) for detailed upgrade instructions
- **v10.x+**: Major performance improvements with some API changes
- **v5.x+**: Search parameter support with breaking parameter API changes

## Support

- 📖 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/nfour/xroute/issues)
- 💬 [Discussions](https://github.com/nfour/xroute/discussions)