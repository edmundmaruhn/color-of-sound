export type WavelengthInfo = number | WavelengthData

export interface WavelengthData {
	wavelength: number
	transitionStrength?: number
}

export interface Element<Abbreviation extends string> {
	name: string
	abbreviation: Abbreviation
	spectra: Array<WavelengthInfo>
}

export type ElementCollection<Abbreviations extends string> = {
	[Abbreviation in Abbreviations]: Element<Abbreviation>
}
