const { getIndentCount } = require('./helpers')
const isNewBlock = (statement) => {
  const blockStarts = [/def/, /if/, /else/, /for/, /while/]
  return blockStarts.some((expression) => expression.test(statement))
}

function extractBlock(rows, i, baseIndent) {
  const newBlock = [rows[i]]
  i++
  while (i < rows.length && getIndentCount(rows[i]) !== baseIndent) {
    newBlock.push(rows[i])
    i++
  }
  return [newBlock, i]
}

module.exports = {
  isNewBlock,
  extractBlock,
}
