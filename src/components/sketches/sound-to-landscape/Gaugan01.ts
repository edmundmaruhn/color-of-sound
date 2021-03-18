/**
 * This sketch is used to generate segmentation maps for the IA-based GauGAN landscape generator of NVIDIA
 */

import * as p5 from 'p5'
import { Asset } from '../../Asset'
import { Sketch } from '../../base/Sketch'

export class Gaugan01 extends Sketch {
	private asset = Asset.Images.Spectograms.LindseySterling.Elements.Res2048[6]
	private spectogram: p5.Image

	constructor() {
		super()
	}

	preload = () => {
		this.spectogram = this.loadImage(this.asset.location, this.spectogramCompleteHandler)
	}

	setup = () => {
		this.colorMode(this.RGB, 255, 255, 255, 1.0)
		this.createCanvas(this.windowWidth, this.windowHeight)
	}

	draw = () => {
		this.clear()
		this.spectogram && this.image(this.spectogram, 0, 0)
	}

	private spectogramCompleteHandler = () => {
		this.spectogram.loadPixels()
		const size = this.spectogram.width * this.spectogram.height

		for (let i = 0; i < size; ++i) {
			const position = i * 4

			let r = this.spectogram.pixels[position]
			let g = this.spectogram.pixels[position + 1]
			let b = this.spectogram.pixels[position + 2]
			let a = this.spectogram.pixels[position + 3]
			let color: number

			a = this.map(a, 0, 255, 0, 1)

			if (a < 0.25) {
				color = segmentationColors.grass
			} else if (a < 0.5) {
				color = segmentationColors.sky
			} else if (a < 0.75) {
				color = segmentationColors.wood
			} else {
				color = segmentationColors.straw
			}

			this.spectogram.pixels[position] = (color >> 16) & 0xff
			this.spectogram.pixels[position + 1] = (color >> 8) & 0xff
			this.spectogram.pixels[position + 2] = (color >> 0) & 0xff
			this.spectogram.pixels[position + 3] = 255
		}

		this.spectogram.updatePixels()
		this.spectogram.save(`${this.asset.name}-segmentation`, 'png')
	}
}

/**
 * Colors extracted from showcase website
 * @see http://nvidia-research-mingyuliu.com/gaugan/
 */
const segmentationColors = {
	bridge: 0x5e5bc5,
	bush: 0x606e32,
	clouds: 0x696969,
	dirt: 0x6e6e28,
	fence: 0x706419,
	flower: 0x760000,
	fog: 0x77ba1d,
	grass: 0x7bc800,
	gravel: 0x7c32c8,
	groundOther: 0x7d3054,
	hill: 0x7ec864,
	house: 0x7f4502,
	mountain: 0x869664,
	mud: 0x87716f,
	pavement: 0x8b3027,
	platform: 0x8f2a91,
	river: 0x9364c8,
	road: 0x946e28,
	rock: 0x956432,
	roof: 0x9600b1,
	sand: 0x999900,
	sea: 0x9ac6da,
	sky: 0x9ceedd,
	snow: 0x9e9eaa,
	stone: 0xa1a164,
	straw: 0xa2a3eb,
	tree: 0xa8c832,
	wallBrick: 0xaad16a,
	wallStone: 0xae2974,
	wallWood: 0xb0c1c3,
	water: 0xb1c8ff,
	wood: 0xb57b00,
}
