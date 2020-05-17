const {
	toCodeString,
	exportFunction,
	extractBlockName,
	getIndentCount,
	fileContent,
} = require('../helpers')
const fs = require('fs')

jest.mock('fs')

describe('helpers', () => {
	it('[toCodeString] should return string from code array', () => {
		const code = [
			'function someFunction() {',
			"    console.log('Hello world')",
			'}',
		]

		const expectedCodeString =
			'function someFunction() {\n' + "    console.log('Hello world')\n" + '}'

		expect(toCodeString(code)).toEqual(expectedCodeString)
	})

	it('[exportFunction] should return object of function names from list', () => {
		const functions = ['function1', 'function2', 'function3']

		expect(exportFunction(functions)).toEqual(
			'{ function1,function2,function3 }'
		)
	})

	describe('extractBlockName', () => {
		it('should return function name from declaration statement', () => {
			const declaration = 'def someFunction(a, b):'

			expect(extractBlockName(declaration, 'function')).toEqual('someFunction')
		})

		it('should trim extra spaces from function name from declaration statement', () => {
			const declaration = 'def someFunction (a, b):'

			expect(extractBlockName(declaration, 'function')).toEqual('someFunction')
		})

		it('should return class name from declaration statement', () => {
			const declaration = 'class Dog:'

			expect(extractBlockName(declaration, 'class')).toEqual('Dog')
		})

		it('should trim extra spaces from class name from declaration statement', () => {
			const declaration = 'class Dog :'

			expect(extractBlockName(declaration, 'class')).toEqual('Dog')
		})
	})

	describe('getIndentCount', () => {
		it('should return indent count from statement', () => {
			const statement = '        a = 3'
			const expectedIndentCount = 2

			expect(getIndentCount(statement)).toEqual(expectedIndentCount)
		})

		it('should throw exception when indentation is wrong', () => {
			const statement = '   a = 3' // should contain tab [4 spaces according to config] but 3 spaces given instead

			expect(() => getIndentCount(statement)).toThrowError(
				'Indentation is wrong'
			)
		})
	})

	it('[fileContent] should call fs readFile with absolute path', () => {
		fs.readFileSync.mockImplementation(() => 'fileContent')

		const moduleName = 'animal'
		const currentDirectory = '/User/username/projects/python-loader'

		const expectedFullPath = '/User/username/projects/python-loader/animal.py'

		fileContent(moduleName, currentDirectory)
		expect(fs.readFileSync).toHaveBeenLastCalledWith(expectedFullPath)
	})
})
