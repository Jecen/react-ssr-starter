

import path from 'path'
import chokidar from 'chokidar'
import { writeFile, copyFile, makeDir, cleanDir } from '../tools/fs'
import pkg from '../../package.json'
import { format } from './run'

async function copy() {
  await makeDir('dist')
  await Promise.all([
    writeFile(
      'dist/package.json',
      JSON.stringify(
        {
          private: true,
          engines: pkg.engines,
          dependencies: pkg.dependencies,
          scripts: {
            start: 'node server.js',
          },
        },
        null,
        2,
      ),
    ),
    copyFile('yarn.lock', 'dist/yarn.lock'),
    copyFile('public/favicon.ico', 'dist/favicon.ico'),
  ])

  if (process.argv.includes('--watch')) {
    const watcher = chokidar.watch(['public/**/*'], { ignoreInitial: true })

    watcher.on('all', async (event, filePath) => {
      const start = new Date()
      const src = path.relative('./', filePath)
      const dist = path.join(
        'dist/',
        src.startsWith('src') ? path.relative('src', src) : src,
      )
      switch (event) {
      case 'add':
      case 'change':
        await makeDir(path.dirname(dist))
        await copyFile(filePath, dist)
        break
      case 'unlink':
      case 'unlinkDir':
        cleanDir(dist, { nosort: true, dot: true })
        break
      default:
        return
      }
      const end = new Date()
      const time = end.getTime() - start.getTime()
      console.info(`[${format(end)}] ${event} '${dist}' after ${time} ms`)
    })
  }
}

export default copy
