import * as p5 from 'p5'
import { fibonacci } from '../fibonacci'

class Shape {

    constructor(private p: p5) {}

    circle(x: number, y: number, n: number) {
        this.p.circle(x, y, fibonacci(n))
    }

    rect(x: number, y: number, n: number, m: number) {
        this.p.rect(x, y, fibonacci(n), fibonacci(m))
    }

    square(x: number, y: number, n: number) {
        const size = fibonacci(n)
        this.p.rect(x, y, size, size)
    }


}


const strokeSequence = () => {}

export default {
    Shape, strokeSequence
}
