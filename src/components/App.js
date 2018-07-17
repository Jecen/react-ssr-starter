import React from 'react';
import PropTypes from 'prop-types';

class App extends React.PureComponent {
  
  render() {
    return React.Children.only(this.props.children)
  }
}

export default App;