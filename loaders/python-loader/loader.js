const parse = require("./parser");

module.exports = function pythonLoader(source) {
    let sourceCopy = source.toString();
    const result = parse(sourceCopy);
    return `module.exports = (args) => { (${result})(args) }`;
};