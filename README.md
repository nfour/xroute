# XRoute

Mobx powered `History` router, with types.

## Features

- [x] Declarative observable wrapper over the `History` interface
- [x] Type safe `pathname` params
- [x] Type safe `search` params via `qs` serialization
- [x] Type safe `hash` string
- [ ] (Future) Automatic type acquisition from pathname string literal

## Usage

- [x] Requires >= Mobx@6

> See the [source for Typescript definition](./xroute.ts)
> See the [stories for usage examples](./xroute.stories.ts)

## Simple example, with React

```tsx
import { XRoute, XRouter } from 'xroute'
import { observer } from 'mobx-react-lite'
import * as React from 'react'

const blueRoute = XRoute(
  'blue',
  '/blue/:saturation/:alpha?', // Optional param
  {} as {
    pathname: {
      /** 0-100 */
      saturation: string
      /** 0-100 */
      alpha?: string
    },
    search: {},
  } 
)

const hueRoute = XRoute(
  'hue',
  '/hue', 
  {} as {
    pathname: {},
    search: {
      alpha?: string,
      hue?: {
        red?: string,
        green?: string,
        blue?: string
      }
    },
  } 
)

const App = observer(() => {
  const [router] = React.useState(() => new XRouter([blueRoute, hueRoute]))

  return (
    <>
      {router.routes.blue.isActive ?? <>
        <label>Blue</label>
        <div
          style={{
            height: '100px',
            width: '100px',
            backgroundColor: `hsl(
              248deg
              ${router.routes.blue.pathname?.saturation ?? '50'}%
              ${router.routes.blue.pathname?.alpha ? `/ ${router.routes.blue.pathname?.alpha}%` : ''}
            )`
          }}
        />
        <button
          onClick={() =>
            router.routes.blue.push({
              pathname: {
                saturation: Math.max(100, 10 + Number(router.routes.blue.pathname?.saturation ?? 0)).toString()
              }
            })
          }
        >+ Increase saturation</button>
        <button
          onClick={() =>
            router.routes.blue.push({
              pathname: {
                saturation: Math.abs(-10 + Number(router.routes.blue.pathname?.saturation ?? 0)).toString()
              }
            })
          }
        >- Reduce saturation</button>
      </>}
      {router.route?.key === 'hue' ?? <>
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
            )`
          }}
        />
        <div>
          <label>Red:</label>
          <input
            value={router.routes.hue.search?.hue?.red}
            onChange={(e) =>
              router.routes.hue.push({
                hue: {
                  ...router.routes.hue.search?.hue ?? {},
                  red: e.target.value
                }
              })
            }
          />
          {
            /* ... green, blue, alpha ... */
          }
        </div>
      </>}
    </>
  )
})
```

## Detailed examples

```tsx
import { XRoute } from 'xroute'

//
// Define some routes
//

const HomeRoute = XRoute(
  'home',
  '/:language(en|da|de)?', // Optional language param
  {} as {
    pathname: { language?: 'en'|'da'|'de' },
    search: {},
  } 
)

const UserProfileRoute = XRoute(
  'userProfile',
  '/:language(en|da|de)/user/:userId', // All params required
  {} as {
    pathname: { language: 'en'|'da'|'de', userId: string },
    search: { profileSection: 'profile'|'preferences' },
  } 
)

//
// Construct 
//

import { XRouter } from 'xroute'
import { createHashHistory } from 'history'

const router = new XRouter(
  [
    UserProfileRoute,
    HomeRoute,
  ],
  createHashHistory()
)

//
// Use it
//

import { autorun } from 'mobx'

// Log some changes
autorun(() => console.log('Active route:', router.route))

// Navigate to: /en
router.routes.home.push({ pathname: { language: 'en' } })

// Get the pathname, eg. to put inside an <a href="" />
const homeDaUri = router.routes.home.toUri({ language: 'da' }) // "/da"

// Navigates to: /en/user/11
router.routes.userProfile.push({ pathname: { language: 'en', userId: '11' } })

// Just change the language in the active route.
// This works as long as the parameter is shared between all routes.
// Navigates to: /da/user/11
router.route?.push({ pathname: { language: 'da' } })

// Re-use the current language
// Navigates to: /da/
router.routes.home.push({ pathname: { language: router.route?.pathname.language } })

// Provide a route object to route from anywhere:
// Navigate to: /de/user/55
router.push(UserProfileRoute, { language: 'de', userId: '55' })

// Read route properties:
router.route?.pathname.userId // => '55'
router.route?.pathname.language // => 'de'

// Use routes in your own mobx models:

import { makeAutoObservable } from 'mobx'

class UserProfilePage {
  constructor(private router: XRouter) {
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
    this.route.pushExact({ pathname: { ...this.route.pathname, userId} })
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

  await delay(50) // Give it time to update the URL and come back...

  userProfilePage.userId // 200
})()

// and in react:

import { observer } from 'mobx-react-lite'

const Component = observer(() => {
  const [router] = React.useState(() =>
    new XRouter(
      [UserProfileRoute, HomeRoute],
      createHashHistory()
    )
  )
  return <>
    {router.route?.key === 'home' && <div>Home Page!</div>}
    {
      // Or do this:
    }
    {router.routes.userProfile.isActive &&
      <div>
        User Profile!
        UserID: {router.route.userProfile.params?.userId}
      </div>
    }

  </>
})


// want some hooks?

import { reaction } from 'mobx'

const listenToUserProfileRoute = () => {
  let previousIsActive: boolean;

  reaction(() => router.routes.userProfile.isActive, () => {
    const { isActive } = router.routes.userProfile

    if (isActive === previousIsActive) return

    previousIsActive = isActive

    if (isActive) {
      // on enter route
      // ...
    } else {
      // on exit route
      // ...
    }
  })
}
```

## Contributing

1. Clone the repo
2. Run Storybook:
```
yarn && yarn dev
```
