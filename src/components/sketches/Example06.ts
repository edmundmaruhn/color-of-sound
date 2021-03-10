import * as p5 from 'p5'
import * as _ from 'lodash'
import { Sketch } from '../base/Sketch'
import { Sequence } from '../base/stroke/Sequence'
import '../../assets/data/spectra/elements/fe.json'
import '../../assets/data/spectra/elements/h.json'

import '../../assets/audio/lindsey-sterling--elements--128kbps.mp3'
import '../../assets/audio/lindsey-sterling--zi-zis-journey--128kbps.mp3'
import '../../assets/audio/vivaldi--four-seasons-spring--128kbps.mp3'
import { Color } from '../physics/Color'
import { Cartesian, Polar } from '../geometry/Point'

interface Configuration {
	scale: number
	osc: number
	audio: AudioInfo
	path: Array<number>
	samples: number
	sampleIndex?: number
	currentSample?: number
}

interface AudioInfo {
	frequencies: Array<number>
	energies: AudioEnergyCollection
}

interface AudioEnergyCollection {
	bass: number
	low: number
	mid: number
	high: number
	treble: number
	toArray(): Array<number>
}

export class Example06 extends Sketch {
	private GOLDEN_RATIO = 1.61803398875
	private samples = 2048

	private oscillator: p5.Oscillator

	// the delta of human visible wavelengths determines the target range's upper bound to map values to
	private visibleSpectrum = Color.MAX_VISIBLE_WAVELENGTH - Color.MIN_VISIBLE_WAVELENGTH

	private audio: p5.SoundFile
	private canPlayAudio: boolean = false
	private soundTransform: p5.FFT
	private audioAnalysis: {
		analyze: Array<number>
		waveform: Array<number>
		average: {
			analyze: number
			waveform: number
		}
	}

	private spectra: any

	private playPauseButtonSettings = {
		width: 89,
		height: 55,
		margin: { top: 21, right: 34, bottom: 21, left: 34 },
		alignment: { horizontal: 'right', vertical: 'bottom' },
		icons: {
			play: [
				[
					// equilateral triangle
					new Polar(13, 0).toCartesian(),
					new Polar(13, (120 * Math.PI) / 180).toCartesian(),
					new Polar(13, (240 * Math.PI) / 180).toCartesian(),
				],
			],
			pause: [
				[
					// left pause icon bar
					new Cartesian(-8, -8),
					new Cartesian(-3, -8),
					new Cartesian(-3, 8),
					new Cartesian(-8, 8),
				],
				[
					// right pause icon bar
					new Cartesian(3, -8),
					new Cartesian(8, -8),
					new Cartesian(8, 8),
					new Cartesian(3, 8),
				],
			],
		},
	}

	preload = () => {
		//this.audio = new p5.SoundFile('assets/audio/vivaldi--four-seasons-spring--128kbps.mp3', (...args) => {
		//this.audio = new p5.SoundFile('assets/audio/lindsey-sterling--zi-zis-journey--128kbps.mp3', (...args) => {
		this.audio = new p5.SoundFile('assets/audio/lindsey-sterling--elements--128kbps.mp3', (...args) => {
			console.log('success', args)
			this.canPlayAudio = true
			this.audio.setVolume(1.0)

			this.renderContext.mouseClicked(() => {
				if (!this.playPauseButtonClicked()) {
					return
				}

				if (this.audio.isPlaying()) {
					this.audio.pause()
					//this.noLoop()
				} else {
					this.audio.play()

					//this.loop()
				}
			})
		})

		//this.spectra = this.loadJSON('assets/data/fe.json')
		this.spectra = {}

		const callback = (spectra: any) => {
			for (let prop in spectra) {
				this.spectra[prop] = spectra[prop]
			}
		}

		this.loadJSON('assets/data/fe.json', undefined, undefined, callback)
		//this.loadJSON('assets/data/h.json', undefined, undefined, callback)
	}

	setup = () => {
		this.colorMode(this.RGB, 255, 255, 255, 1.0)
		this.createCanvas(this.windowWidth, this.windowHeight)
		this.strokeCap(this.SQUARE)
		//this.filter(this.BLUR, 10)

		// 0.8 = default smoothing of FFT
		this.soundTransform = new p5.FFT(0.8, this.samples)

		//this.oscillator = new p5.Oscillator(19000)
		//const o2 = new p5.Oscillator(15970)
		//o2.start()
		//this.oscillator.freq(o2)
		//this.oscillator.start()
	}

