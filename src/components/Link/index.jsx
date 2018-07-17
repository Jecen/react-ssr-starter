import React, { Component } from "react";
import PropTypes from "prop-types";
import history from "src/history";

class Link extends Component {
  static defaultProps = {
    to: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func
  };

  static defaultProps = {
    onClick: null
  };

  handleClick = evt => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }

    if (event.defaultPrevented === true) {
      return;
    }

    evt.preventDefault();
    history.push(this.props.to);
  };

  render() {
    const { to, children, ...props } = this.props;
    return (
      <a href={to} {...props} onClick={this.handleClick}>
        {children}
      </a>
    );
  }
}

export default Link;
