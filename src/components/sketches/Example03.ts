import * as p5 from 'p5'
import * as _ from 'lodash'
import { Sketch } from '../base/Sketch'
import { Sequence } from '../base/stroke/Sequence'

import '../../assets/audio/lindsey-sterling--elements--128kbps.mp3'

interface Configuration {
	scale: number
	osc: number
	energies: AudioEnergyCollection
	samples: number
	path: Array<number>
	currentSample?: number
}

interface AudioEnergyCollection {
	bass: number
	low: number
	mid: number
	high: number
	treble: number
}

export class Example03 extends Sketch {
	private sequence: Sequence
	private strokes: Array<number>
	private polygon: Array<number>
	private star: Array<number>

	private toRadians = Math.PI / 180

	private circleSteps = 360

	private audio: p5.SoundFile
	private fft: p5.FFT
	private buffer: number = 144

	preload = () => {
		this.audio = new p5.SoundFile('assets/audio/lindsey-sterling--elements--128kbps.mp3', (...args) => {
			console.log('success', args)
		})

		this.noLoop()
	}

	setup = () => {
		this.createCanvas(this.windowWidth, this.windowHeight)

		this.renderContext.mouseClicked(() => {
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
		this.polygon = Sequence.regularPolygon(2, 144) // * 9)
		this.star = Sequence.star(10, 144, 55) //, 233, 377)

		this.sequence = new Sequence(this, { stroke: { thickness: 2 }, joint: { radius: 13 } })

		this.fft = new p5.FFT()
	}

	draw = () => {
		this.clear()
		this.background(0, 0, 0)

		const osc = Math.sin((this.millis() / 1000 / 10) * 2 * Math.PI)

		const energies = this.getAudioEnergies(1, 4)

		//const energy = this.map(energies.treble, 0, 255, 1, 4)
		//this.audio && this.audio.isPlaying()
		//	? this.map(energies.asArray().reduce((prev, curr) => prev + curr) / energies.asArray().length, 0, 255, 1, 10)
		//	: 1

		const samples = this.frameCount < this.buffer ? this.frameCount : this.buffer
		const config = { scale: 0.3, osc, energies, samples, path: this.polygon }

		this.push()
		this.translate(this.windowWidth / 2, this.windowHeight / 2)

		//console.log(config.osc, Math.abs(config.osc))
		this.render(config)
		this.rotate(Math.PI) // 180 deg
		this.render(config)
		//this.rotate((Math.PI * 2) / 3)
		//this.render(config)

		this.pop()
	}

	getAudioEnergies = (min: number = 0, max: number = 1): AudioEnergyCollection => {
		this.fft.analyze()

		return {
			bass: this.map(this.fft.getEnergy('bass'), 0, 255, min, max),
			low: this.map(this.fft.getEnergy('lowMid'), 0, 255, min, max),
			mid: this.map(this.fft.getEnergy('mid'), 0, 255, min, max),
			high: this.map(this.fft.getEnergy('highMid'), 0, 255, min, max),
			treble: this.map(this.fft.getEnergy('treble'), 0, 255, min, max),
		}
	}

	render = (config: Configuration) => {
		for (let sample = 0; sample < config.samples; ++sample) {
			config.currentSample = this.frameCount - config.samples + sample
			this.renderSample(config as Required<Configuration>)
		}
	}

	renderSample = (config: Required<Configuration>) => {
		this.push()
		this.applyTransformations(config)
		this.sequence.render(...config.path.map((value) => value * config.energies.bass))
		//this.sequence.render(...config.path.map((value) => value * config.energies.low))
		//this.sequence.render(...config.path.map((value) => value * config.energies.mid))
		//this.sequence.render(...config.path.map((value) => value * config.energies.high))
		this.sequence.render(...config.path.map((value) => value / config.energies.treble))
		this.pop()
	}

	applyTransformations = (config: Required<Configuration>) => {
		this.push()

		const color = this.color(config.currentSample % this.circleSteps, 100, 100, 0.5) // * osc
		this.stroke(color)
		this.fill(color)

		// apply main scale factor
		this.scale(config.scale)

		//this.translate((this.frameCount % 60) * osc, 0)

		// rotate around center
		this.rotate((config.currentSample % this.circleSteps) * this.toRadians)
		// move away from center (radius)
		this.translate(this.windowWidth / 2, this.windowHeight / 2)

		// rotate around point on centered circle
		this.rotate((this.map(config.currentSample, 0, 60, 0, 1) / 2) * Math.PI)
		// move away from point on centered circle
		this.translate((config.currentSample / 360) * config.osc, this.windowHeight / 4)

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
