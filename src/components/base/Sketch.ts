import * as p5 from 'p5'

export class Sketch extends p5 {
	constructor(sketch?: (...args: any[]) => any, node?: HTMLElement) {
		super(sketch ? sketch : (...args: any[]): any => {}, node)
	}

    createCanvas(w: number, h: number, renderer?: p5.RENDERER) {
        this._renderContext = super.createCanvas(w, h, renderer)
        return this.renderContext
    }

    private _renderContext: p5.Renderer

    protected get renderContext(): p5.Renderer {
        return this._renderContext
    }
}
