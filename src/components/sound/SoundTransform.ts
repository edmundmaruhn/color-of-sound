import * as p5 from 'p5'

export interface Configuration {
	/**
	 * Defines the resolution (amount of bins) of sound analyses. It specifies the number of elements in the
	 * {@link SoundTransform.frequencySpectrum} and {@link SoundTransform.waveform} properties.
	 *
	 * Must be a power of 2 between 16 and 2^15.
	 *
	 * @default 1024
	 */
	readonly resolution?: number

	/**
	 * Determines how strongly values will be smoothed when analyzing the frequency spectrum. Must be a value in the
	 * range of 0 < x < 1.0
	 *
	 * @default 0.8
	 */
	readonly smoothing?: number

	/**
	 * Indicates whether to perform frequency analysis on setup.
	 * If disabled the {@link SoundTransform.frequencySpectrum} property contains zero for all frequencies.
	 *
	 * @default true
	 */
	readonly frequenciesEnabled?: boolean
	/**
	 * Indicates whether to perform a waveform analysis on setup.
	 * If disabled the {@link SoundTransform.waveform} property contains zero for all bins.
	 *
	 * @default false
	 */
	readonly waveformEnabled?: boolean

	/**
	 * Indicates whether to normalize analyzed spectrum values. If set to true, it will map all values from the
	 * frequency spectrum and waveform to the range of 0 to 1.
	 * If set to false, frequency spectrum values are in the range of 0 to 255 and waveform values are in the range of
	 * -1 to 1.
	 *
	 * @default true
	 */
	readonly normalize?: boolean
}

const defaultConfiguration: Required<Configuration> = {
	resolution: 1024,
	smoothing: 0.8,
	frequenciesEnabled: true,
	waveformEnabled: false,
	normalize: true,
}

export class SoundTransform {
	private transform: p5.FFT

	readonly configuration: Required<Configuration>

	constructor(private context: p5, private source: p5.SoundFile | p5.Oscillator, configuration?: Configuration) {
		this.configuration = { ...defaultConfiguration, ...configuration }

		this.transform = new p5.FFT(this.configuration.smoothing, this.configuration.resolution)
		this.transform.setInput(source)

		this._frequencySpectrum = new Array(this.configuration.resolution).fill(0)
		this._waveform = new Array(this.configuration.resolution).fill(0)
	}

	/**
	 * Sets up the sound transform for data access. Must be called before you can access new frequency spectrum and
	 * waveform data. Best done in your p5's draw() function for continuous sound analysis.
	 *
	 * @returns The SoundTransform instance.
	 */
	setup = (): this => {
		this.setupFrequencySpectrum()
		this.setupWaveform()
		return this
	}

	private setupFrequencySpectrum = () => {
		const { frequenciesEnabled, normalize } = this.configuration
		let values = frequenciesEnabled ? this.transform.analyze() : this._frequencySpectrum

		if (frequenciesEnabled && normalize) {
			values = values.map((amplitude) => this.context.map(amplitude, 0, 255, 0, 1))
		}

		this._frequencySpectrum = values.reverse()
	}

	private setupWaveform = () => {
		const { waveformEnabled, normalize } = this.configuration
		let values = waveformEnabled ? this.transform.waveform() : this._waveform

		if (waveformEnabled && normalize) {
			values = values.map((amplitude) => this.context.map(amplitude, -1, 1, 0, 1))
		}

		this._waveform = values
	}

	private _frequencySpectrum: Array<number>

	/**
	 * The frequency spectrum at the moment when {@link setup} was called. The number of values is determined by the
	 * {@link SoundTransformConfiguration.resolution} configuration.
	 *
	 * This property will always provide a shallow copy decoupled from the internally stored array.
	 */
	get frequencySpectrum(): Array<number> {
		return this._frequencySpectrum.slice()
	}

	private _waveform: Array<number>

	/**
	 * The waveform data at the moment when {@link setup} was called. The number of values is determined by the
	 * {@link SoundTransformConfiguration.resolution} configuration.
	 *
	 * This property will always provide a shallow copy decoupled from the internally stored array.
	 */
	get waveform(): Array<number> {
		return this._waveform.slice()
	}

	/**
	 * Invokes the given callback on each discrete data point available passing it the frequency, waveform and position
	 * in the spectrum (bin). Be aware that the frequency and waveform values are zero for all bins, when the sound
	 * transform object was configured with frequency spectrum and/or waveform analysis disabled. Same is true for a
	 * source sound currently not playing.
	 * 
	 * @param callback The callback to invoke on each data point
	 */
	forEach = (callback: (frequency: number, waveform: number, bin: number, configuration: Required<Configuration>) => void) => {
		this._frequencySpectrum.forEach((value, index) => callback(value, this._waveform[index], index, this.configuration))
	}
}
