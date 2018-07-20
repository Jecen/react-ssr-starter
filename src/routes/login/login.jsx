import React, { Component } from "react";
import { Button, message } from "antd";
import PropTypes from "prop-types";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static contextTypes = {
    nav: PropTypes.object,
    fetch: PropTypes.func
  };

  static defaultProps = {};

  static propTypes = {};

  handleClick = async () => {
    const { nav, fetch } = this.context;
    try {
      const rst = await fetch("/api/login.action", {
        body: JSON.stringify({
          username: "lfwdlx0@xhqsg",
          password: "11111111"
        })
      });
      const data = await rst.json()
      const { success, user, token, msg } = data;
      if (success) {
        message.success("登录成功");
        nav.push("/home");
        // TODO add user Info to state
      } else {
        message.error(msg);
      }
      console.log(rst);
    } catch (error) {
      console.log(error);
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
