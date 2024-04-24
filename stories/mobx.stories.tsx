import { createBrowserHistory, createMemoryHistory } from 'history'
import { Observer, observer } from 'mobx-react-lite'
import * as React from 'react'
import { findActiveRoute, XRoute, XRouter } from '../XRouter'

export default {
  title: 'XRouter Mobx',
}

const validLanguages = ['en', 'da', 'de'] as const
const languageParam = `:language(${validLanguages.join('|')})`

type ILanguage = (typeof validLanguages)[number]

const FooRoute = XRoute(
  'foo',
  `/${languageParam}/foo`,
  {} as {
    pathname: { language: ILanguage }
    search: { a?: string; b?: { x: string } }
    hash?: string
  },
)

const FooBarRoute = XRoute(
  'foobar',
  `/${languageParam}/foobar`,
  {} as {
    pathname: { language: ILanguage }
    search: { a?: string; zzz?: string }
  },
)

const BazRoute = XRoute(
  'baz',
  `/${languageParam}/baz/:baz`,
  {} as { pathname: { language: ILanguage; baz: string }; search: {} },
)

const DefaultRoute = XRoute(
  'default',
  '/:language?',
  {} as { pathname: { language?: ILanguage }; search: {} },
)

export const To_path = () => {
  const Component = () => {
    const [router] = React.useState(
      () =>
        new XRouter([FooRoute, BazRoute, DefaultRoute], createMemoryHistory()),
    )

    return (
      <ul>
        <li>
          Foo route path, german:{' '}
          <textarea>
            {router.routes.foo.toUri({ pathname: { language: 'de' } })}
          </textarea>
        </li>
        <li>
          Foo route path, en:{' '}
          <textarea>
            {router.routes.foo.toUri((uri) => ({
              pathname: { ...uri.pathname, language: 'en' },
            }))}
          </textarea>
        </li>
      </ul>
    )
  }

  return (
    <>
      <Component />
    </>
  )
}

export const Hash_history = () => {
  const [router] = React.useState(
    () =>
      new XRouter(
        [FooRoute, BazRoute, FooBarRoute, DefaultRoute],
        createBrowserHistory(),
      ),
  )

  return (
    <>
      <Observer>
        {() => (
          <>
            <dl>
              <dt>ACTIVE ROUTE 333:</dt>
              <dd>
                <pre>
                  {JSON.stringify(
                    {
                      search: router.route?.search,
                      pathname: router.route?.pathname,
                      hash: router.route?.hash,
                    },
                    null,
                    2,
                  )}
                </pre>
                <dd>{router.route?.uri}</dd>
              </dd>
            </dl>

            <dl>
              <dt>Set Random route params:</dt>
              <dd>
                <button
                  onClick={() => {
                    router.routes.foo.push({
                      pathname: { language: 'en' },
                      search: {
                        a: `${Date.now()}`,
                        b: { x: '1' },
                      },
                    })
                  }}
                >
                  Set
                </button>
              </dd>
            </dl>
          </>
        )}
      </Observer>
    </>
  )
}

