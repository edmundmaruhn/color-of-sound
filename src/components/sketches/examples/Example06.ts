import { Sketch } from '../../base/Sketch'
import { Color } from '../../physics/Color'
import { Cartesian, Polar } from '../../geometry/Point'
import { Sound } from '../../Sound'

import '../../../assets/audio/lindsey-sterling--elements--128kbps.mp3'
import '../../../assets/audio/lindsey-sterling--zi-zis-journey--128kbps.mp3'
import '../../../assets/audio/vivaldi--four-seasons-spring--128kbps.mp3'

export class Example06 extends Sketch {
	private samples = 2048

	private audio: Sound
	private canPlayAudio: boolean = false

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
		this.audio = new Sound('assets/audio/lindsey-sterling--elements--128kbps.mp3', this, {
			resolution: this.samples,
			waveformEnabled: true,
		})

		this.audio.load((sound) => {
			console.log(sound)

			this.canPlayAudio = true

			sound.sound.setVolume(1.0)

			this.renderContext.mouseClicked(() => {
				if (!this.playPauseButtonClicked()) {
					return
				}

				sound.togglePlayPause()
			})
		})
	}

	setup = () => {
		this.colorMode(this.RGB, 255, 255, 255, 1.0)
		this.createCanvas(this.windowWidth, this.windowHeight)
		this.strokeCap(this.SQUARE)
	}

	draw = () => {
		this.clear()
		this.render()
	}

	render = () => {
		if (this.canPlayAudio && this.audio.sound.isPlaying()) {
			this.audio.soundTransform.setup()
			this.renderVisibleSpectrumWaveformLine()
			this.renderVisibleSpectrumAsCircle()
			this.renderVisibleSpectrum()
		}
		this.canPlayAudio && this.renderPlayPauseButton(this.audio.sound.isPlaying())
	}

	private renderVisibleSpectrum = () => {
		const soundTransform = this.audio.soundTransform
		const strokeWeight = this.width / soundTransform.configuration.resolution
		const strokeOffset = strokeWeight * 0.5

		this.push()

		this.strokeWeight(strokeWeight + 0.75) // +0.75 to close gaps due to rounding error

		//soundTransform.forEach((frequency, waveform, position, configuration) => {})
		soundTransform.forEach((frequency, waveform, position, configuration) => {
			const x = this.map(position, 0, configuration.resolution, 0, this.width)

			this.setStrokeVisibleSpectrumColorForSample(position, configuration.resolution, frequency)
			this.line(x + strokeOffset, 0, x + strokeOffset, 55)

			this.setStrokeVisibleSpectrumColorForSample(position, configuration.resolution, waveform)
			this.line(x + strokeOffset, 55, x + strokeOffset, 110)
		})

		this.pop()
	}

	private renderVisibleSpectrumAsCircle = () => {
		const soundTransform = this.audio.soundTransform

		const verticalSpace = (this.height - 110) * 0.5 + 100
		const angle = (Math.PI * 2) / soundTransform.configuration.resolution

		this.push()

		this.translate(this.width * 0.5, verticalSpace)

		soundTransform.forEach((frequency, waveform, position, configuration) => {
			this.push()

			this.strokeWeight(1.5)
			this.setStrokeVisibleSpectrumColorForSample(position, configuration.resolution, frequency)
			this.rotate(position * angle)

			this.beginShape()
			this.vertex(0, -144)
			this.vertex(0, -233)
			this.endShape()

			this.pop()

			this.push()

			this.strokeWeight(0.75)
			this.setStrokeVisibleSpectrumColorForSample(position, configuration.resolution, waveform)
			this.rotate(position * angle)

			this.beginShape()
			this.vertex(0, -89)
			this.vertex(0, -144)
			this.endShape()

			this.pop()
		})

		this.pop()
	}

	private renderVisibleSpectrumWaveformLine = () => {
		this.push()

		this.noFill()
		this.strokeWeight(3)

		let previous: { x: number; y: number }

		this.audio.soundTransform.forEach((frequency, waveform, position, configuration) => {
			const x = this.map(position, 0, configuration.resolution, 0, this.width)
			const y = this.map(waveform, -1, 1, 0, this.height)

			if (previous) {
				this.stroke(0x30 * (1 + waveform), 0x30, 0x30, Math.min(Math.abs(this.map(waveform, 0, 1, -1, 1)) + 0.25, 1))
				this.line(previous.x, previous.y, x, y)
			}

			previous = { x, y }
		})

		this.pop()
	}

	private setStrokeVisibleSpectrumColorForSample = (current: number, samples: number, alpha: number = 1) => {
		const value = this.map(current, 0, samples, Color.MIN_VISIBLE_WAVELENGTH, Color.MAX_VISIBLE_WAVELENGTH)
		this.setStrokeFromVisibleWavelength(value, alpha)
	}

	private setStrokeFromVisibleWavelength = (wavelength: number, alpha: number = 1) => {
		const color = Color.fromWavelength(wavelength)
		this.stroke(color.r, color.g, color.b, alpha)
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
