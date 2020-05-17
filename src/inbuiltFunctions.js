const range = (start, end, step = 1) => {
	if (end === undefined) {
		return range(0, start)
	}
	let arr = []
	for (let i = start; i < end; i += step) {
		arr.push(i)
	}
	return arr
}

module.exports = {
	range,
}
