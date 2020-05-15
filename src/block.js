const isNewBlock = (statement) => {
  const blockStarts = [/def/, /if/, /else/, /for/, /while/]
  return blockStarts.some((expression) => expression.test(statement))
}

module.exports = {
  isNewBlock,
}
