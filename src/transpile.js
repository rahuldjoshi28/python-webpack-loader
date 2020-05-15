const inbuiltFunctions = require('./inbuiltFunctions')
const templates = require('./templates')
const parse = require('./parser')

const getInbuiltFunctions = () =>
  `${Object.keys(inbuiltFunctions)
    .map((fn) => `const ${fn} = ${inbuiltFunctions[fn]}`)
    .join('\n')}`

function transpile(sourceCopy, directoryPath) {
  const { codeText } = parse(sourceCopy, directoryPath)
  const moduleToExport = templates.module(getInbuiltFunctions(), codeText)
  return `module.exports = ${moduleToExport}`
}

module.exports = transpile
