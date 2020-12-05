# XRoute

Mobx powered `History` router, with types.

## Features

- [x] Decoupled state based routing
- [x] Type safe `pathname` params
- [ ] (Soon) Type safe `search` query variables (using qs)
- [ ] (Future?) Automatic type acquisition from pathname string literal

## Usage

- [x] Requires >= Mobx@6

```tsx
import { XRoute } from 'xroute'

//
// Define some routes
//

const HomeRoute = XRoute(
  'home',
  '/:language(en|da|de)?', // Optional language param
  {} as { language?: 'en'|'da'|'de' } 
)

const UserProfileRoute = XRoute(
  'userProfile',
  '/:language(en|da|de)/user/:userId', // All params required
  {} as { language: 'en'|'da'|'de', userId: string } 
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

import { autorun } from 'mobx

// Log some changes
autorun(() => {
  console.log(
    'Active route params:', router.route?.params
  )
})

// Navigate to: /en
router.routes.home.push({ language: 'en' })

// Navigates to: /en/user/11
router.routes.userProfile.push({ language: 'en', userId: '11' })

// Just change the language in the active route.
// This works as long as the parameter is shared between all routes.
// Navigates to: /da/user/11
router.route?.push({ language: 'da' })

// Re-use the current language
// Navigates to: /da/
router.routes.home.push({ language: router.route?.params?.language })

// Provide a route object to route from anywhere:
// Navigate to: /de/user/55
router.push(UserProfileRoute, { language: 'de', userId: '55' })

// Access route properties:
router.route?.params?.userId // => '55'
router.route?.params?.language // => 'de'

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
    return this.route.params?.userId
  }

  setUserId(userId: string) {
    // Notice we get to re-use the `language` parameter
    this.route.push({ ...this.route.params, userId })
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

import { observer } from 'mobx-react-lite

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