import { Color, RGB } from "../physics/Color"

export const Adjustment = {

    contrastFromInteger: (color: number, contrast: number) => {
        return Adjustment.contrastFromRGB(Color.fromInteger(color), contrast)
    },

    contrastFromRGB: (rgb: RGB, contrast: number) => {
        /*
        factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
        colour = GetPixelColour(x, y)
        newRed   = Truncate(factor * (Red(colour)   - 128) + 128)
        newGreen = Truncate(factor * (Green(colour) - 128) + 128)
        newBlue  = Truncate(factor * (Blue(colour)  - 128) + 128)
        PutPixelColour(x, y) = RGB(newRed, newGreen, newBlue)
        */
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
        const r = Math.min(Math.max(factor * (rgb.r   - 128) + 128, 0), 255)
        const g = Math.min(Math.max(factor * (rgb.g   - 128) + 128, 0), 255)
        const b = Math.min(Math.max(factor * (rgb.b   - 128) + 128, 0), 255)
 
        return Color.toARGBInteger({r, g, b})
    }
}
