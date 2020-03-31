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

const parseRow = (row) => {
    const result = row.replace(':', ' {');
    if (/def/.test(row)) {
        return result.replace(/def/, 'function');
    }
    return result;
};

const parse = (jsSource) => {
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

    rows.forEach((row, i) => {
        const numberOfIndents = getIndentCount(row, indentLength);
        if (numberOfIndents === currentIndent - 1) {
            blocks.push(`${String(' ').repeat(numberOfIndents * indentLength)}}\n`);
            count++;
            currentIndent--;
        }
        if (numberOfIndents === currentIndent) {
            blocks.push(row);
        }
        if (numberOfIndents === currentIndent + 1) {
            blocks[count - 1] = parseRow(blocks[count - 1]);
            blocks.push(row);
            currentIndent++;
        }
        count++;
    });
    while (currentIndent > 0) {
        blocks.push(`${String(' ').repeat((currentIndent - 1) * indentLength)}}\n`);
        currentIndent--;
    }

    const ans = blocks.join("\n").toString();
    console.log(ans);
    return ans;
};

module.exports = parse;
