const { convertToClassMethod, parseClassInstantiation } = require('../class')

describe('class', () => {
	describe('convertToClassMethod', () => {
		it('should remove first argument(self reference) from argument list', () => {
			const statements = ['def someFunction(self):', "    print('abc')"]

			const expectedStatement = 'def someFunction():'

			expect(convertToClassMethod(statements)[0]).toEqual(expectedStatement)
		})

		it('should replace all self references with "this"', () => {
			const statements = ['def someFunction(self):', "    print(self.name')"]

			const expectedStatement = "    print(this.name')"

			expect(convertToClassMethod(statements)[1]).toEqual(expectedStatement)
		})

		it('should return function as is if no self reference is there', () => {
			const statements = ['def someFunction():', "    print(self.name')"]

			expect(convertToClassMethod(statements)[0]).toEqual('def someFunction():')
		})

		it('should keep other argument as is after removing self reference', () => {
			const statements = [
				'def someFunction(self, variable1, variable2):',
				"    print('abc')",
			]

			const [fnDeclaration] = convertToClassMethod(statements)

			expect(fnDeclaration).toMatch(/variable1/)
			expect(fnDeclaration).toMatch(/variable2/)
			expect(fnDeclaration).not.toMatch(/self/)
		})
	})

	describe('parseClassInstantiation', () => {
		it('should add new keywords to all instantiations from class list', () => {
			const statements = ["neko = Cat('Queen')", "sheru = Dog('Sheru')"]
			const classList = ['Cat', 'Dog', 'Snake']

			const expectedStatements = [
				"neko = new Cat('Queen')",
				"sheru = new Dog('Sheru')",
			]

			expect(parseClassInstantiation(statements, classList)).toEqual(
				expectedStatements
			)
		})

		it('should return statements as is if no class matches', () => {
			const statements = ['van = DogVan()']
			const classList = ['Cat', 'Dog']

			expect(parseClassInstantiation(statements, classList)).toEqual([
				'van = DogVan()',
			])
		})

		it('should work when more than two instancess made in single line', () => {
			const statements = ["pets = [Cat('Queen'), Dog('Sheru')]"]
			const classList = ['Cat', 'Dog', 'Snake']

			expect(parseClassInstantiation(statements, classList)).toEqual([
				"pets = [new Cat('Queen'), new Dog('Sheru')]",
			])
		})
	})
})
