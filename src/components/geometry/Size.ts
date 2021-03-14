export class Size {

    constructor(readonly width: number = 0, readonly height: number = 0) {}

    scale = (sx: number, sy: number) => {
        sy = isNaN(sy) ? sx : sy

        return new Size(this.width * sx, this.height * sy)
    }

    toArray = () => {
        return [this.width, this.height]
    }

}
