// Long-form "Gut zu wissen" copy for the device hubs (/iphone, /ipad, /mac, /imac, /apple-watch), also in /llms-full.txt.
// Claims follow AGENTS.md: "Original Apple Teile" only for iPhone/Mac and always with ¹, no board-level work, no fixed durations.
// Markup: [text](/path) becomes a link, ¹ the footnote marker.
import type { QA } from "../components/FAQ.astro";

export type GuideKey = "iphone" | "ipad" | "mac" | "imac" | "apple-watch";
export type Guide = {
	intro: string;
	topics: { h: string; p: string[] }[];
	prep: string[];
	faq: QA[];
};

export const guides: Record<GuideKey, Guide> = {
	iphone: {
		intro:
			"Gesprungenes Display, schwache Batterie oder ein iPhone, das nicht mehr lädt: Die meisten Schäden beheben wir in Wien ohne Termin, oft in rund einer Stunde, wenn das Teil lagernd ist. Hier steht, was Sie vorab wissen sollten: welche Teile wir verbauen, was mit Ihren Daten passiert und wie Sie Ihr iPhone vorbereiten.",
		topics: [
			{
				h: "Original Apple Teil oder kompatibles Teil?",
				p: [
					"Für die meisten iPhone Modelle gibt es zwei Varianten: das Original Apple Teil¹ und ein günstigeres kompatibles Teil. Beide Preise stehen auf der Seite Ihres Modells, Sie entscheiden vor der Reparatur.",
					"Unter Einstellungen › Allgemein › Info zeigt iOS die „Teile- und Servicehistorie“. Dort sehen Sie, ob Display, Batterie oder Kamera getauscht wurden. Bei einem kompatiblen Teil kann dort „Unbekanntes Teil“ stehen. Wir sagen Ihnen vorab, ob Funktionen wie True Tone mit dem jeweiligen Teil erhalten bleiben.",
				],
			},
			{
				h: "Display gesprungen? Besser bald reparieren.",
				p: [
					"Ein Sprung im Glas wird selten kleiner. Splitter können die Finger verletzen, und durch Risse gelangen Staub und Feuchtigkeit ins iPhone. Zeigt das Bild Streifen oder grüne Linien oder reagiert der Touchscreen nicht mehr richtig, ist meist das ganze Displaymodul betroffen.",
					"Wir tauschen das komplette Modul, True Tone und Face ID bleiben erhalten. Mehr zur [iPhone Display Reparatur](/iphone/display-reparatur).",
				],
			},
			{
				h: "Batterie schwach? Batteriezustand prüfen.",
				p: [
					"Unter Einstellungen › Batterie › Batteriezustand zeigt iOS die maximale Kapazität. Liegt sie unter 80 % oder steht dort „Service“, ist ein Tausch sinnvoll. Typische Anzeichen: Das iPhone schaltet sich bei 20 % ab, wird spürbar langsamer oder hält keinen Tag mehr durch.",
					"Mit einer neuen Batterie arbeitet Ihr iPhone wieder mit voller Leistung. Mehr zum [iPhone Batterietausch](/iphone/batterietausch).",
				],
			},
			{
				h: "Rückglas, Kamera und Ladeanschluss.",
				p: [
					"Bei vielen neueren Modellen lässt sich das Rückglas einzeln tauschen, ohne das ganze Gehäuse zu ersetzen. Ein gesprungenes Kameraglas tauschen wir am besten, bevor Staub das Objektiv erreicht.",
					"Lädt Ihr iPhone nur noch mit Wackeln, sind oft Fusseln aus der Hosentasche im Anschluss festgepresst. Dann reicht eine Reinigung, sonst tauschen wir den Anschluss. Mehr zu [Rückglas](/iphone/rueckglas-reparatur), [Kamera](/iphone/kamera-reparatur) und [Ladeanschluss](/iphone/ladeanschluss-reparatur).",
				],
			},
			{
				h: "Wasserschaden: Das sollten Sie sofort tun.",
				p: [
					"iPhone ausschalten, nicht laden und nicht in Reis legen. Reis zieht keine Feuchtigkeit aus dem Gerät, Stärke und Körner können aber in die Anschlüsse gelangen. Bringen Sie das iPhone so bald wie möglich vorbei. Wir öffnen und reinigen es und sagen Ihnen nach der Diagnose, was sich retten lässt.",
				],
			},
			{
				h: "Ist das iPhone danach noch wasserdicht?",
				p: [
					"Ab Werk ist Ihr iPhone je nach Modell nach IP67 oder IP68 geschützt, die Dichtungen altern aber mit der Zeit. Nach jeder Öffnung verkleben wir das iPhone mit neuer Klebedichtung. Eine Wasserdichtigkeit wie ab Werk können wir danach nicht zusichern.",
				],
			},
		],
		prep: [
			"Backup in iCloud oder am Computer erstellen. Bei Display, Batterie und Rückglas bleiben Ihre Daten erhalten, sicher ist sicher.",
			"Modell nachsehen: Einstellungen › Allgemein › Info › Modellname.",
			"Gerätecode wissen: Für den Funktionstest nach der Reparatur entsperren Sie das iPhone am besten selbst.",
			"Ohne Termin an einen unserer [Standorte](/kontakt) kommen oder vorab [online anfragen](/reparatur-anfragen?geraet=iphone).",
		],
		faq: [
			{ q: "Was bedeutet „Unbekanntes Teil“ in den Einstellungen?", a: "iOS zeigt diesen Hinweis, wenn ein Teil nicht als Original Apple Teil erkannt wird, zum Beispiel ein kompatibles Display. Das iPhone funktioniert weiter, je nach Teil können einzelne Funktionen wie True Tone fehlen. Wir sagen Ihnen vorab, was Sie bei welchem Teil erwartet." },
			{ q: "Lohnt sich die Reparatur bei einem älteren iPhone?", a: "Meist ja. Ein Display oder eine Batterie kostet nur einen Bruchteil eines neuen iPhone, und Ihr Gerät bekommt weiter iOS Updates, solange Apple es unterstützt. Die Preise stehen auf der Seite Ihres Modells, so können Sie direkt vergleichen." },
			{ q: "Kann ich während der Reparatur warten?", a: "Ja. Ist das Teil lagernd, ist ein Display- oder Batterietausch oft in rund einer Stunde erledigt. Sie können warten, in der Zwischenzeit etwas erledigen oder das iPhone später abholen." },
		],
	},
	ipad: {
		intro:
			"Gesprungenes Glas, ein Akku, der nicht mehr durchhält, oder ein Ladeanschluss, der nur noch zeitweise reagiert: Das sind die häufigsten Schäden am iPad. Wir reparieren iPad, iPad Air, iPad mini und iPad Pro in Wien, ohne Termin und zum Fixpreis je Modell.",
		topics: [
			{
				h: "Nur das Glas oder das ganze Display?",
				p: [
					"Bei vielen Standard-iPads sind Glas und Bildschirm getrennt. Ist nur das Glas gesprungen und das Bild einwandfrei, wird nur die Touchscheibe getauscht. Bei iPad Air, iPad mini und iPad Pro neuerer Generationen sind Glas und Display verklebt (laminiert), hier tauschen wir das komplette Displaymodul.",
					"Welche Variante Ihr Modell braucht, sagen wir Ihnen vor der Reparatur. Mehr zur [iPad Display Reparatur](/ipad/display-reparatur).",
				],
			},
			{
				h: "Touch, Apple Pencil und Touch ID.",
				p: [
					"Nach dem Displaytausch testen wir Touch auf der ganzen Fläche. Bringen Sie Ihren Apple Pencil gern mit, dann prüfen wir auch die Stifteingabe.",
					"Touch ID ist mit Ihrem iPad gekoppelt. Bei Modellen mit Home Button übernehmen wir deshalb Ihren originalen Button. Ist er selbst beschädigt, funktioniert Touch ID danach nicht mehr, das besprechen wir vorab mit Ihnen.",
				],
			},
			{
				h: "Akku: Wann sich der Tausch lohnt.",
				p: [
					"Hält Ihr iPad nur noch wenige Stunden, schaltet es sich plötzlich ab oder lädt es sehr langsam, ist meist der Akku verschlissen. Hebt sich das Display am Rand oder entsteht ein Spalt, kann der Akku aufgebläht sein. Dann bitte nicht mehr laden und bald vorbeibringen.",
					"Mehr zum [iPad Batterietausch](/ipad/batterietausch).",
				],
			},
			{
				h: "Ladeanschluss: Lightning oder USB-C.",
				p: [
					"Lädt das iPad nur in einem bestimmten Winkel oder erkennt es das Kabel nicht, ist oft Schmutz im Anschluss die Ursache. Wir reinigen ihn und tauschen den Anschluss nur, wenn er wirklich defekt ist. Mehr zur [iPad Ladeanschluss Reparatur](/ipad/ladeanschluss-reparatur).",
				],
			},
			{
				h: "Welches iPad habe ich?",
				p: [
					"Unter Einstellungen › Allgemein › Info sehen Sie den Modellnamen. Die Modellnummer beginnt mit A und steht in kleiner Schrift auf der Rückseite des iPad. Mit beidem finden Sie Ihr Modell oben in der Liste, samt Preisen.",
				],
			},
			{
				h: "Welche Teile wir verbauen.",
				p: [
					"Für das iPad verwenden wir hochwertige Ersatzteile, die wir vor dem Einbau prüfen. Nach der Reparatur testen wir Display, Touch, Kameras, Lautsprecher und Laden, bevor Sie Ihr iPad zurückbekommen.",
				],
			},
		],
		prep: [
			"Backup in iCloud oder am Computer erstellen.",
			"Apple Pencil mitbringen, wenn Sie ihn nutzen, damit wir die Stifteingabe testen können.",
			"Ist das Display gewölbt oder steht es am Rand ab: nicht mehr laden, der Akku kann aufgebläht sein.",
			"Ohne Termin an einen unserer [Standorte](/kontakt) kommen oder vorab [online anfragen](/reparatur-anfragen?geraet=ipad).",
		],
		faq: [
			{ q: "Kann man beim iPad nur das Glas tauschen?", a: "Bei Modellen mit getrenntem Glas, vor allem beim Standard-iPad, ja. Bei iPad Air, iPad mini und iPad Pro neuerer Generationen sind Glas und Display verklebt, dann wird das ganze Displaymodul getauscht. Welche Variante Ihr Modell hat, sagen wir Ihnen vorab." },
			{ q: "Funktioniert Touch ID nach dem Displaytausch noch?", a: "Ja, wenn der Home Button selbst unbeschädigt ist. Touch ID ist mit dem iPad gekoppelt, deshalb übernehmen wir Ihren originalen Button. Ist er beschädigt, sagen wir Ihnen das vor der Reparatur." },
			{ q: "Lohnt sich die Reparatur eines älteren iPad?", a: "Oft ja, ein neues Glas oder ein Akku kostet deutlich weniger als ein neues iPad. Die Fixpreise stehen auf der Seite Ihres Modells. Bekommt Ihr iPad keine iPadOS Updates mehr, beraten wir Sie ehrlich, ob sich die Reparatur noch rechnet." },
		],
	},
	mac: {
		intro:
			"Gesprungenes Display, Batterie mit „Service empfohlen“, klemmende Tasten oder ein MacBook, das nicht mehr startet: Wir reparieren MacBook Air, MacBook Pro und ältere MacBooks in Wien mit Original Apple Teilen¹, ohne Termin. Den Preis nennen wir Ihnen nach der Diagnose, bevor wir beginnen. Sie haben einen iMac? Hier geht es zur [iMac Reparatur](/imac).",
		topics: [
			{
				h: "Welches MacBook habe ich?",
				p: [
					"Auf der Unterseite steht in kleiner Schrift die Modellnummer, zum Beispiel A2337 für das MacBook Air 13″ (M1, 2020) oder A2442 für das MacBook Pro 14″ (2021). Unter Apple Menü › Über diesen Mac sehen Sie Modell und Baujahr.",
					"Geben Sie die Nummer oben in die Modellsuche ein, dann landen Sie direkt bei Ihrem Modell.",
				],
			},
			{
				h: "Display: gesprungen, Streifen oder Druckstellen.",
				p: [
					"Typisch sind ein Sprung nach einem Sturz, Abdrücke der Tastatur, wenn beim Zuklappen etwas eingeklemmt war, oder Streifen und Flackern. Beim MacBook wird das Display als komplette Einheit getauscht und danach kalibriert.",
					"Mehr zur [MacBook Display Reparatur](/mac/display-reparatur).",
				],
			},
			{
				h: "Batterie: „Service empfohlen“.",
				p: [
					"Unter Systemeinstellungen › Batterie › Batteriezustand zeigt macOS Zustand und maximale Kapazität. Steht dort „Service empfohlen“ oder schaltet sich das MacBook ohne Netzteil schnell ab, ist ein Tausch fällig.",
					"Wölbt sich das Trackpad oder schließt das Gehäuse nicht mehr plan, kann die Batterie aufgebläht sein. Dann bitte nicht mehr laden. Mehr zum [MacBook Batterietausch](/mac/batterietausch).",
				],
			},
			{
				h: "Tastatur und Trackpad.",
				p: [
					"Bei MacBooks von 2015 bis 2019 mit Butterfly-Tastatur klemmen oder doppeln Tasten häufig. Krümel und verschüttete Getränke sind die zweithäufigste Ursache. Wir reinigen, tauschen einzelne Tasten oder die ganze Tastatur. Mehr zur [MacBook Tastatur Reparatur](/mac/tastatur-reparatur).",
				],
			},
			{
				h: "Flüssigkeit auf dem MacBook.",
				p: [
					"Sofort ausschalten, Netzteil abziehen und das MacBook aufgeklappt mit der Tastatur nach unten abtropfen lassen. Nicht wieder einschalten und nicht föhnen. Je früher wir es öffnen und reinigen, desto besser stehen die Chancen.",
				],
			},
			{
				h: "Ihre Daten und die SSD.",
				p: [
					"Bei Display, Batterie und Tastatur bleiben Ihre Daten auf dem Mac, ein Backup mit Time Machine empfehlen wir trotzdem. Bei Macs mit Apple Silicon oder T2-Chip ist die SSD fest verbaut und verschlüsselt. Daten lassen sich dann nur über den Mac selbst retten, ob das möglich ist, zeigt die Diagnose. Mehr zur [Datenrettung](/datenrettung).",
				],
			},
		],
		prep: [
			"Backup mit Time Machine oder in iCloud erstellen, wenn der Mac noch startet.",
			"Netzteil und Ladekabel mitbringen, damit wir Laden und Batterie testen können.",
			"Modellnummer notieren: Sie steht auf der Unterseite und beginnt mit A.",
			"Ohne Termin an einen unserer [Standorte](/kontakt) kommen oder vorab [online anfragen](/reparatur-anfragen?geraet=mac).",
		],
		faq: [
			{ q: "Woher weiß ich, welches MacBook ich habe?", a: "Die Modellnummer steht auf der Unterseite und beginnt mit A, zum Beispiel A2337 (MacBook Air 13″, M1, 2020). Unter Apple Menü › Über diesen Mac sehen Sie Modell und Baujahr. Mit der Nummer finden Sie Ihr MacBook in unserer Modellsuche." },
			{ q: "Lohnt sich die Reparatur eines älteren MacBook?", a: "Häufig ja. Eine neue Batterie oder Tastatur kostet einen Bruchteil eines neuen MacBook. Bekommt Ihr Mac keine macOS Updates mehr, besprechen wir mit Ihnen ehrlich, ob sich die Reparatur noch rechnet." },
			{ q: "Was tun, wenn Flüssigkeit über die Tastatur gelaufen ist?", a: "Sofort ausschalten, Netzteil abziehen, aufgeklappt mit der Tastatur nach unten abtropfen lassen und nicht wieder einschalten. Bringen Sie das MacBook dann so bald wie möglich vorbei." },
		],
	},
	imac: {
		intro:
			"Der iMac steht oft jahrelang am Schreibtisch, bis das Display Streifen zeigt, der Start Minuten dauert oder er gar nicht mehr hochfährt. Wir reparieren iMac 24″, iMac 27″, iMac 21,5″ und iMac Pro in Wien, mit Original Apple Teilen¹. Den Preis nennen wir Ihnen nach der Diagnose, vor der Reparatur.",
		topics: [
			{
				h: "Langsam geworden? SSD statt Festplatte.",
				p: [
					"Viele iMacs mit Intel-Prozessor wurden mit Festplatte oder Fusion Drive ausgeliefert. Nach einigen Jahren dauert der Start ewig, Programme reagieren träge. Mit einer SSD wird der iMac spürbar schneller, Ihre Daten übertragen wir auf Wunsch mit.",
					"Beim iMac 24″ mit Apple Silicon ist die SSD fest verbaut und lässt sich nicht tauschen.",
				],
			},
			{
				h: "Display: Streifen, Flecken oder Glasbruch.",
				p: [
					"Beim iMac sind Glas und Display verklebt und werden gemeinsam getauscht. Typisch sind senkrechte Linien, dunkle Ecken oder ein Sprung nach einem Stoß. Vor dem Tausch prüfen wir, ob wirklich das Display die Ursache ist oder der iMac nur kein Bild ausgibt.",
				],
			},
			{
				h: "Der iMac startet nicht mehr.",
				p: [
					"Bleibt der Bildschirm schwarz, erscheint ein Ordner mit Fragezeichen oder bleibt der Ladebalken hängen, liegt es oft an Festplatte, SSD oder Betriebssystem. Wir finden die Ursache und retten Ihre Daten, wenn es technisch möglich ist. Mehr zur [Datenrettung](/datenrettung).",
				],
			},
			{
				h: "Welchen iMac habe ich?",
				p: [
					"Unter Apple Menü › Über diesen Mac stehen Modell und Baujahr, etwa „iMac (Retina 5K, 27-inch, 2020)“. Die Modellnummer (zum Beispiel A1419, A2115 oder A2438) finden Sie unten am Standfuß. Mit ihr finden Sie Ihr Modell oben in der Modellsuche.",
				],
			},
			{
				h: "Sicher transportieren.",
				p: [
					"Bringen Sie nur den iMac und das Netzkabel bzw. Netzteil mit, Tastatur und Maus brauchen wir nicht. Am sichersten reist er in der Originalverpackung oder in eine Decke gewickelt, das Display nach innen. Ein iMac 27″ wiegt rund 9 kg.",
				],
			},
			{
				h: "Umstieg auf einen neuen Mac.",
				p: [
					"Wechseln Sie auf einen neuen Mac, übertragen wir Dateien, Programme und Einstellungen vom alten iMac. Das klappt oft auch dann, wenn er nicht mehr startet, solange sich die Daten noch auslesen lassen.",
				],
			},
		],
		prep: [
			"Backup mit Time Machine erstellen, wenn der iMac noch startet.",
			"Netzkabel bzw. Netzteil mitbringen. Tastatur und Maus können zu Hause bleiben.",
			"Für den Transport die Originalverpackung oder eine Decke verwenden, das Display nach innen.",
			"Ohne Termin an einen unserer [Standorte](/kontakt) kommen oder vorab [online anfragen](/reparatur-anfragen?geraet=mac).",
		],
		faq: [
			{ q: "Lohnt sich eine SSD statt der alten Festplatte im iMac?", a: "Bei iMacs mit Festplatte oder Fusion Drive meistens ja. Start und Programme werden spürbar schneller, und Ihre Daten können wir dabei übertragen. Beim iMac 24″ mit Apple Silicon ist die SSD fest verbaut." },
			{ q: "Kann man beim iMac nur das Glas tauschen?", a: "Nein, bei aktuellen iMacs sind Glas und Display verklebt und werden gemeinsam getauscht. Vorher prüfen wir, ob wirklich das Display defekt ist." },
			{ q: "Muss ich Tastatur und Maus mitbringen?", a: "Nein. Bringen Sie nur den iMac und das Netzkabel bzw. Netzteil mit. Am sichersten transportieren Sie ihn in der Originalverpackung oder in eine Decke gewickelt." },
		],
	},
	"apple-watch": {
		intro:
			"Ein Sprung im Display, ein Touchscreen, der nicht mehr reagiert, oder eine Batterie, die nicht mehr bis zum Abend hält: Wir reparieren Apple Watch Series, SE und Ultra in Wien, ohne Termin. Den Preis nennen wir Ihnen nach der Diagnose, bevor wir beginnen.",
		topics: [
			{
				h: "Display: Glas gesprungen oder Touch tot.",
				p: [
					"Glas und Display der Apple Watch bilden eine Einheit und werden gemeinsam getauscht. Ein Sprung sollte bald repariert werden: Splitter kratzen, und durch den Riss gelangen Schweiß und Wasser ins Gehäuse.",
					"Nach dem Tausch verkleben wir die Uhr neu und testen Touch, Helligkeit und Digital Crown. Mehr zur [Apple Watch Display Reparatur](/apple-watch/display-reparatur).",
				],
			},
			{
				h: "Batterie: Zustand prüfen.",
				p: [
					"Auf der Uhr unter Einstellungen › Batterie › Batteriezustand sehen Sie die maximale Kapazität. Liegt sie deutlich unter 80 % oder hält die Uhr keinen Tag mehr durch, ist ein Tausch sinnvoll.",
					"Hebt sich das Display aus dem Gehäuse, ist der Akku vermutlich aufgebläht. Dann bitte nicht mehr laden. Mehr zum [Apple Watch Batterietausch](/apple-watch/batterietausch).",
				],
			},
			{
				h: "Sensoren und Digital Crown.",
				p: [
					"Herzfrequenz- und weitere Sensoren sitzen auf der Rückseite und werden beim Displaytausch nicht berührt. Vor der Übergabe prüfen wir trotzdem Herzfrequenz, Touch, Digital Crown und Seitentaste.",
				],
			},
			{
				h: "Wasserschutz nach der Reparatur.",
				p: [
					"Ab Werk ist die Apple Watch wassergeschützt, die Dichtungen altern aber mit der Zeit. Nach dem Öffnen verkleben wir die Uhr mit neuer Klebedichtung. Eine Wasserdichtigkeit wie ab Werk können wir danach nicht zusichern.",
				],
			},
			{
				h: "Welche Modelle wir reparieren.",
				p: [
					"Apple Watch Series 4 bis Series 11, Apple Watch SE aller Generationen und Apple Watch Ultra bis Ultra 3. Die Modellbezeichnung finden Sie auf der Uhr unter Einstellungen › Allgemein › Info. Für ältere Modelle fragen Sie gern an.",
				],
			},
		],
		prep: [
			"Ladekabel mitbringen, damit wir das Laden testen können.",
			"Ihre Daten sichert das gekoppelte iPhone automatisch. Den Code der Uhr sollten Sie für den Test nach der Reparatur wissen.",
			"Hebt sich das Display: nicht mehr laden, der Akku kann aufgebläht sein.",
			"Ohne Termin an einen unserer [Standorte](/kontakt) kommen oder vorab [online anfragen](/reparatur-anfragen?geraet=apple-watch).",
		],
		faq: [
			{ q: "Lohnt sich die Reparatur einer Apple Watch?", a: "Bei neueren Modellen meistens, ein Display oder eine Batterie kostet deutlich weniger als eine neue Uhr. Bei älteren Modellen sagen wir Ihnen nach der Diagnose ehrlich, ob sich die Reparatur noch rechnet." },
			{ q: "Funktionieren die Sensoren nach dem Displaytausch?", a: "Ja. Herzfrequenz- und weitere Sensoren sitzen auf der Rückseite und werden beim Displaytausch nicht berührt. Vor der Übergabe testen wir Herzfrequenz, Touch und Digital Crown." },
			{ q: "Ist die Apple Watch nach der Reparatur noch wasserdicht?", a: "Wir verkleben die Uhr nach dem Öffnen mit neuer Klebedichtung. Eine Wasserdichtigkeit wie ab Werk können wir danach aber nicht zusichern." },
		],
	},
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const richHtml = (s: string) =>
	esc(s)
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
		.replace(/¹/g, '<a class="fn" href="#fn-1">1</a>');

export const richText = (s: string, site: string) => s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `$1 (${site}$2)`).replace(/¹/g, "");
