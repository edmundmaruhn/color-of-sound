import * as p5 from 'p5'

export enum Palette {
	Primary = 0xffd400,
	White = 0xf8f8f8,
	Black = 0x303030,
}



export class Color {
	constructor(private p: p5) {}

	rgb(color: Palette) {
		const p = this.p
		const c = p.color(color)
		return [p.red(c), p.green(c), p.blue(c)]
	}
}
