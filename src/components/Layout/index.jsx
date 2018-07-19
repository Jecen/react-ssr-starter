import React from "react";
import PropTypes from "prop-types";
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import antdCss from 'antd/lib/style/index.css'
class Layout extends React.PureComponent {
  render() {
    const { children } = this.props;
    return <div><p>Layout</p>{children}</div>;
  }
}

export default Layout //withStyles(antdCss)(Layout);;