	draw = () => {
		this.clear()
		this.analyzeAudio()
		this.render()
	}

	render = () => {
		if (this.canPlayAudio && this.audio.isPlaying()) {
			this.renderVisibleSpectrumAsCircle()
			this.renderVisibleSpectrum()
			this.renderVisibleSpectrumWaveformLine()
		}
		this.canPlayAudio && this.renderPlayPauseButton(this.audio.isPlaying())

		this.renderElementSpectra()
	}

	private renderElementSpectra = () => {
		this.push()

		this.strokeWeight(0.25)
		let y = 200
		const height = 89

		for (let element in this.spectra) {
			const spectra = this.spectra[element] as Array<{ wavelength: number; transitionStrength?: number }>
			const strengths = spectra.filter((entry) => !!entry.transitionStrength).map((entry) => entry.transitionStrength)
			const min = Math.min(...strengths)
			const max = Math.max(...strengths)

			spectra.forEach((entry) => {
				this.setStrokeFromVisibleWavelength(
					entry.wavelength,
					!entry.transitionStrength ? 0 : this.map(entry.transitionStrength, min, max, 0, 1000)
				)
				const x = this.map(entry.wavelength, Color.MIN_VISIBLE_WAVELENGTH, Color.MAX_VISIBLE_WAVELENGTH, 0, this.width)
				this.line(x, y, x, y + height)
			})

			y += height
		}

		this.pop()
	}

	private renderVisibleSpectrum = () => {
		this.push()

		const strokeWeight = this.width / this.samples
		const strokeOffset = strokeWeight * 0.5

		this.strokeWeight(strokeWeight + 0.75) // +0.75 to close gaps due to rounding error

		for (let s = 0; s < this.samples; ++s) {
			const x = this.map(s, 0, this.samples, 0, this.width)

			this.setStrokeVisibleSpectrumColorForSample(s, this.samples, this.audioAnalysis.analyze[s])
			this.line(x + strokeOffset, 0, x + strokeOffset, 55)

			//this.setStrokeVisibleSpectrumColorForSample(s, this.samples, this.audioAnalysis.waveform[s])
			this.stroke(0x30, 0x30, 0x30, this.audioAnalysis.waveform[s])
			this.line(x + strokeOffset, 55, x + strokeOffset, 110)
		}

		this.pop()
	}

	private renderVisibleSpectrumAsCircle = () => {
		this.push()
		const verticalSpace = (this.height - 110) * 0.5 + 100
		this.translate(this.width * 0.5, verticalSpace) //this.height * 0.5)

		const angle = (Math.PI * 2) / this.samples
		this.strokeWeight(1.5)

		for (let s = 0; s < this.samples; ++s) {
			this.push()
			this.setStrokeVisibleSpectrumColorForSample(s, this.samples, this.audioAnalysis.analyze[s])
			//this.scale(1 + this.audioAnalysis.average.analyze * 2)
			this.rotate(s * angle)
			this.line(0, -144, 0, -233)
			/*
			this.beginShape()
			this.vertex(0, -144)
			this.vertex(0, -233)
			this.endShape()
			*/
			this.pop()

			this.push()
			this.stroke(0x30, 0x30, 0x30, this.audioAnalysis.waveform[s])
			//this.setStrokeVisibleSpectrumColorForSample(s, this.samples, this.audioAnalysis.waveform[s])
			//this.scale(this.audioAnalysis.average.waveform * 2)
			this.rotate(s * angle)

			this.line(0, -89, 0, -144)
			/*
			this.beginShape()
			this.vertex(0, -89)
			this.vertex(0, -144)
			this.endShape()
			*/
			this.pop()
		}

		this.pop()
	}

