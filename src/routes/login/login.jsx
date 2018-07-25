import React, { Component } from "react";
import { Button, message } from "antd";
import PropTypes from "prop-types";
import tFetch from 'src/http'

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static contextTypes = {
    nav: PropTypes.object,
    fetch: PropTypes.object
  };

  static defaultProps = {};

  static propTypes = {};

  handleClick = async () => {
    const { nav, fetch } = this.context;
    try {
      const rst = await fetch.post("/api/login.action", {
        username: "lfwdlx0@xhqsg",
        password: "11111111"
      });
      console.log('login page get rst!!', rst)
    } catch (error) {
      console.log('login page get error!!', error);
    }
  };

  render() {
    return (
      <div className="page">
        <Button onClick={this.handleClick}>Login</Button>
      </div>
    );
  }
}

export default Login;
