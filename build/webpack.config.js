import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import _ from './utils'
import pkg from '../package.json'
import WebpackAssetsManifest from 'webpack-assets-manifest'
import {
  BundleAnalyzerPlugin
} from 'webpack-bundle-analyzer';

const testScript = /\.(js|jsx|mjs)$/;
const testStyle = /\.(css|less|styl|scss|sass|sss)$/;
const testImage = /\.(bmp|gif|jpg|jpeg|png|svg)$/;

const minimizeOpt = {
  discardComments: {
    removeAll: true
  }
}
const staticAssetName = _.isDev ?
  '[path][name].[ext]?[hash:8]' :
  '[hash:8].[ext]';

function overrideRules(rules, patch) {
  return rules.map(ruleToPatch => {
    let rule = patch(ruleToPatch);
    if (rule.rules) {
      rule = { ...rule,
        rules: overrideRules(rule.rules, patch)
      };
    }
    if (rule.oneOf) {
      rule = { ...rule,
        oneOf: overrideRules(rule.oneOf, patch)
      };
    }
    return rule;
  });
}

const config = {
  // 上下文
  context: path.resolve(__dirname, '..'),
  // 模式
  mode: _.isDev ? 'development' : 'production',
  // 输出
  output: {
    path: path.resolve(__dirname, '../dist/assets'),
    publicPath: '/assets/',
    pathinfo: _.isVerbose,
    filename: _.isDev ? '[name].js' : '[name].[chunkhash:8].js',
    chunkFilename: _.isDev ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  // 模块默认路径
  resolve: {
    modules: ['node_modules', 'src'],
    alias: {
      "src": path.resolve(__dirname, '../src'),
      "components": path.resolve(__dirname, '../src/components') 
    },
    extensions: [".js", ".json", ".jsx", ".css"],
  },

  module: {
    // Make missing exports an error instead of warning
    strictExportPresence: true,

    rules: [
      {
        test: testScript,
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../build'),
          path.resolve(__dirname, '../client'),
          path.resolve(__dirname, '../server')
        ],
        loader: 'babel-loader',
        options: {
          // https://github.com/babel/babel-loader#options
          cacheDirectory: _.isDev,

          // https://babeljs.io/docs/usage/options/
          babelrc: false,
          presets: [
            // A Babel preset that can automatically determine the Babel plugins and polyfills
            // https://github.com/babel/babel-preset-env
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: pkg.browserslist,
                },
                forceAllTransforms: !_.isDev, // for UglifyJS
                modules: false,
                useBuiltIns: false,
                debug: false,
              },
            ],
            // Experimental ECMAScript proposals
            // https://babeljs.io/docs/plugins/#presets-stage-x-experimental-presets-
            ['@babel/preset-stage-2', {
              decoratorsLegacy: true
            }],
            // Flow
            // https://github.com/babel/babel/tree/master/packages/babel-preset-flow
            '@babel/preset-flow',
            // JSX
            // https://github.com/babel/babel/tree/master/packages/babel-preset-react
            ['@babel/preset-react', {
              development: _.isDev
            }],
          ],
          plugins: [
            // Treat React JSX elements as value types and hoist them to the highest scope
            // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-constant-elements
            ...(_.isDev ? [] : ['@babel/transform-react-constant-elements']),
            // Replaces the React.createElement function with one that is more optimized for production
            // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-inline-elements
            ...(_.isDev ? [] : ['@babel/transform-react-inline-elements']),
            // Remove unnecessary React propTypes from the production build
            // https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types
            ...(_.isDev ? [] : ['transform-react-remove-prop-types']),
          ],
        },
      },
      {
        test: testStyle,
        rules: [
          // Convert CSS into JS module
          {
            issuer: {
              not: [testStyle]
            },
            use: 'style-loader',
          },

          // Process external/third-party styles
          {
            exclude: path.resolve(__dirname, '../src'),
            loader: 'css-loader',
            options: {
              sourceMap: _.isDev,
              minimize: _.isDev ? false : minimizeOpt,
            },
          },

          // Process internal/project styles (from src folder)
          {
            include: path.resolve(__dirname, '../src'),
            loader: 'css-loader',
            options: {
              // CSS Loader https://github.com/webpack/css-loader
              importLoaders: 2,
              sourceMap: _.isDev,
              // CSS Modules https://github.com/css-modules/css-modules
              modules: true,
              localIdentName: _.isDev ? '[name]-[local]-[hash:base64:5]' : '[hash:base64:5]',
              // CSS Nano http://cssnano.co/
              minimize: _.isDev ? false : minimizeOpt,
            },
          },

          // Apply PostCSS plugins including autoprefixer
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: './.postcssrc.js',
              },
            },
          },

          // Compile Sass to CSS
          // https://github.com/webpack-contrib/sass-loader
          {
            test: /\.(scss|sass)$/,
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: testImage,
        oneOf: [
          // Inline lightweight images into CSS
          {
            issuer: testScript,
            oneOf: [
              // Inline lightweight SVGs as UTF-8 encoded DataUrl string
              {
                test: /\.svg$/,
                loader: 'svg-url-loader',
                options: {
                  name: staticAssetName,
                  limit: 4096, // 4kb
                },
              },

              // Inline lightweight images as Base64 encoded DataUrl string
              {
                loader: 'url-loader',
                options: {
                  name: staticAssetName,
                  limit: 4096, // 4kb
                },
              },
            ],
          },

          // Or return public URL to image resource
          {
            loader: 'file-loader',
            options: {
              name: staticAssetName,
            },
          },
        ],
      },
      {
        test: /\.txt$/,
        loader: 'raw-loader',
      },
      {
        exclude: [testScript, testStyle, testImage, /\.json$/, /\.txt$/, path.resolve(__dirname, '../public')],
        loader: 'file-loader',
        options: {
          name: staticAssetName,
        },
      },

      // Exclude dev modules from production build
      ...(_.isDev ? [] : [{
        test: path.resolve(__dirname, '../node_modules/react-deep-force-update/lib/index.js'),
        loader: 'null-loader',
      }]),
    ],
  },
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
}

