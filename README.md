# XRoute

Mobx powered `History` router, with types.

## Features

- [x] Declarative observable wrapper over the `History` interface
- [x] Type safe `pathname` params
- [x] Type safe `search` params via `qs` serialization
- [x] Type safe `hash` string
- [x] Workarounds for some known issues with History: [Here](https://github.com/ReactTraining/history/issues/811)
- [x] Route inheritance for nesting routes 

## Usage

- [x] Requires >= Mobx@6

> See the [stories for usage examples](./stories/mobx.stories.tsx)

- [docs/routeDefinition.ts](./docs/routeDefinition.ts)

```tsx
import { createBrowserHistory } from 'history'
import { XRoute, XRouter } from 'xroute'

/** A simple route, matches the `/`, the root page */
export const HomeRoute = XRoute('home')
  .Resource('/') // /
  .Type<{
    pathname: {}
    search: {}
  }>()

enum AdminSections {
  Analytics = 'analytics',
  Users = 'users',
}

export const AdminRoute = XRoute('admin')
  .Resource(
    `/admin/:section(${AdminSections.Analytics}|${AdminSections.Users})`, // /admin/:section(analytics|users)
  )
  .Type<{
    pathname: { section?: AdminSections }
    search: {}
  }>()

enum AdminAnalyticsSubSections {
  TopPages = 'topPages',
  TopUsers = 'topUsers',
  RawData = 'rawData',
}

const AdminAnalyticsSubsectionsURI = `:subSection(${AdminAnalyticsSubSections.TopPages}|${AdminAnalyticsSubSections.TopUsers}|${AdminAnalyticsSubSections.RawData})?`

//
// OR:
//    if you dont care about type safety, do this:
//

const AdminAnalyticsSubsectionsURILoose = `:subSection(${Object.values(
  AdminAnalyticsSubSections,
).join('|')})?`

export const AdminAnalyticsRoute = AdminRoute.Extend('adminAnalytics')
  .Resource(`/${AdminAnalyticsSubsectionsURI}`) // /admin/analytics/:subSection(topPages|topUsers|rawData)
  .Type<{
    pathname: { subSection?: AdminAnalyticsSubSections }
    search: {}
  }>()

export const AdminUsersRoute = AdminRoute.Extend('adminUsers')
  .Resource(`/users`) // /admin/users
  .Type<{
    pathname: {}

    // You don't need to use the pathname at all if you want to keep it simple
    // Can even nest objects and arrays.
    search: {
      userId?: string // ends up as ?userId=123
      editor?: {
        line?: string
        activeToolId?: string
        selectedItems?: string[]
      } // ?editor[line]=1&editor[activeToolId]=2&editor[selectedItems]=3&editor[selectedItems]=4
    }
  }>()

export const NotFoundRoute = XRoute('notFound')
  .Resource('/:someGarbage(.*)?') // /:someGarbage(.*)?
  .Type<{
    pathname: {
      /** The pathname that didnt match any route */
      someGarbage?: string
    }
    search: {}
  }>()

export function createRouter() {
  return new XRouter(
    // Order matters, notice the `notFound` route is at the end, to act as a fallback
    [
      AdminAnalyticsRoute,
      AdminUsersRoute,
      AdminRoute,
      HomeRoute,
      NotFoundRoute,
    ],
    createBrowserHistory(),
  )
}

```

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

const HomeRoute = XRoute('home')
  .Resource('/:language(en|da|de)?') // Optional language param, eg. /en or /
  .Type<{
    pathname: { language?: 'en' | 'da' | 'de' }
    search: {}
  }>()

const UserProfileRoute = HomeRoute.Extend('userProfile')
  .Resource('/:language(en|da|de)/user/:userId') // Required language, eg. /da/user/11
  .Type<{
    pathname: { language: 'en' | 'da' | 'de'; userId: string }
    search: { profileSection: 'profile' | 'preferences' }
  }>()

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