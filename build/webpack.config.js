import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import getConfig from './webpack.base'
import _ from './utils'
import WebpackAssetsManifest from 'webpack-assets-manifest'
import {
  BundleAnalyzerPlugin
} from 'webpack-bundle-analyzer';


const clientBase = getConfig('web')
const clientConfig = {
  ...clientBase,

  plugins: [
    ...clientBase.plugins,
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
    ...clientBase.optimization,
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
const serverBase = getConfig('node')
const serverConfig = {
  ...serverBase,

  output: {
    ...serverBase.output,
    libraryTarget: 'commonjs2',
  },

  // 外部扩展 利用clientConfig 打包出来的一部分资源
  externals: [
    './chunk-manifest.json',
    './asset-manifest.json',
    nodeExternals({
      whitelist: [_.test.style, _.test.image],
    }),
  ],

  plugins: [
    ...serverBase.plugins,
    new webpack.DefinePlugin({
      'process.env.BROWSER': false,
      __DEV__: _.isDev,
    }),

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