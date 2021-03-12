import * as p5 from 'p5'
import * as _ from 'lodash'
import { Sketch } from '../../base/Sketch'
import { Sequence } from '../../base/stroke/Sequence'

export class Example01 extends Sketch {
	private sequence: Sequence
	private strokes: Array<number>
	private polygon: Array<number>
	private star: Array<number>

	private toRadians = Math.PI / 180

	private circleSteps = 360

	setup = () => {
		this.createCanvas(this.windowWidth, this.windowHeight)
		this.background(0, 0, 0)
		this.stroke(255, 212, 0)
		this.fill(255, 212, 0)

		this.colorMode(this.HSB, this.circleSteps, 100, 100, 1)
		this.strokes = Sequence.random(2, -377, 377)
		this.polygon = Sequence.regularPolygon(4, 144)// * 9)
		this.star = Sequence.star(10, 144, 55) //, 233, 377)

		this.sequence = new Sequence(this, { stroke: { thickness: 1 }, joint: { radius: 8 } })
	}

	draw = () => {
		const osc = Math.sin((this.millis() / 1000 / 10) * 2 * Math.PI)
		//this.background(0, 0, 0)

		this.push()
		this.translate(this.windowWidth / 2, this.windowHeight / 2)

		this.push()
		this.applyTransformations(0.25, osc)
		this.sequence.render(...this.polygon)
		this.pop()
		
		this.rotate(Math.PI * 2 / 3)

		this.push()
		this.applyTransformations(0.25, osc)
		this.applyTransformations(0.25, osc)
		this.sequence.render(...this.polygon)
		this.pop()

		this.rotate(Math.PI * 2 / 3)
		this.push()
		this.applyTransformations(0.25, osc)
		this.applyTransformations(0.25, osc)
		this.applyTransformations(0.25, osc)
		this.sequence.render(...this.polygon)
		this.pop()

		//this.sequence.render(...this.strokes)
		//this.sequence.render(...this.star)
		this.pop()
	}

	applyTransformations = (scale: number, osc: number) => {
		// move to center
		//this.translate(this.windowWidth / 2, this.windowHeight / 2)
		const offsetX = this.map(this.mouseX, 0, this.windowWidth, -2, 2)
		const offsetY = this.map(this.mouseY, 0, this.windowHeight, -2, 2)
		// apply main scale factor
		this.scale(scale) // * osc)
		//const a = this.map(this.frameCount, 0, 255, 0, 1.0)
		//if (this.frameCount % 60 === 0) {
		//console.log(this.frameCount / 60 * Math.PI / 180)
		//}

		const color = this.color(this.frameCount % this.circleSteps, 100, 100, 0.5) // * osc
		this.stroke(color)
		this.fill(color)

		//this.translate((this.frameCount % 60) * osc, 0)

		// rotate around center
		this.rotate((this.frameCount % this.circleSteps) * this.toRadians)
		// move away from center (radius)
		this.translate(this.windowWidth / 2, this.windowHeight / 2)

		// rotate around point on centered circle
		this.rotate((this.map(this.frameCount, 0, 60, 0, 1) / 2) * Math.PI)
		// move away from point on centered circle
		this.translate((this.frameCount / 360) * osc, this.windowHeight / 4)

		//this.rotate((this.map(this.frameCount, 0, 10, 0, 1) / 2) * Math.PI)
		//this.translate(this.windowHeight / 2, this.windowHeight / 2)
		//this.scale(this.map(this.frameCount % 60, 0, 60, 0.5, 1.5))
		//this.scale(osc)
	}

	windowResized = () => {
		this.resizeCanvas(this.windowWidth, this.windowHeight)
		this.background(48, 48, 48)
	}
}
