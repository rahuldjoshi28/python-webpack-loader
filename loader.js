const parse = require("./parser");

module.exports = function pythonLoader(source) {
    const directoryPath = this.context;
    let sourceCopy = source.toString();
    const [globalCode, exports] = parse(sourceCopy, directoryPath);

    return `module.exports = (function() {
        ${globalCode}
        return ${exports}
    })()
    `;
};