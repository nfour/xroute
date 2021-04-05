import { createMemoryHistory } from 'history';
import { observer } from 'mobx-react-lite';
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
  {} as { language: ILanguage },
);
const BazRoute = XRoute(
  'baz',
  `/${languageParam}/baz`,
  {} as { language: ILanguage },
);

const DefaultRoute = XRoute(
  'default',
  '/:language?',
  {} as { language?: ILanguage },
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
          <textarea>{router.routes.foo.toPath({ language: 'de' })}</textarea>
        </li>
        <li>
          Foo route path, en:{' '}
          <textarea>{router.routes.foo.toPath({ language: 'en' })}</textarea>
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
                  value={router.route?.path}
                  onChange={(e) => router.replace(e.target.value)}
                />
              </dd>
              <dt>Links:</dt>
              <dd>
                <dl>
                  <dt>
                    LANGUAGE:{' '}
                    <b>{router.route?.params?.language || 'undefined'}</b>
                  </dt>
                  <dd>
                    {validLanguages.map((language) => (
                      <>
                        <div>
                          <button
                            onClick={() => router.route?.push({ language })}
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
                      onClick={() => router.routes.foo.push({ language: 'en' })}
                    >
                      /en/foo
                    </button>
                    <br />
                    <button
                      onClick={() =>
                        router.routes.foo.push({
                          // Re-use the current route's language param or default to en
                          language: router.route?.params?.language || 'en',
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
                      onClick={() => router.routes.baz.push({ language: 'en' })}
                    >
                      /en/baz
                    </button>
                    <br />
                    <button
                      onClick={() =>
                        router.routes.baz.push({
                          language: router.route?.params?.language || 'en',
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
                        router.routes.default.push({ ...router.route?.params })
                      }
                    >
                      /:language/
                    </button>
                    <br />
                    <button
                      onClick={() =>
                        router.routes.default.push({ language: 'da' })
                      }
                    >
                      /da/
                    </button>
                    <br />
                    <button
                      onClick={() =>
                        router.routes.default.push({ language: undefined })
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
