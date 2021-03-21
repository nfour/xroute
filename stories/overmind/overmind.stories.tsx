import { createMemoryHistory } from 'history';
import { createOvermind, SERIALIZE } from 'overmind';
import {
  createActionsHook,
  createEffectsHook,
  createHook,
  createReactionHook,
  createStateHook,
  Provider,
} from 'overmind-react';
import * as React from 'react';
import { XRouter } from '../../XRouter';
import { demoRoutes, SharedLanguageDemo, ToPathDemo } from '../demoComponents';

export default {
  title: 'XRouter Overmind',
};

const { BazRoute, DefaultRoute, FooRoute, validLanguages } = demoRoutes();

function createRouter() {
  return new XRouter([BazRoute, FooRoute, DefaultRoute], createMemoryHistory());
}

type RouterInstance = ReturnType<typeof createRouter>;
class LoginForm {
  [SERIALIZE] = true;

  private username: string;
  private password: string;
  constructor() {
    this.username = '';
    this.password = '';
  }

  get isValid() {
    return Boolean(this.username && this.password);
  }

  reset() {
    this.username = Date.now() + '';
    this.password = '';
  }
}
const state = {
  router: createRouter(),
  login: new LoginForm(),
};
const config = {
  onInitialize(_: any, om: any) {
    // om.reaction(
    //   (s: any) => s.router,
    //   (v: any) => console.log('router changed', v),
    // );

    om.reaction(
      (s: any) => s.router.location,
      (v: any) => console.log({ v }),
      {
        nested: true,
      },
    );

    console.log({ router: om.state.router, r: om.reaction });

    om.state.login.reset();
    // om.state.router.useHistory(om.reaction);
  },
  state,
  actions: {},
};

const overmind = createOvermind(config, {
  devtools: false,
});

const useOvermind = createHook<typeof config>();
const useState = createStateHook<typeof config>();
const useActions = createActionsHook<typeof config>();
const useEffects = createEffectsHook<typeof config>();
const useReaction = createReactionHook<typeof config>();

console.log({ overmind, useState });

const WithOvermind = ({ children }: any) => {
  return <Provider value={overmind}>{children}</Provider>;
};

export const to_path = () => {
  const Component = () => {
    const { router } = useState();

    console.log('!~!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! render', { router });

    if (!router) return <></>;

    return (
      <>
        <ToPathDemo router={router} />
      </>
    );
  };

  return (
    <>
      <WithOvermind>
        <Component />
      </WithOvermind>
    </>
  );
};

export const shared_language_params = () => {
  const Component = () => {
    const {
      state: { router },
      reaction,
    } = useOvermind();

    React.useEffect(() => {
      // reaction();
    }, []);

    console.log('!~!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! render', { router });

    if (!router) return <></>;

    return (
      <>
        <SharedLanguageDemo
          router={router}
          validLanguages={validLanguages as any}
        />
      </>
    );
  };

  return (
    <>
      <WithOvermind>
        <Component />
      </WithOvermind>
    </>
  );
};
