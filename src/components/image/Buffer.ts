import * as p5 from 'p5'
import { Cartesian } from '../geometry/Point'
import { Size } from '../geometry/Size'

interface Metrics {
	readonly position: Cartesian
	readonly size: Size
}

export class Buffer {
	private buffer: Array<number>
	private bufferSize: number
	private position: number = 0

	private image: p5.Image

	constructor(private context: p5, readonly metrics: Metrics) {
		this.buffer = []
		this.bufferSize = metrics.size.width * metrics.size.height
	}

	flushOnAdd: boolean = false

	private _completionCount: number = 0

	get completionCount(): number {
		return this._completionCount
	}

	/**
	 * Creates the image the buffer operates on and adds it to the scene.
	 */
	setup = () => {
		if (!this.image) {
			this.image = this.context.createImage(this.metrics.size.width, this.metrics.size.height)
			this.image.loadPixels()

			this.add() // add no value, just trigger automatic flush
		}

		return this
	}

	/**
	 * Adds the given values to the buffer. When the buffer is full it is flushed automatically to the image the buffer
	 * operates on. The buffer is considered full, when width x height pixel values have been added.
	 *
	 * This function can be used before {@link setup} in order to pre-fill the buffer with pixel data. The last full
	 * buffer will be used when the underlying image has been set up and previous full buffers are discarded.
	 *
	 * @param values The pixel data to add to the buffer. Values are expected as integers in ARGB format.
	 */
	add = (...values: Array<number>) => {
		this.buffer.push(...values)

		if (this.flushOnAdd || this.buffer.length >= this.bufferSize) {
			//console.log(`buffer size ${this.bufferSize} reached`)
			//console.log(this.buffer)
			this.flush()
		}
	}

	render = () => {
		this.image && this.context.image(this.image, this.metrics.position.x, this.metrics.position.y)
	}

	/**
	 * Immediately flushes the buffer into the image it operates on. Has no effect when setup was not called.
	 * The buffer is completely flushed, so in case of an overflow it will leak into the image from the beginning.
	 */
	flush = () => {
		if (this.image) {
			this.flushBuffer()
		}
	}

	/**
	 * Callback invoked when the buffer has been completely filled, which is the case each time the metrics'
	 * width * height has been reached.
	 */
	bufferComplete: (pixels: Array<number>, completionCount: number) => void

	private flushBuffer = () => {
		//console.log('flushing buffer')
		//console.log(this.buffer)
		this.buffer.forEach((pixel, index) => {
			const position = this.position * 4
			const pixels = this.image.pixels

			// position is zero-based, bufferSize is one-based
			if (this.position === this.bufferSize - 1 && typeof this.bufferComplete === 'function') {
				++this._completionCount
				this.bufferComplete(pixels.slice(), this._completionCount)
			}

			pixels[position + 3] = (pixel >> 24) & 0xff // alpha
			pixels[position] = (pixel >> 16) & 0xff // red
			pixels[position + 1] = (pixel >> 8) & 0xff // green
			pixels[position + 2] = pixel & 0xff // blue

			this.position = (this.position + 1) % this.bufferSize
		})

		this.buffer = []
		this.image.updatePixels()
	}
}
