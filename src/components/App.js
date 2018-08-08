import React from 'react'
import PropTypes from 'prop-types'
import { message } from 'antd'
import Store from '../store'

const ContextType = {
  insertCss: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  query: PropTypes.object,
  nav: PropTypes.object,
  fetch: PropTypes.object,
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      store: {}
    }
  }
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    children: PropTypes.element.isRequired,
  };

  static childContextTypes = {
    ...ContextType,
    store: PropTypes.object
  };

  getChildContext() {
    return {...this.props.context, store: this.state.store}
  }

  UNSAFE_componentWillMount(){
    const {fetch, nav} = this.props.context
    fetch.setErrorHook((error) => {
      message.error(error.message, 1)
    })
    fetch.injectAfter((rsp) => {
      console.log('after hook1', rsp)
      if (rsp.code === 40101) { // token 失效
        console.log(rsp.msg)
        nav.replace('/login')
      }
    })
    this.setState({
      store: new Store(fetch)
    })
  }
  componentDidMount(){
    this.state.store.resetStore()
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

export default App