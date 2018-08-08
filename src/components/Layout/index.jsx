import React from "react";
import PropTypes from "prop-types";
import withStyles from "isomorphic-style-loader/lib/withStyles";

import { Layout, Menu, Breadcrumb } from "antd";

const { Header, Content, Footer } = Layout;

class LayoutWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {}
    }
  }
 
  static contextTypes = {
    nav: PropTypes.object,
    store: PropTypes.object,
  };

  componentDidMount() {
    const { store: { state: { user }}} = this.context
    this.setState({
      user
    })
  }

  render() {
    const { user = { name: 'no one' }} = this.state
    const { children } = this.props;
    return (
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={["2"]}
            style={{ lineHeight: "64px" }}>
            <Menu.Item key="1">nav 1</Menu.Item>
            <Menu.Item key="2">nav 2</Menu.Item>
            <Menu.Item key="3">nav 3</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©2016 Created by Ant UED {user.name}
        </Footer>
      </Layout>
    );
  }
}

export default LayoutWrapper; //withStyles(antdCss)(Layout);;
