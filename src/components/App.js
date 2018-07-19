import React from 'react';
import PropTypes from 'prop-types';

class App extends React.PureComponent {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    children: PropTypes.element.isRequired,
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    query: PropTypes.object,
  };

  getChildContext() {
    return this.props.context;
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

export default App;