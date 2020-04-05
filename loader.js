const parse = require("./parser");

module.exports = function pythonLoader(source) {
    const directoryPath = this.context;
    let sourceCopy = source.toString();
    const [globalCode, functions] = parse(sourceCopy, directoryPath);
    const functionString = `{
        ${functions.map(fn => `${fn}: ${fn}`).join(',\n').toString()}
    }`;

    return `module.exports = (function() {
        ${globalCode}
        return ${functionString}
    })()
    `;
};