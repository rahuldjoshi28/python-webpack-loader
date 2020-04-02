const parse = require("./parser");

module.exports = function pythonLoader(source) {
    const directoryPath = this.context;
    let sourceCopy = source.toString();
    const [globalCode, functions] = parse(sourceCopy, directoryPath);
    const functionString = `{
        ${Object.keys(functions).map(fn => `${fn}: ${functions[fn]}`).join(',\n').toString()}
    }`;

    const result = `module.exports = (function() {
        ${globalCode}
        return ${functionString}
    })()
    `;
    return result;
};