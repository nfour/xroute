# XRoute

Mobx powered `History` router, with types.

## Features

- [x] Declarative observable wrapper over the `History` interface
- [x] Type safe `pathname` params
- [x] Type safe `search` params via `qs` serialization
- [x] Type safe `hash` string
- [x] Workarounds for some known issues with History: [Here](https://github.com/ReactTraining/history/issues/811)
- [ ] (Future) Automatic type acquisition from pathname string literal

## Usage

- [x] Requires >= Mobx@6

> See the [source for Typescript definition](./xroute.ts)
> See the [stories for usage examples](./xroute.stories.ts)

## Documentation:

### Route Definition

- [docs/routeDefinition.ts](./docs//routeDefinition.ts)
```tsx
/**
 * Creating routes
 */

import { XRoute } from 'xroute'

/**
 * In this route we store data only in the `pathname`
 * @example `/blue/100/0.5` or `/blue/100`
 *
 * The ? denotes optional parameters.
 */
export const blueRoute = XRoute('blue')
  .Resource('/blue/:saturation/:alpha?')
  .Type<{
    pathname: {
      /** 0-100 */
      saturation: string
      /** 0-100 */
      alpha?: string
    }
    search: {}
  }>()

// The above is the same as:

export const blueRoute2 = XRoute(
  'blue',
  '/blue/:saturation/:alpha?', // Optional param
  {} as {
    pathname: {
      /** 0-100 */
      saturation: string
      /** 0-100 */
      alpha?: string
    }
    search: {}
  },
)

/**
 * In this route we store data only in the search string
 * @example `?alpha=0.5&hue.red=255&hue.green=0&hue.blue=0`
 */
export const hueRoute = XRoute(
  'hue',
  '/hue',
  {} as {
    pathname: {}
    search: {
      alpha?: string
      hue?: { red?: string; green?: string; blue?: string }
    }
  },
)

/**
 * In this route we store data in both the pathname and search
 * @example `/red/100?saturation=0.5`
 */
export const redRoute = XRoute(
  'red',
  '/red/:alpha?',
  {} as {
    pathname: {
      /** 0-100 */
      alpha: string
    }
    search: {
      /** 0-100 */
      saturation: string
    }
  },
)
```

### React Example

- [docs/react.tsx](./docs/react.tsx)
```tsx
/**
 * Creating routes
 */

import { observer } from 'mobx-react-lite'
import { XRouter } from 'xroute'
import * as React from 'react'
import { createBrowserHistory } from 'history'
import { blueRoute, hueRoute } from './routeDefinition'

/**
 * Lets create a react component that uses these routes
 */

export const App = observer(() => {
  const [router] = React.useState(
    () => new XRouter([blueRoute, hueRoute], createBrowserHistory()),
  )

  return (
    <>
      {router.routes.blue.isActive ?? (
        <>
          <label>Blue</label>
          <div
            style={{
              height: '100px',
              width: '100px',
              backgroundColor: `hsl(
              248deg
              ${router.routes.blue.pathname?.saturation ?? '50'}%
              ${
                router.routes.blue.pathname?.alpha
                  ? `/ ${router.routes.blue.pathname?.alpha}%`
                  : ''
              }
            )`,
            }}
          />
          <button
            onClick={() =>
              router.routes.blue.push({
                pathname: {
                  saturation: Math.max(
                    100,
                    10 + Number(router.routes.blue.pathname?.saturation ?? 0),
                  ).toString(),
                },
              })
            }
          >
            + Increase saturation
          </button>
          <button
            onClick={() =>
              router.routes.blue.push({
                pathname: {
                  saturation: Math.abs(
                    -10 + Number(router.routes.blue.pathname?.saturation ?? 0),
                  ).toString(),
                },
              })
            }
          >
            - Reduce saturation
          </button>
        </>
      )}
      {router.route?.key === 'hue' ?? (
        <>
          <label>Hue</label>
          <div
            style={{
              height: '100px',
              width: '100px',
              backgroundColor: `rgba(
              ${router.routes.hue.search?.hue?.red ?? '200'},
              ${router.routes.hue.search?.hue?.green ?? '200'},
              ${router.routes.hue.search?.hue?.blue ?? '200'},
              ${router.routes.hue.search?.alpha ?? '1'}
            )`,
            }}
          />
          <div>
            <label>Red:</label>
            <input
              value={router.routes.hue.search?.hue?.red}
              onChange={(e) =>
                // Here we use the callback form of push to update the search
                // It is given the previous state of the search and we can
                // update it as we wish.
                router.routes.hue.push((uri) => ({
                  search: {
                    hue: {
                      ...uri.search?.hue,
                      red: e.target.value,
                    },
                  },
                }))
              }
            />
            {/* ... green, blue, alpha ... */}
          </div>
        </>
      )}
    </>
  )
})

```

### Full Example

- [docs/fullExample.tsx](./docs/fullExample.tsx)

```tsx
import { createHashHistory } from 'history'
import { autorun, makeAutoObservable, reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { XRoute, XRouter } from 'xroute'

//
// Define some routes
//

const HomeRoute = XRoute(
  'home',
  '/:language(en|da|de)?', // Optional language param
  {} as {
    pathname: { language?: 'en' | 'da' | 'de' }
    search: {}
  },
)

const UserProfileRoute = XRoute(
  'userProfile',
  '/:language(en|da|de)/user/:userId', // All params required
  {} as {
    pathname: { language: 'en' | 'da' | 'de'; userId: string }
    search: { profileSection: 'profile' | 'preferences' }
  },
)

const router = new XRouter([UserProfileRoute, HomeRoute], createHashHistory())

export type MyXRouter = typeof router

// Log some changes
autorun(() => console.log('Active route:', router.route))

// Navigate to: /en
router.routes.home.push({ pathname: { language: 'en' } })

// Get the pathname, eg. to put inside an <a href="" />
const homeDaUri = router.routes.home.toUri({ pathname: { language: 'da' } }) // "/da"

// Navigates to: /en/user/11
router.routes.userProfile.push({ pathname: { language: 'en', userId: '11' } })

// Just change the language in the active route.
// This works as long as the parameter is shared between all routes.
// Navigates to: /da/user/11
router.route?.push({ pathname: { language: 'da' } })

// Re-use the current language
// Navigates to: /da/
router.routes.home.push({
  pathname: { language: router.route?.pathname.language },
})

// Provide a route object to route from anywhere:
// Navigate to: /de/user/55
router.push(UserProfileRoute, { pathname: { language: 'de', userId: '55' } })

// Read route properties:

/** This must be read from the `routes.userProfile` for the type to be consistent */
router.routes.userProfile.pathname?.userId // => '55'

/** Because `language` is available on all routes, we can read it from the active route at `router.route` */
router.route?.pathname?.language

class UserProfilePage {
  constructor(private router: MyXRouter) {
    this.router = router

    makeAutoObservable(this)
  }

  get route() {
    return this.router.routes.userProfile
  }

  get userId() {
    return this.route.pathname?.userId
  }

  get profileSection() {
    return this.route.search?.profileSection
  }

  setUserId(userId: string) {
    // Uses current route params
    this.route.push({ pathname: { userId } })

    //
    // or
    //
    // Explicitly use previous params...
    this.route.pushExact((uri) => ({
      ...uri,
      pathname: { ...uri.pathname, userId },
    }))
  }

  setProfileSection(profileSection: this['profileSection']) {
    this.route.push({ search: { profileSection } }) // sets ?profileSection=""
  }
}

// Play around with user profile:
void (async () => {
  const userProfilePage = new UserProfilePage(router)

  userProfilePage.userId // 55

  userProfilePage.setUserId('200')

  await new Promise((r) => setTimeout(r, 50)) // Give it time to update the URL and come back...

  userProfilePage.userId // 200
})()

const Component = observer(() => {
  const [router] = React.useState(
    () => new XRouter([UserProfileRoute, HomeRoute], createHashHistory()),
  )

  return (
    <>
      {router.route?.key === 'home' && <div>Home Page!</div>}
      {
        // Or do this:
      }
      {router.routes.userProfile.isActive && (
        <div>
          User Profile! UserID: {router.routes.userProfile.pathname?.userId}
        </div>
      )}
    </>
  )
})

const listenToUserProfileRoute = () => {
  let previousIsActive: boolean

  reaction(
    () => router.routes.userProfile.isActive,
    (isActive) => {
      if (isActive === previousIsActive) return // Ignore same state

      previousIsActive = isActive

      if (isActive) {
        // on enter route
        // ...
      } else {
        // on exit route
        // ...
      }
    },
  )
}

```