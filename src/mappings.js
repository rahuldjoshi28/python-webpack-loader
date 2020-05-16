const nativeFunctionMappings = [
	{
		expression: /print/g,
		value: 'console.log',
	},
]

function replaceNativeFunctions(code) {
	return code.map((row) => {
		let result = row
		nativeFunctionMappings.forEach((rule) => {
			result = result.replace(rule.expression, rule.value)
		})
		return result
	})
}

module.exports = {
	replaceNativeFunctions,
}
