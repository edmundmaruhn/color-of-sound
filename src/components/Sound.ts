import * as p5 from 'p5'
import { SoundTransform, Configuration } from './sound/SoundTransform'

/**
 * A wrapper component for a {@link p5.SoundFile} that provides a {@link SoundTransform} instance once the sound has
 * been loaded.
 */
export class Sound {
	constructor(readonly source: string, private context: p5, private configuration?: Configuration) {}

	load = (success: (sound: Sound) => void) => {
		if (!this._sound) {
			this._sound = new p5.SoundFile(this.source, () => {
				this._loaded = true
				success(this)
			})
		}
	}

	private _sound: p5.SoundFile

	/**
	 * The p5.SoundFile that loaded the {@link Sound.source}.
	 */
	get sound(): p5.SoundFile {
		return this._sound
	}

	private _loaded: boolean = false

	get loaded(): boolean {
		return this._loaded
	}

	private _soundTransform: SoundTransform

	/**
	 * Becomes available after a successful load.
	 */
	get soundTransform(): SoundTransform {
		if (this.sound && !this._soundTransform) {
			this._soundTransform = new SoundTransform(this.context, this.sound, this.configuration)
		}

		return this._soundTransform
	}

	togglePlayPause = () => {
		if (!this.sound) {
			return
		}

		this.sound.isPlaying() ? this.sound.pause() : this.sound.play()
	}
}
