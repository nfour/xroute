import { createHashHistory } from 'history'
import { autorun, makeAutoObservable, reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { XRoute, XRouter } from 'xroute'

//
// Define some routes
//

const HomeRoute = XRoute('home')
  .Resource('/') // Optional language param, eg. /en or /
  .Type<{
    pathname: {}
    search: { language?: 'en' | 'da' | 'de' }
  }>()

const UserProfileRoute = HomeRoute.Extend('userProfile')
  .Resource('/user/:userId') // Required language, eg. /da/user/11
  .Type<{
    pathname: { userId: string }
    search: { profileSection: 'profile' | 'preferences' }
  }>()

const router = new XRouter([UserProfileRoute, HomeRoute], createHashHistory())

export type MyXRouter = typeof router

// Log some changes
autorun(() => console.log('Active route:', router.route))

// Navigate to: /?language=en
router.routes.home.push({ pathname: { language: 'en' } })

// Get the pathname, eg. to put inside an <a href="" />
const homeDaUri = router.routes.home.toUri({ pathname: { language: 'da' } }) // "/da"

// Navigates to: /user/11?language=en
router.routes.userProfile.push({
  pathname: { userId: '11' },
  search: { language: 'en' },
})

// Just change the language in the active route.
// This works as long as the parameter is shared between all routes.
// Navigates to: /user/11?language=da
router.route?.push({ pathname: { language: 'da' } })

// Re-use the current language
// Navigates to: /?language=da
router.routes.home.push({
  search: { language: router.route?.search.language },
})

// Provide a route object to route from anywhere:
// Navigate to: /de/user/55
router.push(UserProfileRoute, {
  pathname: { userId: '55' },
  search: { language: 'de' },
})

// Read route properties:

/** This must be read from the `routes.userProfile` for the type to be consistent */
router.routes.userProfile.pathname?.userId // => '55'

/** Because `language` is available on all routes, we can read it from the active route at `router.route` */
router.route?.search?.language

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
      <nav>Active Language: {router.route?.search.language}</nav>
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
