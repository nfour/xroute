import { css } from '@emotion/react'
import { createMemoryHistory } from 'history'
import { trace } from 'mobx'
import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { XRoute } from '../XRoute'
import { XRouter } from '../XRouter'
import { z } from 'zod'

export const DefaultsRouteRenderTest = observer(() => {
  return <RouteObservableTreeTest routeConfig={routeConfigs.simple.root} />
})

export const OptimizedRouteRenderTest = observer(() => {
  return (
    <RouteObservableTreeTest
      routeConfig={routeConfigs.schemaed.root}
      useOptimizedObservability={true}
    />
  )
})

const routeConfigs = {
  simple: (() => {
    return {
      root: XRoute('root').Resource('/:rootValue').Type<{
        pathname: {
          rootValue: string
        }
        search: {
          searchValue?: string
          deep?: {
            deepValue?: string
            deeper?: {
              deeperValue?: string
            }
          }
        }
      }>(),
    }
  })(),
  schemaed: (() => {
    return {
      root: XRoute('root')
        .Resource('/:rootValue')
        .Schema(({ schema }) => ({
          pathname: z.object({
            rootValue: z.string(),
          }),
          hash: z.string(),
          search: schema.search.merge(
            z.object({
              searchValue: z.optional(z.string()),
              deep: z.optional(
                z.object({
                  deepValue: z.optional(z.string()),
                  deeper: z.optional(
                    z.object({
                      deeperValue: z.optional(z.string()),
                    }),
                  ),
                }),
              ),
            }),
          ),
        })),
    }
  })(),
}

type RootRouteConfigType = (typeof routeConfigs)['simple']['root']
type IRouter = ReturnType<typeof CreateRootRouter>

const CreateRootRouter = <R extends RootRouteConfigType>(
  cfg: R,
  useOptimizedObservability?: boolean,
) =>
  new XRouter(
    [cfg],
    createMemoryHistory({
      initialEntries: ['/someValue'],
    }),
    {
      useOptimizedObservability,
    },
  )

const RouteObservableTreeTest = observer<{
  routeConfig: RootRouteConfigType
  useOptimizedObservability?: boolean
}>(({ routeConfig, useOptimizedObservability }) => {
  const router = React.useMemo(
    () => CreateRootRouter(routeConfig, useOptimizedObservability),
    [],
  )

  return (
    <>
      <Render_root router={router} />
    </>
  )
})

const Render_root = observer<{
  router: IRouter
}>(({ router }) => {
  return (
    <NodeObject title="root">
      <Render_root_pathname router={router} />
      <Render_root_search router={router} />
    </NodeObject>
  )
})

const Render_root_pathname = observer<{
  router: IRouter
}>(({ router }) => {
  return (
    <NodeObject title="root.pathname">
      <Render_root_pathname_rootValue router={router} />
    </NodeObject>
  )
})

const Render_root_search = observer<{
  router: IRouter
}>(({ router }) => {
  return (
    <NodeObject title="root.search">
      <Render_root_search_searchValue router={router} />
      <Render_root_search_deep router={router} />
      <Render_root_search_deep_deeper router={router} />
      <Render_root_search_deep_deepValue router={router} />
      <Render_root_search_deep_deeper_deeperValue router={router} />
      <Render_root_search_deep_deeper_deeperValue_noUpdate router={router} />
    </NodeObject>
  )
})

const Render_root_pathname_rootValue = observer<{
  router: IRouter
}>(({ router }) => {
  return (
    <>
      <NodeDisplay
        path="router.routes.root.pathname.rootValue"
        value={router.routes.root.pathname.rootValue}
        onChange={() =>
          router.routes.root.push((uri) => ({
            pathname: {
              ...uri.pathname,
              rootValue: uid(),
            },
          }))
        }
      />
    </>
  )
})

const Render_root_search_searchValue = observer<{
  router: IRouter
}>(({ router }) => {
  return (
    <>
      <NodeDisplay
        path="router.routes.root.search.searchValue"
        value={router.routes.root.search.searchValue}
        onChange={() =>
          router.routes.root.push((uri) => ({
            search: {
              ...uri.search,
              searchValue: uid(),
            },
          }))
        }
      />
    </>
  )
})

const Render_root_search_deep = observer<{
  router: IRouter
}>(({ router }) => {
  return (
    <NodeObject title="root.search.deep">
      <Render_root_search_deep_deepValue router={router} />
      <Render_root_search_deep_deeper router={router} />
    </NodeObject>
  )
})

const Render_root_search_deep_deepValue = observer<{
  router: IRouter
}>(({ router }) => {
  return (
    <>
      <NodeDisplay
        path="router.routes.root.search.deep.deepValue"
        value={router.routes.root.search.deep?.deepValue}
        onChange={() =>
          router.routes.root.push((uri) => ({
            search: {
              ...uri.search,
              deep: {
                ...uri.search.deep,
                deepValue: uid(),
              },
            },
          }))
        }
      />
    </>
  )
})

const Render_root_search_deep_deeper = observer<{
  router: IRouter
}>(({ router }) => {
  return (
    <NodeObject title="root.search.deep.deeper">
      <Render_root_search_deep_deeper_deeperValue router={router} />
    </NodeObject>
  )
})

const Render_root_search_deep_deeper_deeperValue = observer<{
  router: IRouter
}>(({ router }) => {
  trace()

  return (
    <>
      <NodeDisplay
        path="router.routes.root.search.deep.deeper.deeperValue"
        value={router.routes.root.search.deep?.deeper?.deeperValue}
        onChange={() =>
          router.routes.root.push({
            search: {
              deep: {
                deeper: {
                  deeperValue: uid(),
                },
              },
            },
          })
        }
      />
    </>
  )
})

const Render_root_search_deep_deeper_deeperValue_noUpdate = observer<{
  router: IRouter
}>(({ router }) => {
  trace()

  return (
    <>
      <NodeDisplay
        path="router.routes.root.search.deep.deeper.deeperValue"
        value={router.routes.root.search.deep?.deeper?.deeperValue}
        onChange={() =>
          router.routes.root.push({
            search: {
              deep: {
                deeper: {
                  deeperValue: 'noUpdate',
                },
              },
            },
          })
        }
      />
    </>
  )
})

const uid = () => Math.random().toString(36).slice(2)
const NodeObject = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div
    css={css`
      padding: 0.25rem;
      margin-left: 1rem;
      padding-left: 2rem;
      border-left: 1px dotted #0004;
    `}
  >
    <h4>{title}</h4>
    {children}
  </div>
)

const NodeDisplay = ({
  value,
  path,
  onChange,
}: {
  value: any
  path: string
  onChange: () => void
}) => (
  <div
    css={css`
      padding: 0.5rem 0.25rem;
      box-shadow: 0 0 0 1px #0001, 0 0 0 3px #0003;
      *,
      table {
        width: 100%;

        tr th,
        tr td {
          text-align: left;
          padding: 0.2rem 0.5rem;
          &:nth-of-type(1) {
            width: 1px;
          }
        }
      }
    `}
  >
    <table>
      <thead>
        <tr>
          <th>LastRender</th>
          <th>Pointer</th>
          <th>Value</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{Date.now()}</td>
          <td>{path}</td>
          <td>
            <pre>{JSON.stringify(value, null, 2)}</pre>
          </td>
          <td>
            <button onClick={onChange}>Update</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)
