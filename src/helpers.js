const toCodeString = (codeArray) => codeArray.join('\n').toString()

const exportFunction = (functions) =>
  `{ ${functions.map((fn) => fn).join(',')} }`

const extractBlockName = (statement, type) => {
  if (type === 'function') {
    return statement.substring(4, statement.indexOf('(')).trim()
  }
  return statement.substring(6, statement.indexOf(':')).trim()
}

const getIndentCount = (line, indentLength) => {
  let count = 0
  while (line[count] === ' ') count++
  return count / indentLength
}

module.exports = {
  toCodeString,
  exportFunction,
  extractBlockName,
  getIndentCount,
}
