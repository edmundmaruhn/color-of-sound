import * as p5 from 'p5'
import { Cartesian, Polar } from '../geometry/Point'

type State = 'play' | 'pause'

export class PlayPauseButton {
	constructor(private context: p5) {}

	private _visible: boolean = false

	get visible(): boolean {
		return this._visible
	}

	set visible(value: boolean) {
		this._visible = value
	}

	private _state: State = 'pause'

	get state(): State {
		return this._state
	}

	set state(value: State) {
		this._state = value
	}

	render = () => {
		if (this.visible) {
			this.renderPlayPauseButton(this.state === 'play')
		}
	}

	private renderPlayPauseButton = (playing: boolean) => {
		const bounds = this.getButtonBounds()
		const icons = playPauseButtonSettings.icons
		const icon = playing ? icons.pause : icons.play

		this.context.push()

		this.context.fill(255, 212, 0)
		this.context.rect(bounds.x, bounds.y, bounds.width, bounds.height)

		this.context.translate(bounds.center.x, bounds.center.y)

		this.context.fill(48, 48, 48)
		this.renderIcon(icon)

		this.context.pop()
	}

	private renderIcon = (icon: Cartesian[][]) => {
		icon.forEach((shape) => {
			this.context.beginShape()
			shape.forEach((point) => this.context.vertex(point.x, point.y))
			this.context.endShape()
		})
	}

	private getButtonBounds = () => {
		const { width, height, margin, alignment } = playPauseButtonSettings
		let x = margin.left,
			y = margin.top

		if (alignment.horizontal === 'center') {
			x = this.context.width * 0.5 - width * 0.5
		} else if (alignment.horizontal === 'right') {
			x = this.context.width - (width + margin.right)
		}

		if (alignment.vertical === 'middle') {
			y = this.context.height * 0.5 - height * 0.5
		} else if (alignment.vertical === 'bottom') {
			y = this.context.height - (height + margin.bottom)
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

	public hitTest = () => {
		const { top, right, bottom, left } = this.getButtonEdgeMetrics()
		const x = this.context.mouseX,
			y = this.context.mouseY

		return x > left && x <= right && y > top && y <= bottom
	}
}

const playPauseButtonSettings = {
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
