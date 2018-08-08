import HappyPack from 'happypack';
import _ from './utils'
import pkg from '../package.json'
import path from 'path'

const happyThreadPool = HappyPack.ThreadPool({
  size: 5
})

const testStyle = /\.(css|less|styl|scss|sass|sss)$/;
const minimizeOpt = {
  discardComments: {
    removeAll: true
  }
}

const getBabelOption = (target) => {
  const babelPlugins = [
    ...(_.isDev ? [] : ['@babel/transform-react-constant-elements']),
    ...(_.isDev ? [] : ['@babel/transform-react-inline-elements']),
    ...(_.isDev ? [] : ['transform-react-remove-prop-types']),
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose" : true }]

  ]
  if (target === 'web') {
    babelPlugins.push(["import", {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": "css"
    }])
  }
  return {
    cacheDirectory: _.isDev,
    babelrc: false,
    presets: [
      [
        '@babel/preset-env',
        target === 'web' ? {
          targets: {
            browsers: pkg.browserslist,
          },
          forceAllTransforms: !_.isDev, // for UglifyJS
          modules: false,
          useBuiltIns: false,
          debug: false,
        } : {
          targets: {
            node: pkg.engines.node.match(/(\d+\.?)+/)[0],
          },
          modules: false,
          useBuiltIns: false,
          debug: false,
        },
      ],
      ['@babel/preset-stage-2', {
        decoratorsLegacy: true
      }],
      '@babel/preset-flow', ['@babel/preset-react', {
        development: _.isDev
      }],
    ],
    plugins: babelPlugins,
  }
}

export default [
  new HappyPack({
    id: 'js',
    threadPool: happyThreadPool,
    loaders: [{
      loader: 'babel-loader',
      options: getBabelOption('web'),
    }]
  }),
  new HappyPack({
    id: 'nodejs',
    threadPool: happyThreadPool,
    loaders: [{
      loader: 'babel-loader',
      options: getBabelOption('node'),
    }]
  }),
  new HappyPack({
    id: 'external-style',
    threadPool: happyThreadPool,
    loaders: ['isomorphic-style-loader',
      {
        loader: 'css-loader',
        options: {
          sourceMap: _.isDev,
          minimize: _.isDev ? false : minimizeOpt,
        },
      }
    ]
  }),
  new HappyPack({
    id: 'style',
    threadPool: happyThreadPool,
    loaders: [
      'isomorphic-style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 2,
          sourceMap: _.isDev,
          modules: true,
          localIdentName: _.isDev ? '[name]-[local]-[hash:base64:5]' : '[hash:base64:5]',
          minimize: _.isDev ? false : minimizeOpt,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          config: {
            path: './.postcssrc.js',
          },
        },
      },
      {
        loader: 'sass-loader',
      },
    ]
  }),
  new HappyPack({
    id: 'antd-style',
    threadPool: happyThreadPool,
    loaders: [
      'style-loader',
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          config: {
            path: './postcssrc.js',
          },
        },
      },
    ]
  })
]