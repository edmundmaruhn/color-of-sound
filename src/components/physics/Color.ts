/**
 * Based on the following Stack Overflow post:
 * @see https://stackoverflow.com/a/34581745
 */

interface XYZ {
	readonly x: number
	readonly y: number
	readonly z: number
}

interface RGB {
	readonly r: number
	readonly g: number
	readonly b: number
}

export class Color {
	/**
	 * @see https://en.wikipedia.org/wiki/Visible_spectrum
	 */
	static MIN_VISIBLE_WAVELENGTH = 380
	/**
	 * @see https://en.wikipedia.org/wiki/Visible_spectrum
	 */
	static MAX_VISIBLE_WAVELENGTH = 750

	/**
	 * Simple utility decomposing an RGB integer value into its color channel components.
	 */
	static fromInteger = (rgb: number): RGB => {
		return {
			r: (rgb >> 16) & 0xff,
			g: (rgb >> 8) & 0xff,
			b: (rgb >> 0) & 0xff,
		}
	}

	/**
	 * Convert a wavelength in the visible light spectrum to a RGB color value that is suitable to be displayed on a
	 * monitor
	 *
	 * @param wavelength wavelength in nm
	 * @return decomposed RGB color value with component values in the range of 0 to 255
	 */
	static fromWavelength = (wavelength: number): RGB => {
		const xyz = CIE1931.wavelengthToXYTFit(wavelength)
		const rgb = Color.srgbXYZ2RGB(xyz)

		return {
			r: (rgb.r * 0xff) & 0xff,
			g: (rgb.g * 0xff) & 0xff,
			b: (rgb.b * 0xff) & 0xff,
		}
	}

	/**
	 * Convert XYZ to RGB in the sRGB color space
	 *
	 * The conversion matrix and color component transfer function is taken from http://www.color.org/srgb.pdf, which
	 * follows the International Electrotechnical Commission standard IEC 61966-2-1 "Multimedia systems and equipment -
	 * Colour measurement and management - Part 2-1: Colour management - Default RGB colour space - sRGB"
	 *
	 * @param xyz XYZ values in the range of 0.0 to 1.0
	 * @return decomposed RGB color value with component values in the range of 0.0 to 1.0
	 */
	static srgbXYZ2RGB = (xyz: XYZ): RGB => {
		const { x, y, z } = xyz

		// prettier-ignore
		const rl =  3.2406255 * x + -1.537208  * y + -0.4986286 * z;
		// prettier-ignore
		const gl = -0.9689307 * x +  1.8757561 * y +  0.0415175 * z;
		// prettier-ignore
		const bl =  0.0557101 * x + -0.2040211 * y +  1.0569959 * z;

		return {
			r: Color.srgbXYZ2RGBPostProcess(rl),
			g: Color.srgbXYZ2RGBPostProcess(gl),
			b: Color.srgbXYZ2RGBPostProcess(bl),
		}
	}

	/**
	 * helper function for {@link Color.srgbXYZ2RGB}
	 */
	private static srgbXYZ2RGBPostProcess = (component: number): number => {
		// clip if c is out of range
		component = component > 1 ? 1 : component < 0 ? 0 : component

		// apply the color component transfer function
		// prettier-ignore
		return component <= 0.0031308
            ? component * 12.92
            : 1.055 * Math.pow(component, 1. / 2.4) - 0.055
	}
}

