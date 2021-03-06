import clean from './clean'
import copy from './copy'
import run from './run'
import buildClient from './build-client'
import buildServer from './build-server'

async function build() {
  const isServer = process.argv.includes('--server')
  const buildFun = isServer ? buildServer : buildClient
  await run(clean)
  isServer && await run(copy)
  await run(buildFun)
}
export default build