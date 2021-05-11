import * as React from 'react';
import { IRouter, XRoute } from '../XRouter';

export const demoRoutes = () => {
  const validLanguages = ['en', 'da', 'de'] as const;
  const languageParam = `:language(${validLanguages.join('|')})`;

  type ILanguage = typeof validLanguages[number];

  const FooRoute = XRoute(
    'foo',
    `/${languageParam}/foo`,
    {} as { pathname: { language: ILanguage }; search: {} },
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

  return {
    DefaultRoute,
    BazRoute,
    FooRoute,
    validLanguages,
    languageParam,
  };
};

export const ToPathDemo = ({ router }: { router: IRouter }) => {
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

export const SharedLanguageDemo = ({
  router,
  validLanguages,
}: {
  router: IRouter;
  validLanguages: string[];
}) => {
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
                value={router.route?.uri}
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
                            router.route?.push({ pathname: { language } })
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
                    onClick={() => router.routes.foo.push({ language: 'en' })}
                  >
                    /en/foo
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      router.routes.foo.push({
                        // Re-use the current route's language param or default to en
                        language: router.route?.pathname?.language || 'en',
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
                        language: router.route?.pathname?.language || 'en',
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
                      router.routes.default.push({ ...router.route?.pathname })
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
};
