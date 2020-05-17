const { isNewBlock, extractBlock } = require('../block')

describe('block', () => {
	describe('isNewBlock', () => {
		it('should return true for provided "if" statement', () => {
			const statement = 'if a > 2:'
			expect(isNewBlock(statement)).toEqual(true)
		})

		it('should return true for provided "def" statement', () => {
			const statement = 'def functionName(a, b):'
			expect(isNewBlock(statement)).toEqual(true)
		})

		it('should return true for provided "else" statement', () => {
			const statement = 'else:'
			expect(isNewBlock(statement)).toEqual(true)
		})

		it('should return true for provided "for" statement', () => {
			const statement = 'for i in range(1, 10):'
			expect(isNewBlock(statement)).toEqual(true)
		})

		it('should return true for provided "while" statement', () => {
			const statement = 'while(a < 10):'
			expect(isNewBlock(statement)).toEqual(true)
		})

		it('should return true for provided "class" statement', () => {
			const statement = 'class Cat:'
			expect(isNewBlock(statement)).toEqual(true)
		})

		it('should return false for provided "assignment" statement', () => {
			const statement = 'a = 2'
			expect(isNewBlock(statement)).toEqual(false)
		})
	})

	describe('extractBlock', () => {
		it('should return empty result and non incremented counter when provided statements doesnt have block', () => {
			const statements = ['a = 2', 'print(a)', 'a = a + 3']

			const [block, newCounter] = extractBlock(statements, 0, 0)

			expect(block).toEqual([])
			expect(newCounter).toEqual(0)
		})

		it('should return an extracted block from statements', () => {
			const statements = [
				'def add(a, b):',
				'    c = a + b',
				'    return c',
				'print(add(2, 3))',
			]

			const expectedBlock = ['def add(a, b):', '    c = a + b', '    return c']

			const [block] = extractBlock(statements, 0, 0)

			expect(block).toEqual(expectedBlock)
		})

		it('should return incremented counter after extracting block', () => {
			const initialCounter = 0
			const statements = [
				'def add(a, b):',
				'    c = a + b',
				'    return c',
				'print(add(2, 3))',
			]

			const [_, newCounter] = extractBlock(statements, initialCounter, 0)

			expect(newCounter).toEqual(3)
		})

		it('should return first block even multiple blocks present', () => {
			const statements = [
				'def add(a, b):',
				'    c = a + b',
				'    return c',
				'def subtract(a, b):',
				'    c = a - b',
				'    return c',
			]

			const expectedBlock = ['def add(a, b):', '    c = a + b', '    return c']

			const [block] = extractBlock(statements, 0, 0)

			expect(block).toEqual(expectedBlock)
		})

		it('should return an outermost block when nested blocks are there', () => {
			const statements = [
				'def evenOdd(num):',
				'    if num % 2 == 0:',
				"        return 'Number is even'",
				'    else:',
				"        return 'Number is odd'",
			]

			const expectedBlock = [
				'def evenOdd(num):',
				'    if num % 2 == 0:',
				"        return 'Number is even'",
				'    else:',
				"        return 'Number is odd'",
			]

			const [block] = extractBlock(statements, 0, 0)

			expect(block).toEqual(expectedBlock)
		})

		it('should return an inner block when indent level is 1', () => {
			const statements = [
				'class evenOdd:',
				'    def something():',
				"        return 'Number is even'",
				'    def someOther():',
				"        return 'Number is odd'",
			]

			const expectedBlock = [
				'    def something():',
				"        return 'Number is even'",
			]

			const baseIndent = 1,
				initialCounter = 1

			const [block, newCounter] = extractBlock(
				statements,
				initialCounter,
				baseIndent
			)

			expect(block).toEqual(expectedBlock)
			expect(newCounter).toEqual(3)
		})
	})
})