export class CIE1931 {
	/**
	 * A multi-lobe, piecewise Gaussian fit of CIE 1931 XYZ Color Matching Functions by Wyman el al. from Nvidia. The
	 * code here is adopted from the Listing 1 of the paper authored by Wyman et al.
	 * <p>
	 * Reference: Chris Wyman, Peter-Pike Sloan, and Peter Shirley, Simple Analytic Approximations to the CIE XYZ Color
	 * Matching Functions, Journal of Computer Graphics Techniques (JCGT), vol. 2, no. 2, 1-11, 2013.
	 *
	 * @param wavelength wavelength in nm
	 * @return XYZ in a double array in the order of X, Y, Z. each value in the range of [0.0, 1.0]
	 */
	static wavelengthToXYTFit = (wavelength: number): XYZ => {
		const wave = wavelength
		let x: number, y: number, z: number

		{
			const t1 = (wave - 442.0) * (wave < 442.0 ? 0.0624 : 0.0374)
			const t2 = (wave - 599.8) * (wave < 599.8 ? 0.0264 : 0.0323)
			const t3 = (wave - 501.1) * (wave < 501.1 ? 0.049 : 0.0382)

			// prettier-ignore
			x =   0.362 * Math.exp(-0.5 * t1 * t1)
                + 1.056 * Math.exp(-0.5 * t2 * t2)
                - 0.065 * Math.exp(-0.5 * t3 * t3)
		}

		{
			const t1 = (wave - 568.8) * (wave < 568.8 ? 0.0213 : 0.0247)
			const t2 = (wave - 530.9) * (wave < 530.9 ? 0.0613 : 0.0322)

			// prettier-ignore
			y =   0.821 * Math.exp(-0.5 * t1 * t1)
                + 0.286 * Math.exp(-0.5 * t2 * t2)
		}

		{
			const t1 = (wave - 437.0) * (wave < 437.0 ? 0.0845 : 0.0278)
			const t2 = (wave - 459.0) * (wave < 459.0 ? 0.0385 : 0.0725)

			// prettier-ignore
			z =   1.217 * Math.exp(-0.5 * t1 * t1)
                + 0.681 * Math.exp(-0.5 * t2 * t2)
		}

		return { x, y, z }
	}
} /*
public static int wavelengthToRGB(double wavelength){
    double[] xyz = cie1931WavelengthToXYZFit(wavelength);
    double[] rgb = srgbXYZ2RGB(xyz);

    int c = 0;
    c |= (((int) (rgb[0] * 0xFF)) & 0xFF) << 16;
    c |= (((int) (rgb[1] * 0xFF)) & 0xFF) << 8;
    c |= (((int) (rgb[2] * 0xFF)) & 0xFF) << 0;

    return c;
}
*/ /*
public static double[] srgbXYZ2RGB(double[] xyz) {
    double x = xyz[0];
    double y = xyz[1];
    double z = xyz[2];

    double rl =  3.2406255 * x + -1.537208  * y + -0.4986286 * z;
    double gl = -0.9689307 * x +  1.8757561 * y +  0.0415175 * z;
    double bl =  0.0557101 * x + -0.2040211 * y +  1.0569959 * z;

    return new double[] {
            srgbXYZ2RGBPostprocess(rl),
            srgbXYZ2RGBPostprocess(gl),
            srgbXYZ2RGBPostprocess(bl)
    };
}
*/ /*
private static double srgbXYZ2RGBPostprocess(double c) {
    // clip if c is out of range
    c = c > 1 ? 1 : (c < 0 ? 0 : c);

    // apply the color component transfer function
    c = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1. / 2.4) - 0.055;

    return c;
}
*/ /*
public static double[] cie1931WavelengthToXYZFit(double wavelength) {
    double wave = wavelength;

    double x;
    {
        double t1 = (wave - 442.0) * ((wave < 442.0) ? 0.0624 : 0.0374);
        double t2 = (wave - 599.8) * ((wave < 599.8) ? 0.0264 : 0.0323);
        double t3 = (wave - 501.1) * ((wave < 501.1) ? 0.0490 : 0.0382);

        x =   0.362 * Math.exp(-0.5 * t1 * t1)
            + 1.056 * Math.exp(-0.5 * t2 * t2)
            - 0.065 * Math.exp(-0.5 * t3 * t3);
    }

    double y;
    {
        double t1 = (wave - 568.8) * ((wave < 568.8) ? 0.0213 : 0.0247);
        double t2 = (wave - 530.9) * ((wave < 530.9) ? 0.0613 : 0.0322);

        y =   0.821 * Math.exp(-0.5 * t1 * t1)
            + 0.286 * Math.exp(-0.5 * t2 * t2);
    }

    double z;
    {
        double t1 = (wave - 437.0) * ((wave < 437.0) ? 0.0845 : 0.0278);
        double t2 = (wave - 459.0) * ((wave < 459.0) ? 0.0385 : 0.0725);

        z =   1.217 * Math.exp(-0.5 * t1 * t1)
            + 0.681 * Math.exp(-0.5 * t2 * t2);
    }

    return new double[] { x, y, z };
}
*/

/**
 * Convert a wavelength in the visible light spectrum to a RGB color value that is suitable to be displayed on a
 * monitor
 *
 * @param wavelength wavelength in nm
 * @return RGB color encoded in int. each color is represented with 8 bits and has a layout of
 * 00000000RRRRRRRRGGGGGGGGBBBBBBBB where MSB is at the leftmost
 */

/**
 * Convert XYZ to RGB in the sRGB color space
 * <p>
 * The conversion matrix and color component transfer function is taken from http://www.color.org/srgb.pdf, which
 * follows the International Electrotechnical Commission standard IEC 61966-2-1 "Multimedia systems and equipment -
 * Colour measurement and management - Part 2-1: Colour management - Default RGB colour space - sRGB"
 *
 * @param xyz XYZ values in a double array in the order of X, Y, Z. each value in the range of [0.0, 1.0]
 * @return RGB values in a double array, in the order of R, G, B. each value in the range of [0.0, 1.0]
 */

/**
 * helper function for {@link #srgbXYZ2RGB(double[])}
 */

/**
 * A multi-lobe, piecewise Gaussian fit of CIE 1931 XYZ Color Matching Functions by Wyman el al. from Nvidia. The
 * code here is adopted from the Listing 1 of the paper authored by Wyman et al.
 * <p>
 * Reference: Chris Wyman, Peter-Pike Sloan, and Peter Shirley, Simple Analytic Approximations to the CIE XYZ Color
 * Matching Functions, Journal of Computer Graphics Techniques (JCGT), vol. 2, no. 2, 1-11, 2013.
 *
 * @param wavelength wavelength in nm
 * @return XYZ in a double array in the order of X, Y, Z. each value in the range of [0.0, 1.0]
 */
