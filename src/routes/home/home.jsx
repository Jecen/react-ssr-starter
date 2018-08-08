import React, { Component } from "react";
import { Button } from "antd";
import PropTypes from "prop-types";

class Home extends Component {
  static contextTypes = {
    nav: PropTypes.object,
    store: PropTypes.any,
  };
  static defaultProps = {};

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleClick = () => {
    const {store:{logout}} = this.context
    logout()
  };

  render() {
    return (
      <div className="page">
        <Button onClick={this.handleClick}>Logout</Button>
      </div>
    );
  }
}

export default Home;
