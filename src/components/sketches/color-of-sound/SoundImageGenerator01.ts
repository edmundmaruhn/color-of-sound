import { Sketch } from '../../base/Sketch'
import { Buffer } from '../../image/Buffer'
import { Sound } from '../../Sound'
import { Cartesian } from '../../geometry/Point'
import { Size } from '../../geometry/Size'
import { PlayPauseButton } from '../../ui/PlayPauseButton'
import { Color } from '../../physics/Color'

import { Asset } from '../../Asset'
import { Adjustment } from '../../color/Adjustment'
import * as p5 from 'p5'

/**
 * Plays a given audio asset, renders the frequency spectrum  over time to an image buffer and generates a sequence of
 * images which are downloaded automatically.
 * 
 * The acoustic frequency spectrum is mapped to the visible light spectrum. The according wavelength of each mapped
 * frequency is used to convert it into a RGB representation of the visible light spectrum. The frequency's amplitude
 * (energy) is applied as alpha (transparency) and the resulting RGBA value is stored as pixel.
 * 
 * The resolution (given by the internal samples property) is stored horizontally (x-axis) and therefore defines the
 * width of the resulting image(s). The time domain is given vertically and its resolution depends on the framerate
 * (60fps by default).
 */
export class SoundImageGenerator01 extends Sketch {
	private samples = 2048

	private buffer: Buffer
	private audioSource = Asset.Sound.LINDSEY_STERLING__HEIST__128_KBPS
	private audio: Sound
	private volume = 1.0

	private button: PlayPauseButton

	private contrast = 127

	constructor() {
		super()

		this.buffer = new Buffer(this, { position: new Cartesian(), size: new Size(this.samples, this.samples / 2) })
		this.buffer.bufferComplete = this.bufferCompleteHandler
		this.button = new PlayPauseButton(this)

		this.audio = new Sound(this.audioSource.location, this, {
			resolution: this.samples,
		})
	}

	preload = () => {
		this.audio.load(this.audioLoadHandler)
	}

	setup = () => {
		this.colorMode(this.RGB, 255, 255, 255, 1.0)
		this.createCanvas(this.windowWidth, this.windowHeight)

		this.buffer.flushOnAdd = true
		this.buffer.setup()
	}

	draw = () => {
		this.clear()
		this.render()
	}

	render = () => {
		if (this.audio.sound && !this.audio.sound.isPlaying()) {
			//this.button.state = 'pause'
		}

		this.buffer.render()
		this.button.visible && this.audio.soundTransform.setup()
		this.button.state === 'play' && this.addFrequencySpectrumToImageBuffer()
		this.button.render()
	}

	private addFrequencySpectrumToImageBuffer = () => {
		const frequencies = this.audio.soundTransform.frequencySpectrum
		const { resolution } = this.audio.soundTransform.configuration

		const pixels = frequencies.map((frequency, position) => {
			const wavelength = this.map(position, 0, resolution, Color.MIN_VISIBLE_WAVELENGTH, Color.MAX_VISIBLE_WAVELENGTH)
			const rgb = Color.fromWavelength(wavelength)

			return Color.toARGBInteger(rgb, frequency)
			//const withChangedContrast = Adjustment.contrastFromRGB(rgb, this.contrast)
			//return Color.toARGBInteger(Color.fromInteger(withChangedContrast), frequency)
		})

		this.buffer.add(...pixels)
	}

	private audioLoadHandler = (sound: Sound) => {
		this.button.visible = true
		sound.sound.setVolume(this.volume)
		this.renderContext.mouseClicked(this.clickHandler)
	}

	private clickHandler = () => {
		if (this.button.hitTest()) {
			this.audio.togglePlayPause()
			this.button.state = this.audio.sound.isPlaying() ? 'play' : 'pause'
		}
	}

	private bufferCompleteHandler = (pixels: Array<number>, completionCount: number) => {
		const { metrics } = this.buffer
		const image = this.createImage(metrics.size.width, metrics.size.height)
		const index = completionCount.toString().padStart(3, '0')
		const filename = `${this.audioSource.name}--${this.audio.soundTransform.configuration.resolution}--${index}`
		const extension = 'png'

		image.loadPixels()
		pixels.forEach((value, index) => (image.pixels[index] = value))
		image.updatePixels()

		console.log(`Buffer complete. Write image to ${filename}.${extension}`)
		image.save(filename, extension)
	}

	windowResized = () => {
		this.resizeCanvas(this.windowWidth, this.windowHeight)
		this.background(48, 48, 48)
	}
}
