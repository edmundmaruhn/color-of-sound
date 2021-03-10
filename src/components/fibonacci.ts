import { memoize } from 'lodash'

export const fibonacci = memoize(function (n: number): number {
	return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2)
})
