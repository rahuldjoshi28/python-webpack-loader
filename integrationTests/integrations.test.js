const fs = require('fs')
const path = require('path')
const loader = require('../loader')

function pythonAsText(testName) {
	return fs.readFileSync(path.join(__dirname, 'python', testName, 'test.py'))
}

function pythonPath(testName) {
	return path.join(__dirname, 'python', testName)
}

const tests = ['simple', 'functions', 'class', 'modules']

describe('integrations', () => {
	it.each(tests)('should work for %s python code', (testName) => {
		this.context = pythonPath(testName)
		const pythonCode = pythonAsText(testName)
		const loaderWithMockThis = loader.bind(this)

		expect(loaderWithMockThis(pythonCode)).toMatchSnapshot()
	})
})
