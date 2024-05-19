import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { XRouter } from '../XRouter'
import { XRoute } from '../XRoute'
import { createMemoryHistory } from 'history'
import { css } from '@emotion/react'

export const ReactRenderTest = observer(() => {
  const router = React.useMemo(
    () =>
      new XRouter(
        [
          XRoute('home')
            .Resource('/')
            .Type<{ pathname: {}; search: {}; hash: '' }>(),
          XRoute('app')
            .Resource('/app')
            .Type<{ pathname: {}; search: {}; hash: '' }>(),
          XRoute('admin').Resource('/admin/:section?').Type<{
            pathname: { section: 'upload' | 'settings' }
            search: {}
            hash: ''
          }>(),
        ],
        createMemoryHistory(),
        {},
      ),
    [],
  )

  return (
    <div>
      <div
        css={css`
          gap: 0.5em;
          display: flex;

          button {
            border: 0;
            padding: 0.5em 1em;
            cursor: pointer;
            &[data-active='true'] {
              outline: 2px solid red;
              cursor: default;
            }
          }
        `}
      >
        <button
          data-active={router.routes.home.isActive && 'true'}
          onClick={() => router.routes.home.push()}
        >
          Home
        </button>
        <button
          data-active={router.routes.admin.isActive && 'true'}
          onClick={() => router.routes.admin.push()}
        >
          Admin
        </button>
      </div>
      <div>
        {router.routes.home.isActive && <HomePage />}
        {router.routes.admin.isActive && <AdminPage />}
      </div>
    </div>
  )
})

const AdminPage = observer(() => {
  return (
    <div>
      <h1>Admin</h1>
    </div>
  )
})

const HomePage = observer(() => {
  return (
    <div>
      <h1>Home</h1>
    </div>
  )
})
