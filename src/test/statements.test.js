const { matchers, to } = require('../statements')

describe('statements', () => {
	describe('matchers', () => {
		it('[assignment] should return true when assignment operator is present', () => {
			const statement = 'a = 2'
			expect(matchers.assignment(statement)).toBeTruthy()
		})

		it('[assignment] should return false when comparison operator is present', () => {
			const statement = 'a == 2'
			expect(matchers.assignment(statement)).toBeFalsy()
		})

		it('[import] should return true when import is present', () => {
			const statement = 'import test2'
			expect(matchers.import(statement)).toBeTruthy()
		})

		it('[import] should return false when import is not present', () => {
			const statement = 'a = 2'
			expect(matchers.import(statement)).toBeFalsy()
		})

		it('[function] should return true when function is present', () => {
			const statement = 'def something():'
			expect(matchers.function(statement)).toBeTruthy()
		})

		it('[function] should return false when function is not present', () => {
			const statement = 'a = 2'
			expect(matchers.function(statement)).toBeFalsy()
		})

		it('[if] should return true when if is present', () => {
			const statement = 'if a > 2:'
			expect(matchers.if(statement)).toBeTruthy()
		})

		it('[if] should return false when if is not present', () => {
			const statement = 'a = 2'
			expect(matchers.if(statement)).toBeFalsy()
		})

		it('[for] should return true when for is present', () => {
			const statement = 'for i in range(10):'
			expect(matchers.for(statement)).toBeTruthy()
		})

		it('[for] should return false when for is not present', () => {
			const statement = 'a = 2'
			expect(matchers.for(statement)).toBeFalsy()
		})

		it('[class] should return true when class is present', () => {
			const statement = 'class Test:'
			expect(matchers.class(statement)).toBeTruthy()
		})

		it('[class] should return false when class is not present', () => {
			const statement = 'a = 2'
			expect(matchers.class(statement)).toBeFalsy()
		})
	})

	describe('to', () => {
		it('[function] should convert python function declaration to javascript ', function () {
			const pythonDeclaration = 'def someFunction(a, b):'
			const expectedJsConversion = 'const someFunction = (a, b) => {'

			expect(to.function(pythonDeclaration)).toEqual(expectedJsConversion)
		})

		it('[if] should convert python if statement to javascript ', function () {
			const pythonDeclaration = 'if a > b:'
			const expectedJsConversion = 'if( a > b) {'

			expect(to.if(pythonDeclaration)).toEqual(expectedJsConversion)
		})

		it('[for] should convert python for statement to javascript ', function () {
			const pythonDeclaration = 'for i in range(10):'
			const expectedJsConversion = 'for( let  i in range(10)) {'

			expect(to.for(pythonDeclaration)).toEqual(expectedJsConversion)
		})

		describe('assignment', () => {
			it('should return statement as is if variable already declared in scope', () => {
				const pythonAssignment = 'a = 2'
				const variables = {
					a: '1',
					b: '2',
				}

				const [expression] = to.assignment(pythonAssignment, variables)
				expect(expression).toEqual(' a = 2')
			})

			it('should add declaration prefix when new variable found', () => {
				const pythonAssignment = 'x = 2'
				const variables = { a: '1' }

				const [expression] = to.assignment(pythonAssignment, variables)
				expect(expression).toEqual('let x = 2')
			})

			it('should return new variable with value when found variable not present', () => {
				const pythonAssignment = 'x = 2'
				const variables = { a: '1' }

				const [_, variable] = to.assignment(pythonAssignment, variables)

				expect(variable.name).toEqual('x')
				expect(variable.value).toEqual('2')
			})
		})
	})
})
