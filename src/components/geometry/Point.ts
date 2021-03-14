export class Cartesian {
	constructor(readonly x: number = 0, readonly y: number = 0) {}

	rotate(angle: number) {
		return this.toPolar().rotate(angle).toCartesian()
	}

	around(angle: number, x: number, y: number) {}

	scale(factor: number) {
		return new Cartesian(this.x * factor, this.y * factor)
	}

	translate(dx: number, dy: number) {
		return new Cartesian(this.x + dx, this.y + dy)
	}

	toPolar(): Polar {
		return new Polar(
			Math.sqrt(this.x * this.x + this.y * this.y), // length
			Math.atan2(this.y, this.x) // angle
		)
	}
}

export class Polar {
	constructor(readonly length: number, readonly angle: number) {}

	rotate(angle: number) {
		return new Polar(this.length, this.angle + angle)
	}

	scale(factor: number) {
		return new Polar(this.length * factor, this.angle)
	}

	translate(dx: number, dy: number) {
		return this.toCartesian().translate(dx, dy).toPolar()
	}

	toCartesian(): Cartesian {
		return new Cartesian(
			this.length * Math.cos(this.angle), // x
			this.length * Math.sin(this.angle) // y
		)
	}
}
