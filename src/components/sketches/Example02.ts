import * as p5 from 'p5'
import * as _ from 'lodash'
import { Sketch } from '../base/Sketch'
import { Sequence } from '../base/stroke/Sequence'

import '../../assets/audio/lindsey-sterling--elements--128kbps.mp3'

export class Example02 extends Sketch {
	private sequence: Sequence
	private strokes: Array<number>
	private polygon: Array<number>
	private star: Array<number>

	private toRadians = Math.PI / 180

	private circleSteps = 360

	private audio: p5.SoundFile
	private fft: p5.FFT
	private buffer: number = 34

	preload = () => {
		this.audio = new p5.SoundFile('assets/audio/lindsey-sterling--elements--128kbps.mp3', (...args) => {
			console.log('success', args)
		})

		console.log(this.audio)
		this.noLoop()
	}

	setup = () => {
		this.createCanvas(this.windowWidth, this.windowHeight)
		this.renderContext.mouseClicked(() => {
			console.log('huhu', this.audio.isPlaying())
			console.log(this.audio)

			if (this.audio.isPlaying()) {
				this.audio.pause()
				this.noLoop()
			} else {
				this.audio.play()
				this.loop()
			}
		})

		this.background(0, 0, 0)
		this.stroke(255, 212, 0)
		this.fill(255, 212, 0)

		this.colorMode(this.HSB, this.circleSteps, 100, 100, 1)

		this.strokes = Sequence.random(2, -377, 377)
		this.polygon = Sequence.regularPolygon(4, 144) // * 9)
		this.star = Sequence.star(10, 144, 55) //, 233, 377)

		this.sequence = new Sequence(this, { stroke: { thickness: 1 }, joint: { radius: 8 } })

		this.fft = new p5.FFT()
	}

	draw = () => {
		this.clear()
		this.background(0, 0, 0)
		const osc = Math.sin((this.millis() / 1000 / 10) * 2 * Math.PI)

		const specturm = this.fft.analyze()
		const energies = [
			//this.fft.getEnergy('bass'),
			//this.fft.getEnergy('lowMid'),
			//this.fft.getEnergy('mid'),
			this.fft.getEnergy('highMid'),
			//this.fft.getEnergy('treble'),
		]

		const energy =
			this.audio && this.audio.isPlaying()
				? this.map(energies.reduce((prev, curr) => prev + curr) / energies.length, 0, 255, 1, 10)
				: 1

		const config = { scale: 0.25, osc, energy }
		//console.log(energies)
		//console.log('energy', energy)
		const strokes = this.polygon.map((value, index) => (index % 2 === 0 ? value * energy : value * energy * 2))

		this.push()
		this.translate(this.windowWidth / 2, this.windowHeight / 2)

		this.push()
		this.applyTransformations(config)
		//this.sequence.render(...this.polygon)
		this.sequence.render(...strokes)
		this.pop()

		/*
		this.rotate((Math.PI * 2) / 3)

		this.push()
		this.applyTransformations(config)
		this.applyTransformations(config)
		//this.sequence.render(...this.polygon)
		this.sequence.render(...strokes)
		this.pop()

		this.rotate((Math.PI * 2) / 3)
		this.push()
		this.applyTransformations(config)
		this.applyTransformations(config)
		this.applyTransformations(config)
		//this.sequence.render(...this.polygon)
		this.sequence.render(...strokes)
		this.pop()
		*/
		//this.sequence.render(...this.strokes)
		//this.sequence.render(...this.star)
		this.pop()
	}

	applyTransformations = (config: { scale: number; osc: number; energy: number }) => {
		// move to center
		//this.translate(this.windowWidth / 2, this.windowHeight / 2)
		const offsetX = this.map(this.mouseX, 0, this.windowWidth, -2, 2)
		const offsetY = this.map(this.mouseY, 0, this.windowHeight, -2, 2)
		// apply main scale factor
		this.scale(config.scale) // * osc)
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
		this.translate((this.frameCount / 360) * config.osc, this.windowHeight / 4)

		//this.scale(config.energy)
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
