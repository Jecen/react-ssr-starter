const _ = {}

_.isDev = !process.argv.includes('--production')
_.isVerbose = process.argv.includes('--verbose')
_.isAnalyse = process.argv.includes('--analyze') || process.argv.includes('--analyse')

module.exports = _