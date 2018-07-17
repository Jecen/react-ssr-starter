import React, { Component } from "react";
import Link from 'components/Link'

class Login extends Component {
  static defaultProps = {
  };

  static propTypes = {
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="page">
       <Link to={'/home'}>login</Link>
      </div>
    );
  }
}


export default Login