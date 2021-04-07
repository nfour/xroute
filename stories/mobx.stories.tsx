import { createMemoryHistory } from 'history';
import { Observer, observer } from 'mobx-react-lite';
import * as React from 'react';
import { XRoute, XRouter } from '../XRouter';

export default {
  title: 'XRouter Mobx',
};

const validLanguages = ['en', 'da', 'de'] as const;
const languageParam = `:language(${validLanguages.join('|')})`;

type ILanguage = typeof validLanguages[number];

const FooRoute = XRoute(
  'foo',
  `/${languageParam}/foo`,
  {} as {
    pathname: { language: ILanguage };
    search: { a?: string; b?: { x: string } };
  },
);
const BazRoute = XRoute(
  'baz',
  `/${languageParam}/baz`,
  {} as { pathname: { language: ILanguage }; search: {} },
);

const DefaultRoute = XRoute(
  'default',
  '/:language?',
  {} as { pathname: { language?: ILanguage }; search: {} },
);

export const to_path = () => {
  const Component = () => {
    const [router] = React.useState(
      () =>
        new XRouter([FooRoute, BazRoute, DefaultRoute], createMemoryHistory()),
    );

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
            {router.routes.foo.toUri({ pathname: { language: 'en' } })}
          </textarea>
        </li>
      </ul>
    );
  };

  return (
    <>
      <Component />
    </>
  );
};

export const search_params = () => {
  const [router] = React.useState(
    () =>
      new XRouter([FooRoute, BazRoute, DefaultRoute], createMemoryHistory()),
  );

  return (
    <>
      <Observer>
        {() => {
          const { foo: route } = router.routes;
          const [search, setSearch] = React.useState({
            a: `${Date.now()}`,
            b: { x: '1' },
          });
          const uriText = route.toUri({
            pathname: {
              language: 'da',
            },
            search,
          });

          React.useEffect(() => {
            console.log('new');

            route.push({
              pathname: { language: 'en' },
              search,
            });
          }, [search]);

          console.log('foo', route);

          return (
            <dl>
              <dt>
                Search Params.toPath():
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
              <dd>
                <dl>
                  <dt>URI:</dt>
                  <dd>{uriText}</dd>
                </dl>
                <dl>
                  <dt>Route as JSON:</dt>
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
                </dl>
              </dd>
            </dl>
          );
        }}
      </Observer>
    </>
  );
};

export const shared_language_params = () => {
  const DemoComponent = observer(() => {
    /** Create the router for the demo with the route list */
    const [router] = React.useState(
      () =>
        new XRouter([FooRoute, BazRoute, DefaultRoute], createMemoryHistory()),
    );
    const activeProps = {
      style: { color: 'green', outline: '2px solid green' },
    };

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
                                pathname: { language: 'de' },
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
                        router.routes.baz.push({ pathname: { language: 'en' } })
                      }
                    >
                      /en/baz
                    </button>
                    <br />
                    <button
                      onClick={() =>
                        router.routes.baz.push({
                          pathname: {
                            language: router.route?.pathname?.language || 'en',
                          },
                        })
                      }
                    >
                      /:language/baz
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
    );
  });

  return <DemoComponent />;
};
