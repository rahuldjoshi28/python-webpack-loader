const transpile = require('./src/transpile')

module.exports = function pythonLoader(source) {
	const directoryPath = this.context
	const sourceCopy = source.toString()

	return transpile(sourceCopy, directoryPath)
}
