
import React from 'react'
import ReactDOM from 'react-dom'
import App from 'components/App.js'
import 'whatwg-fetch'
import Http, { httpConfig } from 'src/http'
import history from 'src/history'

describe('App', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    const httpClient = Http(fetch, { ...httpConfig })
    const context = {
      insertCss: (...styles) => {
        const removeCss = styles.map(x => x._insertCss())
        return () => {
          removeCss.forEach(f => f())
        }
      },
      fetch: httpClient,
      nav: history,
      pathname: '/test'
    }
    ReactDOM.render(<App context={context} ><span>aaa</span></App>, div)
  })
})