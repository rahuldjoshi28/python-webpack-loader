const ruleMappings = [
    {
        expression: /print/g,
        value: 'console.log'
    }
];

module.exports = function pythonLoader(source) {
    let sourceCopy = source.toString();
    ruleMappings.forEach(rule => {
        sourceCopy = sourceCopy.replace(rule.expression, rule.value);
    });
    console.log({sourceCopy});
    return `module.exports = () => { ${sourceCopy} }`;
};