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

const parseBlock = (block, currentDirectory) => {
    const variables = [];
    const createRow = parseStatement(currentDirectory, variables);
    const code = [];

    let i = 0;

    while (i < block.length) {
        const row = block[i];
        const numberOfIndents = getIndentCount(row, INDENT_LENGTH);
        if (isNewBlock(row)) {
            code.push(createRow(row) + "\n");
            const newBlocks = [];
            i++;
            if (i === block.length) {
                break;
            }
            while (i !== block.length && getIndentCount(block[i], INDENT_LENGTH) !== numberOfIndents) {
                newBlocks.push(block[i]);
                i++;
            }
            code.push(...parseBlock(newBlocks, currentDirectory));
            code.push('\n}\n');
        } else {
            code.push(createRow(row));
            i++;
        }
    }
    return code;
};

const extractBlockName = (statement, type) => {
    if (type === 'function') {
        return statement.substring(4, statement.indexOf('(')).trim()
    }
    return statement.substring(6, statement.indexOf(':')).trim();
};

const convertToClassMethod = fn => {
    let firstLine = fn[0];
    const args = firstLine.substring(firstLine.indexOf('(') + 1, firstLine.indexOf(')'));
    const [ref, ...rest] = args.split(',');
    fn[0] = firstLine.replace(args, rest.join(', ')).replace('const', '');
    return fn.map(line => ref !== '' ? line.replace(new RegExp(ref, 'g'), 'this') : line);
};

const parseClass = code => {
    const blocks = [];
    const [className, ...restCode] = code;

    blocks.push(className.replace(':', ' {\n'));

    let i = 0;
    while (i < restCode.length) {
        if (/def/.test(restCode[i])) {
            const [block, _i] = extractBlock(restCode, i, 1);
            i = _i;
            const parsedBlock = parseBlock(block);
            blocks.push(...convertToClassMethod(parsedBlock));
        }
    }
    blocks.push('\n}\n');
    return blocks;
};

function extractBlock(rows, i, baseIndent) {
    const newBlock = [rows[i]];
    i++;
    while (i < rows.length && getIndentCount(rows[i], INDENT_LENGTH) !== baseIndent) {
        newBlock.push(rows[i]);
        i++;
    }
    return [newBlock, i];
}

const parseClassInstantiation = (code, classes) => {
    return code.map(line => {
        let parsedLine = line;
        classes.forEach(className => {
            parsedLine = parsedLine.replace(`${className}(`, `new ${className}(`);
        });
        return parsedLine;
    });
};

const parse = (jsSource, currentDirectory) => {
    let source = jsSource.toString();

    const rows = source.split('\n').map(row => {
        let result = row;
        nativeFunctionMappings.forEach(rule => {
            result = result.replace(rule.expression, rule.value)
        });
        return result;
    });

    const functions = [];
    const classes = [];
    const parsedBlocks = [];
    const globalCode = [];

    let i = 0;
    while (i < rows.length) {
        const statementType = /def/.test(rows[i]) ? 'function' : (/class/.test(rows[i]) ? 'class' : 'default');
        if (statementType === 'function') {
            functions.push(extractBlockName(rows[i], statementType));
            const [newBlock, _i] = extractBlock(rows, i, 0);
            i = _i;
            const parsedCode = parseBlock(newBlock, currentDirectory);
            parsedBlocks.push(...parsedCode);
        } else if (statementType === 'class') {
            classes.push(extractBlockName(rows[i], statementType));
            const [newBlock, _i] = extractBlock(rows, i, 0);
            i = _i;
            const parsedCode = parseClass(newBlock);
            parsedBlocks.push(...parsedCode);
        } else {
            globalCode.push(rows[i]);
            i++;
        }
    }
    const parsedCode = parseBlock(globalCode, currentDirectory);

    const code = [...parseClassInstantiation(parsedCode, classes), ...parseClassInstantiation(parsedBlocks, classes)];

    return `(function() {
        ${toCodeString(code)}
        return ${exportFunction([...functions, ...classes])}
    })()`;
};

module.exports = parse;
