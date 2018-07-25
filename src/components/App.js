import React from 'react';
import PropTypes from 'prop-types';
import {message} from 'antd'

const ContextType = {
  insertCss: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  query: PropTypes.object,
  nav: PropTypes.object,
  fetch: PropTypes.object,
};

class App extends React.PureComponent {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    children: PropTypes.element.isRequired,
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  componentWillMount(){
    const {fetch} = this.props.context
    fetch.setErrorHook((error) => {
      message.error(error.message, 1)
    })
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

export default App;