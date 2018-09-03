import webpackConfig from '../webpack.config'
import webpack from 'webpack'
import pkg from '../../package.json'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

function buildClient() {
  const [clientConfig] = webpackConfig
  return new Promise((resolve, reject) => {
    const config = {
      ...clientConfig,
      output: {
        ...clientConfig.output,
      },
      plugins: [
        ...clientConfig.plugins,
        new HtmlWebpackPlugin({
          title: pkg.description,
          inject: true,
          filename: '../index.html',
          favicon: path.resolve(__dirname, '../../public/favicon.ico'),
          template: path.resolve(__dirname, '../../public/tpl.html')
        })
      ]
    }
    webpack(config).run((err, stats) => {
      if (err) {
        return reject(err)
      }
      console.info(stats.toString(config.stats))
      if (stats.hasErrors()) {
        return reject(new Error('Webpack compilation errors'))
      }
      return resolve()
    })
  })
}

export default buildClient