const { replaceNativeFunctions } = require('../mappings')

describe('mappings', () => {
	it('should return code array by replacing print with console.log', () => {
		const statements = [
			'def welcome(name):',
			"    print('Hello world')",
			"    print('Welcome ', name)",
		]

		const expectedCode = ['def welcome(name):', "    console.log('Hello world')", "    console.log('Welcome ', name)",]

		expect(replaceNativeFunctions(statements)).toEqual(expectedCode)
	})
})
