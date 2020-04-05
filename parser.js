const fs = require('fs');
const path = require("path");

const INDENT_LENGTH = 4;

const nativeFunctionMappings = [
    {
        expression: /print/g,
        value: 'console.log'
    }
];

const getIndentCount = (line, indentLength) => {
    let count = 0;
    while (line[count] === ' ') count++;
    return count / indentLength;
};

const parseStatement = (currentDirectory, variables) => row => {
    if (!row) return "";
    const result = row.replace(':', ' {');
    if (/=/.test(row)) {
        const [variable, assignmentExpression] = row.split('=').map(v => v.trim());
        const isNew = !variables[variable];
        if (isNew) {
            //TODO: Wont work if right side of expression contain some python specific operation eg 2 * [3, 2]
            variables[variable] = assignmentExpression;
        }
        return `${isNew ? 'var' : ''} ${variable} = ${assignmentExpression}`
    }
    if (/import/.test(row)) {
        const moduleSource = fs.readFileSync(path.join(currentDirectory, `/${row.split(' ')[1]}.py`));
        const [globalCode, functions] = parse(moduleSource);
        // let resultCode = '' + globalCode;
        // Object.values(functions).forEach(fn => {
        //     resultCode += '\n' + fn
        // });
        return globalCode;
    }
    if (/def/.test(row)) {
        return result.replace(/def/, 'const')
            .replace(")", ') =>')
            .replace("(", ' = (');
    }
    if (/if/.test(row)) {
        return result.replace(/if/, 'if(').replace('{', ') {');
    }
    return result;
};

const toCodeString = codeArray => codeArray.join("\n").toString();

const parse = (jsSource, currentDirectory) => {
    let source = jsSource.toString();

    const rows = source.split('\n').map(row => {
        let result = row;
        nativeFunctionMappings.forEach(rule => {
            result = result.replace(rule.expression, rule.value)
        });
        return result;
    });

    const variables = [];
    const globalCode = [];
    const exportedFunctions = {};

    const createRow = parseStatement(currentDirectory, variables);

    let count = 0;
    let currentFunction;
    let currentIndent = 0;
    const functions = [];

    rows.forEach((row, i) => {
        const numberOfIndents = getIndentCount(row, INDENT_LENGTH);
        const parsedRow = createRow(row);

        if (numberOfIndents < currentIndent) {
            while (numberOfIndents !== currentIndent) {
                let endingBracket = `${String(' ').repeat(numberOfIndents * INDENT_LENGTH)}}\n`;
                globalCode.push(endingBracket);
                count++;
                currentIndent--;
            }
        }
        if (numberOfIndents === currentIndent) {
            if (/def/.test(row)) {
                currentFunction = row.substring(4, row.indexOf('(')).trim();
                functions.push(currentFunction);
            }
            globalCode.push(parsedRow);
            count++;
        }
        if (numberOfIndents === currentIndent + 1) {
            globalCode.push(parsedRow);
            count++;
            currentIndent++;
        }
    });

    while (currentIndent > 0) {
        globalCode.push(`${String(' ').repeat((currentIndent) * INDENT_LENGTH)}}\n`);
        currentIndent--;
    }

    return [toCodeString(globalCode), functions];
};

module.exports = parse;
