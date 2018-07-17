import path from 'path';
import express from 'express';
// import browserSync from 'browser-sync';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import webpackConfig from '../webpack.config';
import run, {
  format
} from './run';
import clean from './clean';

import _ from '../utils'

// webpack watchOption
const watchOptions = {};

// 编译状态日志输出
function createCompilationPromise(name, compiler, config) {
  return new Promise((resolve, reject) => {
    let timeStart = new Date();
    compiler.hooks.compile.tap(name, () => {
      timeStart = new Date();
      console.info(`[${format(timeStart)}] Compiling '${name}'...`);
    });

    compiler.hooks.done.tap(name, stats => {
      console.info(stats.toString(config.stats));
      const timeEnd = new Date();
      const time = timeEnd.getTime() - timeStart.getTime();
      if (stats.hasErrors()) {
        console.info(`[${format(timeEnd)}] Failed to compile '${name}' after ${time} ms`);
        reject(new Error('Compilation failed!'));
      } else {
        console.info(`[${format(timeEnd)}] Finished '${name}' compilation after ${time} ms`);
        resolve(stats);
      }
    });
  });
}

let server;

async function start() {
  if (server) return server;
  server = express();
  server.use(errorOverlayMiddleware());
  server.use(express.static(path.resolve(__dirname, '../../dist')));

  const clientConfig = webpackConfig;
  clientConfig.entry.client = ['./build/tools/devClient']
    .concat(clientConfig.entry.client)
    .sort((a, b) => b.includes('polyfill') - a.includes('polyfill'));
  clientConfig.output.filename = clientConfig.output.filename.replace(
    'chunkhash',
    'hash',
  );
  clientConfig.output.chunkFilename = clientConfig.output.chunkFilename.replace(
    'chunkhash',
    'hash',
  );
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  await run(clean);
  const compiler = webpack(webpackConfig);

  const clientPromise = createCompilationPromise(
    'client',
    compiler,
    clientConfig,
  );

  server.use(
    webpackDevMiddleware(compiler, {
      publicPath: clientConfig.output.publicPath,
      logLevel: 'silent',
      watchOptions,
    }),
  );

  server.use(webpackHotMiddleware(compiler, { log: false }));

  await clientPromise;

  const timeStart = new Date();
  console.info(`[${format(timeStart)}] Launching server...`);

  const timeEnd = new Date();
  const time = timeEnd.getTime() - timeStart.getTime();
  console.info(`[${format(timeEnd)}] Server launched after ${time} ms`);
  return server;
}

export default start;