export const Search_params = () => {
  const [router] = React.useState(
    () =>
      new XRouter(
        [FooRoute, BazRoute, FooBarRoute, DefaultRoute],
        createMemoryHistory(),
      ),
  )

  return (
    <>
      <Observer>
        {() => {
          const { foo: route } = router.routes
          const [search, setSearch] = React.useState({
            a: `${Date.now()}`,
            b: { x: '1' },
          })

          React.useEffect(() => {
            route.pushExact((uri) => ({
              ...uri,
              pathname: { ...uri.pathname, language: 'en' },
            }))
          }, [search])

          const activeRouteTest = findActiveRoute([
            router.routes.foo,
            router.routes.foobar,
            router.routes.baz,
            router.routes.default,
          ])

          activeRouteTest // Testing types

          return (
            <>
              <dl>
                <dt>ACTIVE ROUTE:</dt>
                <dd>
                  <pre>
                    {JSON.stringify(
                      {
                        search: route.search,
                        pathname: route.pathname,
                        hash: route.hash,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </dd>
                <dd>{route.uri}</dd>
              </dl>
              <dl>
                <dt>
                  toUri()
                  <br />
                  <label>a</label>
                  <input
                    value={search.a}
                    onChange={(e) =>
                      setSearch({
                        ...search,
                        a: e.target.value,
                      })
                    }
                  />
                  <label>b.x</label>
                  <input
                    value={search.b.x}
                    onChange={(e) =>
                      setSearch({
                        ...search,
                        b: {
                          ...search.b,
                          x: e.target.value,
                        },
                      })
                    }
                  />
                </dt>
              </dl>
              <dl>
                <dt>Exact Route 1:</dt>
                <dd>
                  <button
                    onClick={() =>
                      route.pushExact({
                        pathname: { language: 'en' },
                        search: { a: '1' },
                      })
                    }
                  >
                    Set exactly: /en/?a=1
                  </button>
                </dd>
              </dl>
              <dl>
                <dt>Exact Route 2:</dt>
                <dd>
                  <button
                    onClick={() =>
                      route.pushExact({
                        pathname: { language: 'en' },
                        search: { b: { x: '2' } },
                      })
                    }
                  >
                    Set exactly: /en/?b[x]=2
                  </button>
                </dd>
              </dl>
              <dl>
                <dt>Exact Route 3:</dt>
                <dd>
                  <button
                    onClick={() =>
                      router.routes.foo.push({
                        pathname: { language: 'en' },
                        search: {},
                      })
                    }
                  >
                    Set exactly: /en/
                  </button>
                </dd>
              </dl>
              <dl>
                <dt>Add `b` to foo:</dt>
                <dd>
                  <button
                    onClick={() =>
                      router.routes.foo.push({
                        pathname: { language: 'en' },
                        search: {
                          b: { x: '111' },
                        },
                      })
                    }
                  >
                    Set exactly: /en/
                  </button>
                </dd>
              </dl>
              <dl>
                <dt>Add `a` to foo:</dt>
                <dd>
                  <button
                    onClick={() =>
                      router.routes.foo.push({
                        pathname: { language: 'en' },
                        search: {
                          a: '222',
                        },
                      })
                    }
                  >
                    Set exactly: /en/
                  </button>
                </dd>
              </dl>
              <dl>
                <dt>Add `a` to foobar:</dt>
                <dd>
                  <button
                    onClick={() =>
                      router.routes.foobar.push({
                        pathname: { language: 'en' },
                        search: {
                          a: '222',
                        },
                      })
                    }
                  >
                    Set exactly: /en/
                  </button>
                </dd>
              </dl>
              <dl>
                <dt>Add `zzz` to foobar:</dt>
                <dd>
                  <button
                    onClick={() =>
                      router.routes.foobar.push({
                        pathname: { language: 'en' },
                        search: {
                          zzz: '111',
                        },
                      })
                    }
                  >
                    Set exactly: /en/
                  </button>
                </dd>
              </dl>
            </>
          )
        }}
      </Observer>
    </>
  )
}

export const Shared_language_params = () => {
  const DemoComponent = observer(() => {
    /** Create the router for the demo with the route list */
    const [router] = React.useState(
      () =>
        new XRouter([FooRoute, BazRoute, DefaultRoute], createMemoryHistory()),
    )

    const activeProps = {
      style: { color: 'green', outline: '2px solid green' },
    }

    return (
      <>
        <dl
          style={{
            fontFamily: 'consolas, monospace',
            fontSize: '1.15em',
          }}
        >
          <dl>
            <dt>INPUT:</dt>
            <dd>
              <dt>URL Bar:</dt>
              <dd>
                <input
                  style={{ fontSize: '2em' }}
                  value={router.route?.location.pathname}
                  onChange={(e) => router.replace(e.target.value)}
                />
              </dd>
              <dt>Links:</dt>
              <dd>
                <dl>
                  <dt>
                    LANGUAGE:{' '}
                    <b>{router.route?.pathname?.language || 'undefined'}</b>
                  </dt>
                  <dd>
                    {validLanguages.map((language) => (
                      <>
                        <div>
                          <button
                            onClick={() =>
                              router.route?.push({
                                pathname: { language },
                              })
                            }
                          >
                            {language}
                          </button>
                        </div>
                      </>
                    ))}
                  </dd>
                  <dt {...(router.route?.key === 'foo' ? activeProps : {})}>
                    FOO
                  </dt>
                  <dd>
                    <button
                      onClick={() =>
                        router.routes.foo.push({ pathname: { language: 'en' } })
                      }
                    >
                      /en/foo
                    </button>
                    <br />
                    <button
                      onClick={() =>
                        router.routes.foo.push({
                          pathname: {
                            // Re-use the current route's language param or default to en
                            language: router.route?.pathname?.language || 'en',
                          },
                        })
                      }
                    >
                      /:language/foo
                    </button>
                  </dd>
                  <dt {...(router.route?.key === 'baz' ? activeProps : {})}>
                    BAZ
                  </dt>
                  <dd>
                    <button
                      onClick={() =>
                        router.routes.baz.push({
                          pathname: { language: 'en', baz: 'sdsds' },
                        })
                      }
                    >
                      /en/baz
                    </button>
                    <br />
                    <button
                      onClick={() =>
                        router.routes.baz.push({
                          pathname: {
                            baz: 'sdsdsdsds',
                          },
                        })
                      }
                    >
                      /:language/baz/sdsdsdsds
                    </button>
                  </dd>
                  <dt {...(router.route?.key === 'default' ? activeProps : {})}>
                    DEFAULT
                  </dt>
                  <dd>
                    <button
                      onClick={() =>
                        router.routes.default.push({
                          pathname: {
                            ...router.route?.pathname,
                          },
                        })
                      }
                    >
                      /:language/
                    </button>
                    <br />
                    <button
                      onClick={() =>
                        router.routes.default.push({
                          pathname: { language: 'da' },
                        })
                      }
                    >
                      /da/
                    </button>
                    <br />
                    <button
                      onClick={() =>
                        router.routes.default.push({
                          pathname: { language: undefined },
                        })
                      }
                    >
                      /
                    </button>
                  </dd>
                </dl>
              </dd>
            </dd>
          </dl>
          <dt>router.location</dt>
          <dd>
            <pre>{JSON.stringify(router.location)}</pre>
          </dd>
          <dt>router.route</dt>
          <dd>
            <pre>{JSON.stringify(router.route, null, 2)}</pre>
          </dd>

          <dl>
            <dt>router.routes</dt>
            <dd>
              <pre>{JSON.stringify(router.routes, null, 2)}</pre>
            </dd>
          </dl>
        </dl>
      </>
    )
  })

  return <DemoComponent />
}

export const Extends_routes = observer(() => {
  const AppRoute = XRoute('app').Resource('/').Type<{
    pathname: {}
    // pathname: { x?: 1}
    search: { foo?: number }
  }>()

  const NotFoundRoute = XRoute('notFound').Resource('/:garbage(.*)?').Type<{
    pathname: { garbage?: string }
    search: {}
  }>()

  const AdminRoute = XRoute('admin').Resource('/admin').Type<{
    pathname: {}
    search: { language?: 'en' | 'da' }
  }>()

  const AdminAnalyticsRoute = AdminRoute.Extend('adminAnalytics')
    .Resource('/analytics')
    .Type<{
      pathname: { section: 'analytics' }
      search: {}
      hash: '#foo'
    }>()

  const router = React.useMemo(
    () =>
      new XRouter(
        [AdminAnalyticsRoute, AdminRoute, AppRoute, NotFoundRoute],

        createMemoryHistory(),
      ),
    [],
  )

  router.routes.adminAnalytics.hash // #foo
  router.routes.adminAnalytics.pathname?.section // 'analytics'
  router.routes.adminAnalytics.search?.language // 'en' | 'da' | undefined

  return (
    <dl
      style={{
        fontFamily: 'consolas, monospace',
        fontSize: '1.15em',
      }}
    >
      <dt>URL Bar:</dt>
      <dd>
        <input
          style={{ fontSize: '2em' }}
          value={[
            router.route?.location.pathname,
            router.route?.location.search,
            router.route?.location.hash,
          ].join('')}
          onChange={(e) => router.replace(e.target.value)}
        />
      </dd>
      <dt>toUri:</dt>
      <dd>
        <input
          disabled
          style={{ fontSize: '2em' }}
          value={router.route?.toUri()}
        />
      </dd>
      <dt>Actions:</dt>
      <dd>
        <button
          onClick={() =>
            router.routes.admin.push({
              hash: '',
            })
          }
        >
          To admin page
        </button>
        <button
          onClick={() =>
            router.routes.adminAnalytics.push({
              hash: '#foo',
              search: {},
            })
          }
        >
          To admin analytics page
        </button>
        <button
          onClick={() =>
            router.routes.app.pushExact({
              pathname: {},
              hash: '',
              search: { foo: 123 },
            })
          }
        >
          To app page
        </button>
        <button
          onClick={() =>
            router.routes.notFound.push({
              pathname: { garbage: Math.random().toString(36).substring(7) },
              hash: '',
              search: { foo: Math.random() },
            })
          }
        >
          To random page (notfound)
        </button>
      </dd>
      <dt>`router`</dt>
      <dd>
        <pre>
          {JSON.stringify(
            {
              route: router.route,
              routes: router.routes,
              router,
            },
            null,
            2,
          )}
        </pre>
      </dd>
    </dl>
  )
  // // or

  // const AdminAnalyticsRoute2 = AdminRoute.Extend(
  //   XRoute('adminAnalytics').Resource('/:section(analytics)').Type<{
  //     pathname: { section: 'analytics' }
  //     search: {}
  //   }>(),
  // )

  // const AdminAnalyticsRoute3 = XRoute('adminAnalytics')
  //   .Resource('/:section(analytics)')
  //   .Type<{
  //     pathname: { section: 'analytics' }
  //     search: {}
  //   }>()
  //   .ExtendsFrom(AdminRoute)

  // router.routes.adminAnalytics.resource // /admin/:seciton(analytics)
  // router.routes.adminAnalytics.search?.language // inherited from admin route
  // router.routes.adminAnalytics.pathname?.section // 'analytics'
})
