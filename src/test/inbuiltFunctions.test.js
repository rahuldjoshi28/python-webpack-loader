const { range } = require('../inbuiltFunctions')

describe('inbuiltFunctions', () => {
	describe('range', function () {
		it('should return array of numbers from start to end', () => {
			const start = 1
			const end = 5
			const expectedArray = [1, 2, 3, 4]

			expect(range(start, end)).toEqual(expectedArray)
		})

		it('should return array of numbers from start to end with step 1', () => {
			const start = 1
			const end = 10
			const step = 2
			const expectedArray = [1, 3, 5, 7, 9]

			expect(range(start, end, step)).toEqual(expectedArray)
		})

		it('should return array from 0 to end when no start provided', () => {
			const end = 5
			const expectedArray = [0, 1, 2, 3, 4]

			expect(range(end)).toEqual(expectedArray)
		})
	})
})
