const matchers = {
  assignment: (row) => /=/.test(row) && !/==/.test(row),
  import: (row) => /import/.test(row),
  function: (row) => /def/.test(row),
  if: row => /if/.test(row),
  for: row => /for/.test(row),
  class: row => /class/.test(row),
}

module.exports = {
  matchers,
}