	private renderVisibleSpectrumWaveformLine = () => {
		this.push()

		this.noFill()
		this.strokeWeight(3)
		this.stroke(0x30)

		const angle = (Math.PI * 2) / this.samples

		// Monochrome variation
		this.beginShape()
		for (let s = 0; s < this.samples; ++s) {
			/*
			const point = new Polar(this.audioAnalysis.waveform[s] * 10, angle * s).toCartesian()
			//console.log(this.audioAnalysis.waveform[s] *)
			this.vertex(point.x, point.y)
			*/
			const x = this.map(s, 0, this.audioAnalysis.waveform.length, 0, this.width)
			const y = this.map(this.audioAnalysis.waveform[s], -1, 1, 0, this.height)

			this.vertex(x, y + 100)
		}
		this.endShape()

		/*
		// Colorized variation
		for (let s = 1; s < this.samples; ++s) {
			const x1 = this.map(s - 1, 0, this.audioAnalysis.waveform.length, 0, this.width)
			const y1 = this.map(this.audioAnalysis.waveform[s-1], -1, 1, 0, this.height)
			const x2 = this.map(s, 0, this.audioAnalysis.waveform.length, 0, this.width)
			const y2 = this.map(this.audioAnalysis.waveform[s], -1, 1, 0, this.height)

			this.setStrokeVisibleSpectrumColorForSample(s, this.samples, this.audioAnalysis.waveform[s])
			this.line(x1, y1 + 100, x2, y2 + 100)
		}*/

		this.pop()
	}

	private setStrokeVisibleSpectrumColorForSample = (current: number, samples: number, alpha: number = 1) => {
		const value = this.map(current, 0, samples, Color.MIN_VISIBLE_WAVELENGTH, Color.MAX_VISIBLE_WAVELENGTH)
		this.setStrokeFromVisibleWavelength(value)
	}

	private setStrokeFromVisibleWavelength = (wavelength: number, alpha: number = 1) => {
		const color = Color.fromWavelength(wavelength)
		this.stroke(color.r, color.g, color.b, alpha)
	}

	private analyzeAudio = () => {
		// 1) normalize frequency spectrum (e.g. to map alpha channel value range)
		// 2) reverse frequency spectrum in order to have highest frequency first (maps to visible spectrum wavelengths)
		const analyze = this.soundTransform
			.analyze()
			.map((amplitude) => amplitude / 255)
			.reverse()
		const waveform = this.soundTransform.waveform().map((amplitude) => this.map(amplitude, -1, 1, 0, 1))

		//this.audio.setVolume(1)
		this.audioAnalysis = {
			analyze,
			waveform,
			average: {
				analyze: analyze.reduce((prev, curr) => prev + curr, 0) / analyze.length,
				waveform: waveform.reduce((prev, curr) => prev + curr, 0) / waveform.length,
			},
		}
		//this.audio.setVolume(0)
	}

	private renderPlayPauseButton = (playing: boolean) => {
		const bounds = this.getButtonBounds()
		const icons = this.playPauseButtonSettings.icons
		const icon = playing ? icons.pause : icons.play

		this.push()

		this.fill(255, 212, 0)
		this.rect(bounds.x, bounds.y, bounds.width, bounds.height)

		this.translate(bounds.center.x, bounds.center.y)

		this.fill(48, 48, 48)
		this.renderIcon(icon)

		this.pop()
	}

	private renderIcon = (icon: Cartesian[][]) => {
		icon.forEach((shape) => {
			this.beginShape()
			shape.forEach((point) => this.vertex(point.x, point.y))
			this.endShape()
		})
	}

	private getButtonBounds = () => {
		const { width, height, margin, alignment } = this.playPauseButtonSettings
		let x = margin.left,
			y = margin.top

		if (alignment.horizontal === 'center') {
			x = this.width * 0.5 - width * 0.5
		} else if (alignment.horizontal === 'right') {
			x = this.width - (width + margin.right)
		}

		if (alignment.vertical === 'middle') {
			y = this.height * 0.5 - height * 0.5
		} else if (alignment.vertical === 'bottom') {
			y = this.height - (height + margin.bottom)
		}

		// prettier-ignore
		return {
			x, y, width, height,
			center: {
				x: x + width * 0.5,
				y: y + height * 0.5,
			},
		}
	}

	private getButtonEdgeMetrics = () => {
		const bounds = this.getButtonBounds()

		return {
			left: bounds.x,
			right: bounds.x + bounds.width,
			top: bounds.y,
			bottom: bounds.y + bounds.height,
		}
	}

	private playPauseButtonClicked = () => {
		const { top, right, bottom, left } = this.getButtonEdgeMetrics()
		const x = this.mouseX,
			y = this.mouseY

		return x > left && x <= right && y > top && y <= bottom
	}

	windowResized = () => {
		this.resizeCanvas(this.windowWidth, this.windowHeight)
		this.background(48, 48, 48)
	}
}
