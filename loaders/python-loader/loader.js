const parse = require("./parser");

module.exports = function pythonLoader(source) {
    const directoryPath = this.context;
    let sourceCopy = source.toString();
    const result = parse(sourceCopy, directoryPath);
    console.log(result);
    return `module.exports = (args) => { (${result})(args) }`;
};