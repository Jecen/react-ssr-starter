import React from 'react';
import Layout from 'components/Layout';
import Login from './login';

const title = 'Login Page';

function action() {
  return {
    chunks: ['login'],
    title,
    component: (
      <Layout>
        <Login />
      </Layout>
    ),
  };
}

export default action;