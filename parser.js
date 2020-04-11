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

const exportFunction = functions => `{ ${functions.map(fn => fn).join(',')} }`;

const parseStatement = (currentDirectory, variables) => row => {
    if (!row) return "";
    const result = row.replace(':', ' {');
    if (/=/.test(row) && !/==/.test(row)) {
        const [variable, assignmentExpression] = row.split('=').map(v => v.trim());
        const isNew = !variables[variable];
        if (isNew) {
            //TODO: Wont work if right side of expression contain some python specific operation eg 2 * [3, 2]
            variables[variable] = assignmentExpression;
        }
        return `${isNew ? 'let' : ''} ${variable} = ${assignmentExpression}`
    }
    if (/import/.test(row)) {
        const moduleName = row.split(' ')[1];

        const moduleSource = fs.readFileSync(path.join(currentDirectory, `/${moduleName}.py`)).toString();
        const parsedModule = parse(moduleSource, currentDirectory);

        return `const ${moduleName} = ${parsedModule}`;
    }
    if (/def/.test(row)) {
        return result.replace(/def/, 'const')
            .replace(")", ') =>')
            .replace("(", ' = (');
    }
    if (/if/.test(row)) {
        return result.replace(/if/, 'if(').replace('{', ') {');
    }
    if (/for/.test(row)) {
        return result.replace('for', 'for( let ').replace('{', '){');
    }
    return result;
};

const isNewBlock = statement => {
    const blockStarts = [/def/, /if/, /else/, /for/, /while/];
    return blockStarts.some(expression => expression.test(statement))
};

const toCodeString = codeArray => codeArray.join("\n").toString();

const  parseBlock = (block, currentDirectory) => {
    const variables = [];
    const createRow = parseStatement(currentDirectory, variables);
    const code = [];

    let i = 0;

    while(i < block.length) {
        const row = block[i];
        const numberOfIndents = getIndentCount(row, INDENT_LENGTH);
        if (isNewBlock(row)) {
            code.push(createRow(row) + "\n");
            const newBlocks = [];
            i++;
            if (i === block.length) {break;}
            while (i !== block.length && getIndentCount(block[i], INDENT_LENGTH) !== numberOfIndents) {
                newBlocks.push(block[i]);
                i++;
            }
            code.push(...parseBlock(newBlocks, currentDirectory));
            code.push('\n}\n');
        }
        else {
            code.push(createRow(row));
            i++;
        }
    }
    return code;
};

const extractFunctionName = statement => statement.substring(4, statement.indexOf('(')).trim();

const parse = (jsSource, currentDirectory) => {
    let source = jsSource.toString();

    const rows = source.split('\n').map(row => {
        let result = row;
        nativeFunctionMappings.forEach(rule => {
            result = result.replace(rule.expression, rule.value)
        });
        return result;
    });

    const exportedBlocks = [];
    const parsedBlocks = [];
    const globalCode = [];

    let i = 0;
    while (i < rows.length) {
        if (/def/.test(rows[i])) {
            exportedBlocks.push(extractFunctionName(rows[i]));
            const newBlock = [rows[i]];
            i++;
            while (getIndentCount(rows[i], INDENT_LENGTH) !== 0) {
                newBlock.push(rows[i]);
                i++;
            }
            parsedBlocks.push(...parseBlock(newBlock, currentDirectory));
        }
        else {
            globalCode.push(rows[i]);
            i++;
        }
    }
    const code = [...parseBlock(globalCode, currentDirectory), ...parsedBlocks];

    return `(function() {
        ${toCodeString(code)}
        return ${exportFunction(exportedBlocks)}
    })()`;
};

module.exports = parse;
