// Labels shared by the price list plugin and the model pages. Repair/quality keys match the `devices` schema.
export const repairLabels: Record<"de", Record<string, string>> = {
	de: {
		display: "Display",
		aussendisplay: "Außendisplay",
		innendisplay: "Innendisplay",
		akku: "Batterie",
		"selfie-kamera": "Frontkamera",
		kamera: "Hauptkamera",
		backcover: "Rückglas",
		ladebuchse: "Ladeanschluss",
		lautsprecher: "Hörmuschel",
		"face-id": "Face ID",
		"power-button": "Seitentaste",
		"home-button": "Home-Taste",
		sim: "SIM-Kartenleser",
		kopfhoererbuchse: "Kopfhöreranschluss",
		tastatur: "Tastatur",
		trackpad: "Trackpad",
		ssd: "SSD",
		datenrettung: "Datenrettung",
		datenuebertragung: "Datenübertragung",
		wasserschaden: "Wasserschaden",
		"software-fehler": "Softwarefehler beheben",
		"software-update": "Software-Update",
		fehleranalyse: "Fehleranalyse",
	},
};

export const qualityLabels: Record<"de", Record<string, string>> = {
	de: { original: "Original Apple Teil", drittanbieter: "Kompatibles Teil", standard: "" },
};

export const brandLabels: Record<string, string> = { apple: "Apple" };
