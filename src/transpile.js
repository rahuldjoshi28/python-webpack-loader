const inbuiltFunctions = require('./inbuiltFunctions')
const parse = require('./parser')

const getInbuiltFunctions = () =>
  `${Object.keys(inbuiltFunctions)
    .map((fn) => `const ${fn} = ${inbuiltFunctions[fn]}`)
    .join('\n')}`

function transpile(sourceCopy, directoryPath) {
  const { codeText } = parse(sourceCopy, directoryPath)

  return `module.exports = (function() {
        ${getInbuiltFunctions()}
        return ${codeText}
    })()
    `
}

module.exports = transpile
