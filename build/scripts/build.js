import webpackConfig from '../webpack.config'
import webpack from 'webpack'
import pkg from '../../package.json'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import clean from './clean'
import copy from './copy'
import run from './run'

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
          template: path.resolve(__dirname, '../../public/index.html')
        })
      ]
    }
    webpack(config).run((err, stats) => {
      if (err) {
        return reject(err);
      }
      console.info(stats.toString(config.stats));
      if (stats.hasErrors()) {
        return reject(new Error('Webpack compilation errors'));
      }
      return resolve();
    });
  })
}

function buildServer() {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        return reject(err);
      }
      console.info(stats.toString(webpackConfig[1].stats));
      if (stats.hasErrors()) {
        return reject(new Error('Webpack compilation errors'));
      }
      return resolve();
    });
  })
}


async function build() {
  const isServer = process.argv.includes('--server')
  await run(clean);
  isServer && await run(copy);

  return isServer ? buildServer() : buildClient()
}

export default build;