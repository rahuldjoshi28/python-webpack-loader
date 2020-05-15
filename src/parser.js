const { convertToClassMethod, parseClassInstantiation } = require('./class')
const {
  getIndentCount,
  extractBlockName,
  exportFunction,
  toCodeString,
  fileContent,
} = require('./helpers')
const { isNewBlock } = require('./block')
const { nativeFunctionMappings } = require('./mappings')
const { matchers, to } = require('./statements')

const INDENT_LENGTH = 4

const parseStatement = (currentDirectory, variables) => (row) => {
  if (!row) return ''
  const result = row.replace(':', ' {')

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

const globalClasses = []
const parseBlock = (block, currentDirectory) => {
  const variables = []
  const createRow = parseStatement(currentDirectory, variables)
  const code = []

  let i = 0

  while (i < block.length) {
    const row = block[i]
    const numberOfIndents = getIndentCount(row, INDENT_LENGTH)
    if (isNewBlock(row)) {
      code.push(createRow(row) + '\n')
      const newBlocks = []
      i++
      if (i === block.length) {
        break
      }
      while (
        i !== block.length &&
        getIndentCount(block[i], INDENT_LENGTH) !== numberOfIndents
      ) {
        newBlocks.push(block[i])
        i++
      }
      code.push(...parseBlock(newBlocks, currentDirectory))
      code.push('\n}\n')
    } else {
      if (matchers.import(row)) {
        const [codeText, moduleClassList] = createRow(row)
        code.push(codeText)
        globalClasses.push(...moduleClassList)
        i += code.length
      } else {
        code.push(createRow(row))
        i++
      }
    }
  }
  return code
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

function extractBlock(rows, i, baseIndent) {
  const newBlock = [rows[i]]
  i++
  while (
    i < rows.length &&
    getIndentCount(rows[i], INDENT_LENGTH) !== baseIndent
  ) {
    newBlock.push(rows[i])
    i++
  }
  return [newBlock, i]
}

const parse = (jsSource, currentDirectory) => {
  let source = jsSource.toString()

  const rows = source.split('\n').map((row) => {
    let result = row
    nativeFunctionMappings.forEach((rule) => {
      result = result.replace(rule.expression, rule.value)
    })
    return result
  })

  const functions = []
  const classes = []
  const parsedBlocks = []
  const globalCode = []

  let i = 0
  while (i < rows.length) {
    const statementType = matchers.function(rows[i])
      ? 'function'
      : matchers.class(rows[i])
      ? 'class'
      : 'default'
    if (statementType === 'function') {
      functions.push(extractBlockName(rows[i], statementType))
      const [newBlock, _i] = extractBlock(rows, i, 0)
      i = _i
      const parsedCode = parseBlock(newBlock, currentDirectory)
      parsedBlocks.push(...parsedCode)
    } else if (statementType === 'class') {
      classes.push(extractBlockName(rows[i], statementType))
      const [newBlock, _i] = extractBlock(rows, i, 0)
      i = _i
      const parsedCode = parseClass(newBlock)
      parsedBlocks.push(...parsedCode)
    } else {
      globalCode.push(rows[i])
      i++
    }
  }
  const parsedCode = parseBlock(globalCode, currentDirectory)

  const classList = [...classes, ...globalClasses]
  const code = [
    ...parseClassInstantiation(parsedCode, classList),
    ...parseClassInstantiation(parsedBlocks, classList),
  ]

  const codeText = `(function() {
        ${toCodeString(code)}
        return ${exportFunction([...functions, ...classes])}
    })()`

  return {
    codeText,
    classes,
    functions,
  }
}

module.exports = parse
