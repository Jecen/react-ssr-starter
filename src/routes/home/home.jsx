import React, { Component } from "react";
import { Button } from "antd";
import PropTypes from "prop-types";

class Home extends Component {
  static contextTypes = {
    nav: PropTypes.object
  };
  static defaultProps = {};

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleClick = () => {
    this.context.nav.push("/login");

    console.log(this.context.nav);
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
