import webpackConfig from '../webpack.config'
import webpack from 'webpack'

function buildServer() {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        return reject(err)
      }
      console.info(stats.toString(webpackConfig[1].stats))
      if (stats.hasErrors()) {
        return reject(new Error('Webpack compilation errors'))
      }
      return resolve()
    })
  })
}

export default buildServer