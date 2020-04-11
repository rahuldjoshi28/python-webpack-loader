const parse = require("./parser");
const inbuiltFunctions = require('./inbuiltFunctions');

const getInbuiltFunctions = () => `${Object.keys(inbuiltFunctions).map(fn => `const ${fn} = ${inbuiltFunctions[fn]}`).join('\n')}`;

module.exports = function pythonLoader(source) {
    const directoryPath = this.context;
    let sourceCopy = source.toString();
    const parsedSource = parse(sourceCopy, directoryPath);

    return `module.exports = (function() {
        ${getInbuiltFunctions()}
        return ${parsedSource}
    })()
    `;
};