import React from 'react'
import Login from './login'

const title = 'Login Page'

function action() {
  return {
    chunks: ['login'],
    title,
    component: (
      <Login />
    ),
  }
}

export default action