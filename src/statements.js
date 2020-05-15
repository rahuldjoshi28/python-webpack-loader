const matchers = {
  assignment: (row) => /=/.test(row) && !/==/.test(row),
  import: (row) => /import/.test(row),
  function: (row) => /def/.test(row),
  if: (row) => /if/.test(row),
  for: (row) => /for/.test(row),
  class: (row) => /class/.test(row),
}

const to = {
  function: (statement) => {
    return statement
      .replace(/def/, 'const')
      .replace(')', ') =>')
      .replace('(', ' = (')
  },
  if: (statement) => {
    return statement.replace(/if/, 'if(').replace('{', ') {')
  },
  for: (statement) => {
    return statement.replace('for', 'for( let ').replace('{', '){')
  },
  assignment: (row, variables) => {
    const [variable, assignmentExpression] = row.split('=').map((v) => v.trim())
    const isNew = !variables[variable]

    let newVariable = {}

    if (isNew) {
      //TODO: Wont work if right side of expression contain some python specific operation eg 2 * [3, 2]
      newVariable = { name: variable, value: assignmentExpression }
    }
    return [
      `${isNew ? 'let' : ''} ${variable} = ${assignmentExpression}`,
      newVariable,
    ]
  },
}

module.exports = {
  matchers,
  to,
}
