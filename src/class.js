const { parseBlock } = require('./parser')
const { extractBlock } = require('./block')
const { matchers } = require('./statements')

const convertToClassMethod = (fn) => {
  let firstLine = fn[0]
  const args = firstLine.substring(
    firstLine.indexOf('(') + 1,
    firstLine.indexOf(')')
  )
  const [ref, ...rest] = args.split(',')
  fn[0] = firstLine.replace(args, rest.join(', ')).replace('const', '')
  return fn.map((line) =>
    ref !== '' ? line.replace(new RegExp(ref, 'g'), 'this') : line
  )
}

const parseClassInstantiation = (code, classes) => {
  return code.map((line) => {
    let parsedLine = line
    classes.forEach((className) => {
      // TODO: Doesnot work for exported classes as it uses moduleName.ClassName() to instantiate.
      parsedLine = parsedLine.replace(`${className}(`, `new ${className}(`)
    })
    return parsedLine
  })
}

module.exports = {
  convertToClassMethod,
  parseClassInstantiation,
}
