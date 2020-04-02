const fs = require('fs');
const path = require("path");

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
    const result = row.replace(':', ' {');
    if (/=/.test(row)) {
        const [variable, assignmentExpression] = row.split('=').map(v => v.trim());
        const isNew = !variables[variable];
        if (isNew) {
            //TODO: Wont work if right side of expression contain some python specific operation eg 2 * [3, 2]
            variables[variable] = assignmentExpression;
        }
        return `${isNew ? 'var' : ''} ${variable} = ${variables[variable]}`
    }
    if (/import/.test(row)) {
        const moduleSource = fs.readFileSync(path.join(currentDirectory, `/${row.split(' ')[1]}.py`));
        return parse(moduleSource);
    }
    if (/def/.test(row)) {
        return result.replace(/def/, 'function');
    }
    if (/if/.test(row)) {
        return result.replace(/if/, 'if(').replace('{', ') {');
    }
    return result;
};

const parse = (jsSource, currentDirectory) => {
    let source = jsSource.toString();
    const indentLength = 4;

    let currentIndent = 0;

    const blocks = [];
    const rows = source.split('\n').map(row => {
        let result = row;
        nativeFunctionMappings.forEach(rule => {
            result = result.replace(rule.expression, rule.value)
        });
        return result;
    });
    let count = 0;

    const variables = [];
    const createRow = parseStatement(currentDirectory, variables);

    rows.forEach((row, i) => {
        const numberOfIndents = getIndentCount(row, indentLength);
        if (numberOfIndents === currentIndent - 1) {
            blocks.push(`${String(' ').repeat(numberOfIndents * indentLength)}}\n`);
            count++;
            currentIndent--;
        }
        if (numberOfIndents === currentIndent) {
            blocks.push(createRow(row));
        }
        if (numberOfIndents === currentIndent + 1) {
            blocks[count - 1] = createRow(blocks[count - 1]);
            blocks.push(row);
            currentIndent++;
        }
        count++;
    });
    while (currentIndent > 0) {
        blocks.push(`${String(' ').repeat((currentIndent - 1) * indentLength)}}\n`);
        currentIndent--;
    }

    return blocks.join("\n").toString();
};

module.exports = parse;
