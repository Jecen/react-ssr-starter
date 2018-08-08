import path from 'path';
import webpack from 'webpack';
import HappyPackPlugins from './happypack.config';
import _ from './utils'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'

const staticAssetName = _.isDev ?
  '[path][name].[ext]?[hash:8]' :
  '[hash:8].[ext]';

/**
 * 根据target返回基本配置
 * @param {string} target 构建目标['web','server'] 
 */
const config = (target) => {
  const isWeb = target === 'web'
  const hashTpl = '[chunkhash:8]'

  return {
    // config Name
    name: isWeb ? 'client' : 'server',
    // 构建目标
    target,
    // 上下文
    context: _.resolvePath('..'),
    // 入口
    entry: isWeb ? {
      client: ['@babel/polyfill', _.resolvePath('../src/client.js')],
    } : {
      server: ['@babel/polyfill', _.resolvePath('../src/server.js')]
    },
    // 模式
    mode: _.isDev ? 'development' : 'production',
    // 输出
    output: {
      path: isWeb ? _.resolvePath('../dist/assets') : _.resolvePath('../dist'),
      publicPath: '/assets/',
      filename: isWeb ? `[name].${_.isDev ? '' : `${hashTpl}.`}.js` : '[name].js',
      chunkFilename: isWeb ? `[name].${_.isDev ? '' : `${hashTpl}.`}chunk.js` : 'chunks/[name].js',
      pathinfo: _.isVerbose,
      devtoolModuleFilenameTemplate: info =>
        path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    // 模块默认路径
    resolve: {
      modules: ['node_modules', 'src'],
      alias: {
        "src": _.resolvePath('../src'),
        "components": _.resolvePath('../src/components')
      },
      extensions: [".js", ".json", ".jsx", ".css"],
    },

    module: {
      strictExportPresence: true,
      rules: [{
          test: _.test.script,
          include: [
            _.resolvePath('../src'),
            _.resolvePath('../build'),
          ],
          loader: `happypack/loader?id=${isWeb? 'js' : 'nodejs'}`,
        },
        {
          test: /\.css$/,
          include: [/node_modules\/.*antd/],
          loader: 'happypack/loader?id=antd-style',
        },
        {
          test: _.test.style,
          exclude: [_.resolvePath('../src'), /node_modules\/.*antd/],
          include: _.resolvePath('../src/assets'),
          issuer: {
            not: [_.test.style]
          },
          loader: 'happypack/loader?id=external-style',
        },
        {
          test: _.test.style,
          include: _.resolvePath('../src'),
          exclude: [/node_modules\/.*antd/],
          issuer: {
            not: [_.test.style]
          },
          loader: 'happypack/loader?id=style',
        },
        {
          test: _.test.image,
          oneOf: [
            {
              issuer: _.test.script,
              oneOf: [
                {
                  test: /\.svg$/,
                  loader: 'svg-url-loader',
                  options: {
                    name: staticAssetName,
                    limit: 4096, // 4kb
                    emitFile: isWeb,
                  },
                },
                {
                  loader: 'url-loader',
                  options: {
                    name: staticAssetName,
                    limit: 4096, // 4kb
                    emitFile: isWeb,
                  },
                },
              ],
            },
            {
              loader: 'file-loader',
              options: {
                name: staticAssetName,
                emitFile: isWeb,
              },
            },
          ],
        },
        {
          test: /\.txt$/,
          loader: 'raw-loader',
        },
        {
          exclude: [_.test.script, _.test.style, _.test.image, /\.json$/, /\.txt$/, _.resolvePath('../public')],
          loader: 'file-loader',
          options: {
            name: staticAssetName,
            emitFile: isWeb,
          },
        },
        ...(_.isDev ? [] : [{
          test: _.resolvePath('../node_modules/react-deep-force-update/lib/index.js'),
          loader: 'null-loader',
        }]),
      ],
    },
    plugins: [
      ...HappyPackPlugins,
    ],
    // 在第一个错误出错时抛出，而不是无视错误。
    bail: !_.isDev,
    // 缓存
    cache: _.isDev,
    // 统计信息
    stats: {
      cached: _.isVerbose,
      cachedAssets: _.isVerbose,
      chunks: _.isVerbose,
      chunkModules: _.isVerbose,
      colors: true,
      hash: _.isVerbose,
      modules: _.isVerbose,
      reasons: _.isDev,
      timings: true,
      version: _.isVerbose,
    },

    devtool: _.isDev ? 'cheap-module-inline-source-map' : 'source-map',

    optimization: {
      minimizer: [
        new UglifyJSPlugin({
          cache: true,
          parallel: true,
          sourceMap: _.isDev, // set to true if you want JS source maps
          uglifyOptions: {
            compress: {
              drop_console: !_.isDev
            }
          }
        })
      ],
    },
  }
}



export default config