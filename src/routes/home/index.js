import React from 'react';
import Layout from 'components/Layout';
import Home from './home';

const title = 'Home Page';

function action() {
  return {
    chunks: ['home'],
    title,
    component: (
      <Layout>
        <Home />
      </Layout>
    ),
  };
}

export default action;