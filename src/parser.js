const { convertToClassMethod, parseClassInstantiation } = require('./class')
const {
	getIndentCount,
	extractBlockName,
	exportFunction,
	toCodeString,
	fileContent,
} = require('./helpers')
const { isNewBlock, extractBlock } = require('./block')
const { replaceNativeFunctions } = require('./mappings')
const { matchers, to } = require('./statements')
const templates = require('./templates')

const parseStatement = (currentDirectory, variables) => (row) => {
	if (!row) return ''
	const result = row

	if (matchers.assignment(row)) {
		const [statement, newVariable] = to.assignment(row, variables)
		if (newVariable.name) {
			variables[newVariable.name] = newVariable.value
		}
		return statement
	}
	if (matchers.import(row)) {
		const moduleName = row.split(' ')[1]
		const moduleSource = fileContent(moduleName, currentDirectory)
		const { codeText, classes } = parse(moduleSource, currentDirectory)
		return [
			`const ${moduleName} = ${codeText}`,
			classes.map((clsNm) => `${moduleName}.${clsNm}`),
		]
	}
	if (matchers.function(row)) {
		return to.function(result)
	}
	if (matchers.if(row)) {
		return to.if(result)
	}
	if (matchers.for(row)) {
		return to.for(result)
	}
	return result
}

const parseClass = (code) => {
	const blocks = []
	const [className, ...restCode] = code

	blocks.push(className.replace(':', ' {\n'))

	let i = 0
	while (i < restCode.length) {
		if (matchers.function(restCode[i])) {
			const [block, _i] = extractBlock(restCode, i, 1)
			i = _i
			const parsedBlock = parseBlock(block)
			blocks.push(...convertToClassMethod(parsedBlock))
		}
	}
	blocks.push('\n}\n')
	return blocks
}

const globalClasses = []
const parseBlock = (block, currentDirectory) => {
	const variables = []
	const createRow = parseStatement(currentDirectory, variables)
	const code = []

	let i = 0
	while (i < block.length) {
		const row = block[i]
		const numberOfIndents = getIndentCount(row)
		if (isNewBlock(row)) {
			code.push(createRow(row) + '\n')

			const [[_, ...newBlock], _i] = extractBlock(block, i, numberOfIndents)
			i = _i

			code.push(...parseBlock(newBlock, currentDirectory))
			code.push('\n}\n')
		} else if (matchers.import(row)) {
			const [codeText, moduleClassList] = createRow(row)

			code.push(codeText)
			globalClasses.push(...moduleClassList)
			i += code.length
		} else {
			code.push(createRow(row))
			i++
		}
	}
	return code
}

const parse = (jsSource, currentDirectory) => {
	let source = jsSource.toString()

	const rows = replaceNativeFunctions(source.split('\n'))

	const functions = []
	const classes = []
	const parsedBlocks = []
	const globalCode = []

	let i = 0
	while (i < rows.length) {
		const currentRow = rows[i]
		if (matchers.function(currentRow)) {
			functions.push(extractBlockName(currentRow, 'function'))
			const [newBlock, _i] = extractBlock(rows, i, 0)
			i = _i
			const parsedCode = parseBlock(newBlock, currentDirectory)
			parsedBlocks.push(...parsedCode)
		} else if (matchers.class(currentRow)) {
			classes.push(extractBlockName(currentRow, 'class'))
			const [newBlock, _i] = extractBlock(rows, i, 0)
			i = _i
			const parsedCode = parseClass(newBlock)
			parsedBlocks.push(...parsedCode)
		} else {
			globalCode.push(currentRow)
			i++
		}
	}

	const parsedCode = [
		...parseBlock(globalCode, currentDirectory),
		...parsedBlocks,
	]
	const classList = [...classes, ...globalClasses]

	const code = parseClassInstantiation(parsedCode, classList)

	const codeText = templates.module(
		toCodeString(code),
		exportFunction([...functions, ...classes])
	)

	return { codeText, classes }
}

module.exports = { parse, parseBlock }
