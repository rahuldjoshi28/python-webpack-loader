const functionExport = (globalCode, functionsToExport) => {
  return `(function() {
        ${globalCode}
        return ${functionsToExport}
    })()`
}

module.exports = {
  module: functionExport,
}