const clientConfig = {
  ...config,

  name: 'client',
  target: 'web',

  entry: {
    client: ['@babel/polyfill', './src/client.js'],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.BROWSER': true,
      __DEV__: _.isDev,
    }),

    new WebpackAssetsManifest({
      output: `${path.resolve(__dirname, '../dist')}/asset-manifest.json`,
      publicPath: true,
      writeToDisk: true,
      customize: ({
        key,
        value
      }) => {
        // You can prevent adding items to the manifest by returning false.
        if (key.toLowerCase().endsWith('.map')) return false;
        return {
          key,
          value
        };
      },
      done: (manifest, stats) => {
        // Write chunk-manifest.json.json
        const chunkFileName = `${path.resolve(__dirname, '../dist')}/chunk-manifest.json`;
        try {
          const fileFilter = file => !file.endsWith('.map');
          const addPath = file => manifest.getPublicPath(file);
          const chunkFiles = stats.compilation.chunkGroups.reduce((acc, c) => {
            acc[c.name] = [
              ...(acc[c.name] || []),
              ...c.chunks.reduce(
                (files, cc) => [
                  ...files,
                  ...cc.files.filter(fileFilter).map(addPath),
                ], [],
              ),
            ];
            return acc;
          }, Object.create(null));
          fs.writeFileSync(chunkFileName, JSON.stringify(chunkFiles, null, 2));
        } catch (err) {
          console.error(`ERROR: Cannot write ${chunkFileName}: `, err);
          if (!_.isDev) process.exit(1);
        }
      },
    }),

    ...(_.isDev ? [] : [
      // Webpack Bundle Analyzer
      // https://github.com/th0r/webpack-bundle-analyzer
      ...(_.isAnalyse ? [new BundleAnalyzerPlugin()] : []),
    ]),
  ],

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
    },
  },

  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  }
}

// 针对 node server 的打包操作
const serverConfig = {
  ...config,

  name: 'server',
  target: 'node',

  entry: {
    server: ['@babel/polyfill', path.resolve(__dirname, '../src/server.js')]
  },

  output: {
    ...config.output,
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    chunkFilename: 'chunks/[name].js',
    libraryTarget: 'commonjs2',
  },

  module: {
    ...config.module,

    rules: overrideRules(config.module.rules, rule => {
      // 修改babel 的target
      if (rule.loader === 'babel-loader') {
        return {
          ...rule,
          options: {
            ...rule.options,
            presets: rule.options.presets.map(
              preset =>
              preset[0] !== '@babel/preset-env' ?
              preset : [
                '@babel/preset-env',
                {
                  targets: {
                    node: pkg.engines.node.match(/(\d+\.?)+/)[0],
                  },
                  modules: false,
                  useBuiltIns: false,
                  debug: false,
                },
              ],
            ),
          },
        };
      }

      if (
        rule.loader === 'file-loader' ||
        rule.loader === 'url-loader' ||
        rule.loader === 'svg-url-loader'
      ) {
        return {
          ...rule,
          options: {
            ...rule.options,
            emitFile: false,
          },
        };
      }

      return rule
    })
  },
  // 外部扩展 利用clientConfig 打包出来的一部分资源
  externals: [
    './chunk-manifest.json',
    './asset-manifest.json',
    nodeExternals({
      whitelist: [testStyle, testImage],
    }),
  ],

  plugins: [
    // Define free variables
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      'process.env.BROWSER': false,
      __DEV__: _.isDev,
    }),

    // Adds a banner to the top of each generated chunk
    // https://webpack.js.org/plugins/banner-plugin/
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
  ],

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },
}

export default [clientConfig, serverConfig]