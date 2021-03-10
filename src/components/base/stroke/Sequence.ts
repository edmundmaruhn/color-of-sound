import { merge } from 'lodash'
import { Polar } from '../../geometry/Point'

export interface Configuration {
	stroke?: Stroke
	joint?: Joint
	close?: boolean
}

export interface Stroke {
	thickness?: number
}

export interface Joint {
	radius?: number
}

type RequiredConfiguration = {
	[key in keyof Configuration]-?: Required<Configuration[key]>
}

const defaultConfiguration: RequiredConfiguration = {
	stroke: { thickness: 3 },
	joint: { radius: 13 },
	close: true,
}

export class Sequence {
	static random = (numPoints: number, from: number, to: number) => {
		const min = Math.min(from, to)
		const max = Math.max(from, to)
		const delta = Math.abs(max - min)

		return Array.from({ length: numPoints * 2 }, () => Math.random() * delta + min)
	}

	/**
	 * Creates a polygonal vertex sequence with each (x,y) vertex placed at one of the given lengths. All vertices will
	 * be spread evenly on 360 degrees.
	 *
	 * @param radii lengths from the center of the polygon
	 */
	static radialPolygon = (...radii: Array<number>) => {
		const step = (Math.PI * 2) / radii.length
		const sequence: Array<number> = []

		for (let r = 0; r < radii.length; ++r) {
			const polar = new Polar(radii[r], step * r)
			const cartesian = polar.toCartesian()

			sequence.push(cartesian.x, cartesian.y)
		}

		return sequence
	}

	static regularPolygon(edges: number, radius: number, dx: number = 0, dy: number = 0, angle: number = 0) {
		const step = (Math.PI * 2) / edges
		const sequence: Array<number> = []

		for (let e = 0; e < edges; ++e) {
			const polar = new Polar(radius, step * e + angle)
			const cartesian = polar.toCartesian()

			sequence.push(cartesian.x + dx, cartesian.y + dy)
		}

		return sequence
	}

	static star(tips: number, outerRadius: number, innerRadius: number, dx: number = 0, dy: number = 0) {
		const outer = Sequence.regularPolygon(tips, outerRadius, dx, dy)
		const inner = Sequence.regularPolygon(tips, innerRadius, dx, dy, ((Math.PI * 2) / tips) * 0.5)

		const sequence: Array<number> = []
		let current = outer

		while (outer.length || inner.length) {
			sequence.push(...current.splice(0, 2))
			current = current === outer ? inner : outer
		}

		return sequence
	}

	static line(length: number, scale: number, ...heights: Array<number>) {
		const steps = length / heights.length - 1
		const sequence: Array<number> = []

		for (let h = 0; h < heights.length; ++h) {
			sequence.push(steps * h, heights[h] * scale)
		}

		return sequence
	}

	private configuration: RequiredConfiguration

	constructor(private context: p5, configuration?: Configuration) {
		this.configuration = merge(merge({}, defaultConfiguration), configuration)
		console.log('sequence configuration', this.configuration)
	}

	render(...strokes: Array<number>): void
	render(x: number, y: number, ...strokes: Array<number>) {
		const context = this.context
		const config = this.configuration

		context.push()

		if (config.stroke && typeof config.stroke.thickness === 'number') {
			context.strokeWeight(config.stroke.thickness)
		}

		strokes = [x, y, ...strokes]

		if (strokes.length % 2 !== 0) {
			// odd number, so the last point lacks of a y-component
			// we copy it from the previous point
			strokes.push(strokes[strokes.length - 2])
		}

		if (strokes.length >= 4) {
			context.push()
			context.noFill()

			context.beginShape(context.LINES)
			for (let index = 0; index < strokes.length - 2; index += 2) {
				//const points = strokes.slice(index, index + 4)
				const [x, y] = strokes.slice(index, index + 2)

				context.vertex(x, y)

				// @ts-ignore
				//context.line(...points)
			}

			/*strokes.length >= 6 && */ config.close ? context.endShape(context.CLOSE) : context.endShape()

			/*
			if (strokes.length >= 6 && config.close) {
				context.line(strokes[strokes.length - 2], strokes[strokes.length - 1], strokes[0], strokes[1])
			}
			*/

			context.pop()
		}

		if (config.joint.radius > 0) {
			context.noStroke()

			while (strokes.length > 0) {
				// @ts-ignore
				context.circle(...strokes.splice(0, 2), config.joint.radius)
			}
		}

		context.pop()
	}
}
