import { createBrowserHistory } from 'history'
import { XRoute, XRouter } from 'xroute'

/** A simple route, matches the `/`, the root page */
export const HomeRoute = XRoute('home')
  .Resource('/') // /
  .Type<{
    pathname: {}
    search: {}
  }>()

export const AdminRoute = XRoute('admin')
  .Resource(
    `/admin`, // /admin
  )
  .Type<{
    pathname: {}
    search: { isAdvancedView?: boolean }
  }>()

enum AdminAnalyticsSubSections {
  TopPages = 'topPages',
  TopUsers = 'topUsers',
  RawData = 'rawData',
}

const AdminAnalyticsSubsectionsURI = `:subSection(${AdminAnalyticsSubSections.TopPages}|${AdminAnalyticsSubSections.TopUsers}|${AdminAnalyticsSubSections.RawData})?`

//
// OR:
//    if you dont care about type safety, do this:
//

const AdminAnalyticsSubsectionsURILoose = `:subSection(${Object.values(
  AdminAnalyticsSubSections,
).join('|')})?` as const

export const AdminAnalyticsRoute = AdminRoute.Extend('adminAnalytics')
  .Resource(`/analytics/${AdminAnalyticsSubsectionsURI}`) // /admin/analytics/:subSection(topPages|topUsers|rawData)
  .Type<{
    pathname: { subSection?: AdminAnalyticsSubSections }
    search: {}
  }>()

export const AdminUsersRoute = AdminRoute.Extend('adminUsers')
  .Resource(`/users`) // /admin/users
  .Type<{
    pathname: {}

    // You don't need to use the pathname at all if you want to keep it simple
    // Can even nest objects and arrays.
    search: {
      userId?: string // ends up as ?userId=123
      editor?: {
        line?: string
        activeToolId?: string
        selectedItems?: string[]
      } // ?editor[line]=1&editor[activeToolId]=2&editor[selectedItems]=3&editor[selectedItems]=4
    }
  }>()

export const NotFoundRoute = XRoute('notFound')
  .Resource('/:someGarbage(.*)?') // /:someGarbage(.*)?
  .Type<{
    pathname: {
      /** The pathname that didnt match any route */
      someGarbage?: string
    }
    search: {}
  }>()

export function createRouter() {
  return new XRouter(
    // Order matters, notice the `notFound` route is at the end, to act as a fallback
    [
      AdminAnalyticsRoute, // /admin/analytics/topPages
      AdminUsersRoute, // /admin/users?userId=123&editor[line]=1&editor[activeToolId]=2&editor[selectedItems]=3&editor[selectedItems]=4
      AdminRoute, // /admin
      HomeRoute, // /
      NotFoundRoute, // /asdaskjdkalsdjklasd
    ],
    createBrowserHistory(),
  )
}
