import {observable, action, autorun, when} from 'mobx'
import history from '../history'
// mobx.configure({ enforceActions: true })
class GlobalStore {
  constructor(http){
    this.http = http
    this.STORAGE_KEY = 'tq-react-tpl-store-key'
  }
  // store
  @observable state = {
    user: {},
    token: '',
    remember: null,
  }

  @observable isInitState = false

  handleWhen = when(
    () => !this.isInitState,
    () => this.resetStore && this.resetStore()
  )

  handleAutoRun = autorun(() => {
    if(this.isInitState && typeof localStorage !== 'undefined') {
      this.isInitState && localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state))
    }
  })

  @action('登录') login = async (username, password, isRemember) => {
    const rst = await this.http.post('/api/login.action', {
      username,
      password
    })

    this.state.user = rst.user
    this.state.token = rst.token
    this.state.remember = isRemember ? {
      username,
      password,
    }: null
    return rst
  }

  @action('登出') logout = async (isForce = false) => {
    const rst = await this.http.get('/api/logout.action')
    if (rst.success || isForce) {
      this.state.user = {}
      this.state.token = ''
      history.replace('/login')
    }
    return rst
  }

  @action('初始化STORE') resetStore = () => {
    if (typeof localStorage !== 'undefined') {
      this.state = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || this.state
      this.isInitState = true
    }
  }
}

export default GlobalStore