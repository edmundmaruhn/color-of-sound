import * as p5 from 'p5'
import { Sketch } from '../../base/Sketch'
import { Element, ElementCollection, WavelengthData } from '../../physics/spectrum/Types'
import { PlayPauseButton } from '../../ui/PlayPauseButton'

import '../../../assets/data/spectra/elements/fe.json'
import { Color } from '../../physics/Color'

type ElementAbbreviations = 'Fe'

export class PeriodicTableEmissionSound01 extends Sketch {
	private oscillator: p5.Oscillator
	private modulators: Array<p5.Oscillator>

	private button: PlayPauseButton

	private spectra: ElementCollection<ElementAbbreviations>

	constructor() {
		super()
		this.spectra = {} as any
		this.button = new PlayPauseButton(this)
	}

	preload = () => {
		this.loadJSON('assets/data/fe.json', undefined, undefined, (spectra: Element<ElementAbbreviations>) => {
			this.spectra[spectra.abbreviation] = spectra

			// for now: sort out all entries not having a transition strength value
			spectra.spectra = spectra.spectra.filter((entry) => typeof entry !== 'number' && !!entry.transitionStrength)

			this.setupOscillation()
			this.button.visible = true
			this.renderContext.mouseClicked(this.clickHandler)
		})
	}

	setup = () => {
		this.colorMode(this.RGB, 255, 255, 255, 1.0)
		this.createCanvas(this.windowWidth, this.windowHeight)
	}

	draw = () => {
		this.clear()
		this.button.render()
		this.renderSpectra()
	}

	private renderSpectra = () => {
		const spectra = this.spectra.Fe ? this.spectra.Fe.spectra : []
		// relies on the spectra filter in preload()
		const strengths = spectra.map((entry) => (entry as WavelengthData).transitionStrength)

		const min = Math.min(...strengths)
		const max = Math.max(...strengths)
		const y = 0
		const height = 144

		this.push()

		spectra.forEach((data: WavelengthData) => {
			const alpha = this.map(data.transitionStrength * 10, min, max, 0, 1)
			this.setStrokeFromVisibleWavelength(data.wavelength, alpha)

			const x = this.map(data.wavelength, Color.MIN_VISIBLE_WAVELENGTH, Color.MAX_VISIBLE_WAVELENGTH, 0, this.width)
			this.line(x, y, x, y + height)
		})

		this.pop()
	}

	private setStrokeFromVisibleWavelength = (wavelength: number, alpha: number = 1) => {
		const color = Color.fromWavelength(wavelength)
		this.stroke(color.r, color.g, color.b, alpha)
	}

	private setupOscillation = () => {
		console.log('Setup oscillation')
		const nano2base = 1e-9 // nm to m
		const lightSpeed = 299792458 // m/s
		const min = lightSpeed / (Color.MIN_VISIBLE_WAVELENGTH * nano2base)
		const max = lightSpeed / (Color.MAX_VISIBLE_WAVELENGTH * nano2base)

		const spectrum = this.spectra.Fe

		const data = spectrum.spectra.map((info: WavelengthData) => {
			const wavelength = typeof info === 'number' ? info : info.wavelength
			const frequency = this.map(lightSpeed / (wavelength * nano2base), min, max, 20, 20000) // wavelength = velocity / frequency ==> frequency = velocity / wavelength
            const amplitude = this.map(info.transitionStrength, min, max, 0, 1)


			return {frequency, amplitude}
		})

		console.log(data)

		this.oscillator = new p5.Oscillator(data[0].frequency)
        this.oscillator.amp(data[0].amplitude)
		this.modulators = []

		const modulations = data.slice(1)

		modulations.forEach((data) => {
			const modulator = new p5.Oscillator(data.frequency)
            modulator.amp(data.amplitude)

			this.oscillator.freq(modulator)
			this.modulators.push(modulator)
		})
	}

	private startOscillation = () => {
		this.oscillator.start()
		this.modulators.forEach((modulator) => modulator.start())
	}

    private stopOscillation = () => {
        this.oscillator.stop(0.1)
		this.modulators.forEach((modulator) => modulator.stop(0.1))
    }

	private clickHandler = () => {
		if (this.button.hitTest()) {
            if (this.button.state === 'play') {
                this.stopOscillation()
                this.button.state = 'pause'
            } else {
                this.button.state = 'play'
                this.startOscillation()
            }
		}
	}

	windowResized = () => {
		this.resizeCanvas(this.windowWidth, this.windowHeight)
		this.background(48, 48, 48)
	}
}
