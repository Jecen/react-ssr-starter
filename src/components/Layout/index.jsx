import React from "react";
import PropTypes from "prop-types";

class Layout extends React.PureComponent {
  render() {
    const { children } = this.props;
    return <div><p>Layout</p>{children}</div>;
  }
}

export default Layout;
