const fs = require('fs')
const path = require('path')

const INDENT_LENGTH = 4

const toCodeString = (codeArray) => codeArray.join('\n').toString()

const exportFunction = (functions) =>
	`{ ${functions.map((fn) => fn).join(',')} }`

const extractBlockName = (statement, type) => {
	if (type === 'function') {
		return statement.substring(4, statement.indexOf('(')).trim()
	}
	return statement.substring(6, statement.indexOf(':')).trim()
}

const getIndentCount = (line) => {
	let count = 0
	while (line[count] === ' ') count++
	return count / INDENT_LENGTH
}

const fileContent = (moduleName, currentDirectory) =>
	fs.readFileSync(path.join(currentDirectory, `/${moduleName}.py`)).toString()

module.exports = {
	toCodeString,
	exportFunction,
	extractBlockName,
	getIndentCount,
	fileContent,
}
