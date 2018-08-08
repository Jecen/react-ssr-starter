import Router from 'universal-router'
import routes from './routes'

const router = new Router(routes, {
  resolveRoute(context, params) {
    if (typeof context.route.load === 'function') {
      return context.route
        .load()
        .then(action => action.default(context, params))
    }
    if (typeof context.route.action === 'function') {
      return context.route.action(context, params)
    }
    return undefined
  },
})

export default router