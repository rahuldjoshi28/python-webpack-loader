const transpile = require('./src/transpile')
const Terser = require('terser')

module.exports = function pythonLoader(source) {
	const directoryPath = this.context
	const sourceCopy = JSON.stringify(source.toString())
	const uglify = process.env.UGLIFY == 'true'
	let code = transpile(sourceCopy, directoryPath)

	if (uglify) {
		code = new Terser.minify(code).code
	}
	return code
}
