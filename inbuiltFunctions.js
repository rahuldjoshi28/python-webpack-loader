const range = (start, end, step = 1) => {
    let arr = [];
    for (let i = start; i <= end; i += step) {
        arr = [...arr, i];
    }
    return arr;
};

module.exports = {
    range
};