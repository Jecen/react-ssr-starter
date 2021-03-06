
const routes = {
  path: '/', 
  async action({ next }) {
    const route = await next()
    if (route) {
      route.title = `天阙React模版-${route.title || ''}`
      route.description = '杭州天阙技术有限公司'
    }
    return route
  },
  children: [{
    path: '/',
    load: () => import(/* webpackChunkName: 'home' */ './home'),
  },{
    path: '/login',
    load: () => import(/* webpackChunkName: 'login' */ './login')
  }, {
    path: '/home',
    action() {
      return {redirect: '/'}
    }
  }]
}

export default routes