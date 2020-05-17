const fs = require('fs')
const path = require('path')
const loader = require('../loader')
const terser = require('terser')

jest.mock('terser')

function pythonAsText(testName) {
	return fs.readFileSync(path.join(__dirname, 'python', testName, 'test.py'))
}

function pythonPath(testName) {
	return path.join(__dirname, 'python', testName)
}

const tests = ['simple', 'functions', 'class', 'modules']

describe('integrations', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it.each(tests)(
		'should work for %s python code and non uglified',
		(testName) => {
			this.context = pythonPath(testName)
			const pythonCode = pythonAsText(testName)
			const loaderWithMockThis = loader.bind(this)
			process.env.UGLIFY = 'false'
			expect(loaderWithMockThis(pythonCode)).toMatchSnapshot()
		}
	)

	it.each(tests)('should work for %s python code and uglified', (testName) => {
		this.context = pythonPath(testName)
		const pythonCode = pythonAsText(testName)
		const loaderWithMockThis = loader.bind(this)

		process.env.UGLIFY = 'false'
		const nonUglifiedCode = loaderWithMockThis(pythonCode)

		expect(terser.minify).not.toHaveBeenCalled()

		process.env.UGLIFY = 'true'
		loaderWithMockThis(pythonCode)

		expect(terser.minify).toHaveBeenLastCalledWith(nonUglifiedCode)
	})
})
