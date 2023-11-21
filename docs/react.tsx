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
