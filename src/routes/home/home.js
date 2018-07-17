import React, { Component } from "react";
import Link from 'components/Link'

class Home extends Component {
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
        <Link to={'/login'}>logout</Link>
      </div>
    );
  }
}


export default Home