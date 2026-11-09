// /ankauf copy, shared with llms-full.txt.
import type { QA } from "../components/FAQ.astro";

// Value factors an iPhone owner can check on the device before selling.
export const ankaufFactors = [
	{ icon: "ph:device-mobile", title: "Generation", text: "Sie wiegt am schwersten. Pro- und Pro-Max-Varianten erzielen mehr als das Standardmodell desselben Jahrgangs." },
	{ icon: "ph:hard-drives", title: "Speicher", text: "Von 64 GB bis 1 TB. Die Kapazität Ihres Geräts steht in Einstellungen › Allgemein › Info." },
	{ icon: "ph:battery-medium", title: "Batteriezustand", text: "Die maximale Kapazität in Prozent zeigt Einstellungen › Batterie › Batteriezustand. Ein niedriger Wert drückt das Angebot, ein Verkauf bleibt trotzdem möglich." },
	{ icon: "ph:scan-smiley", title: "Display und Face ID", text: "Risse, Streifen, Flecken oder ein Face ID, das nicht mehr entsperrt, testen wir einzeln." },
	{ icon: "ph:wrench", title: "Teile-Historie", text: "Seit iOS 17.4 listet Einstellungen › Allgemein › Info getauschte Komponenten auf. Auch diesen Eintrag sehen wir uns an." },
	{ icon: "ph:lock-key", title: "Aktivierungssperre", text: "Solange „Wo ist?“ eingeschaltet ist, gehört das Gerät technisch noch zu Ihrem Apple Account. So ist eine Übernahme ausgeschlossen." },
];

export const ankaufPrep = [
	{ title: "Daten sichern.", path: "Einstellungen › [Ihr Name] › iCloud › iCloud-Backup", text: "Alternativ am Computer per Finder oder iTunes." },
	{ title: "Apple Watch trennen.", path: "Watch-App › Alle Uhren › ⓘ › Apple Watch entkoppeln", text: "Nötig nur, wenn eine Uhr mit dem iPhone gekoppelt ist." },
	{ title: "„Wo ist?“ deaktivieren.", path: "Einstellungen › [Ihr Name] › Wo ist? › Mein iPhone suchen", text: "Das hebt die Aktivierungssperre auf." },
	{ title: "Apple Account verlassen.", path: "Einstellungen › [Ihr Name] › Abmelden", text: "Der Punkt steht ganz unten, Ihr Passwort wird abgefragt." },
	{ title: "Auf Werkseinstellungen bringen.", path: "Einstellungen › Allgemein › iPhone übertragen/zurücksetzen › Alle Inhalte & Einstellungen löschen", text: "Erst damit sind Fotos, Chats und Konten wirklich vom Gerät verschwunden." },
	{ title: "SIM herausnehmen.", path: "SIM-Fach seitlich am Gehäuse", text: "Eine eSIM ziehen Sie vorher auf Ihr neues iPhone um." },
];

export const ankaufFaq: QA[] = [
	{ q: "Was ist mein iPhone noch wert?", a: "Entscheidend sind Generation, Speichergröße, Batteriezustand sowie der Zustand von Bildschirm und Gehäuse. Eine erste Einschätzung geben wir anhand Ihrer Formularangaben. Verbindlich wird das Angebot, sobald ein Techniker das Gerät in der Hand hatte." },
	{ q: "Wie entsteht das Angebot?", a: "Getestet werden Bildschirm, Face ID bzw. Touch ID, Kameras, Lautsprecher, Batterie und Ladeanschluss, dazu kommt ein Blick in die Teile-Historie. Zusammen mit Generation und Speicher ergibt das den Betrag. Ob Sie annehmen, entscheiden Sie danach." },
	{ q: "Nehmen Sie auch ein iPhone mit gesprungenem Display?", a: "Ja. Vermerken Sie den Sprung im Formular oder zeigen Sie ihn direkt im Shop. Der Betrag fällt dann niedriger aus, angesehen wird jedes Gerät." },
	{ q: "Lohnt sich der Verkauf bei verbrauchter Batterie?", a: "Oft ja. Wie viel Kapazität noch übrig ist, sehen Sie in Einstellungen › Batterie › Batteriezustand. Ein niedriger Prozentwert mindert das Angebot, verhindert es aber nicht." },
	{ q: "Welche Apple Produkte nehmen Sie an?", a: "iPhone, iPad, MacBook, iMac und Apple Watch, neue wie ältere Generationen. Haben Sie etwas anderes, notieren Sie es bitte unter „Anmerkungen“." },
	{ q: "Kann ich ein defektes iPhone verkaufen?", a: "Häufig schon. Ein defektes iPhone verkaufen Sie bei uns genauso wie ein gebrauchtes: Wir sehen uns auch iPhones, iPads und Macs an, die nicht mehr einwandfrei funktionieren, und nennen nach dem Check einen Betrag. Was wir nicht übernehmen, recyceln wir auf Wunsch fachgerecht und ohne Kosten." },
	{ q: "Wer kauft mein gebrauchtes iPhone?", a: "Wir. Ihr gebrauchtes iPhone kaufen wir direkt an, ohne Inserat, ohne Verhandeln mit Fremden und ohne Versand an eine Ankaufsplattform. Ein Techniker prüft das Gerät im Shop, Sie bekommen ein konkretes Angebot und entscheiden dann selbst." },
	{ q: "Kann ich mein MacBook in Wien verkaufen?", a: "Ja. MacBook verkaufen in Wien funktioniert wie beim iPhone: Modell und Zustand im Formular eintragen oder das MacBook ohne Termin in einen unserer Shops bringen. Auch iMac, iPad und Apple Watch nehmen wir an." },
	{ q: "Wo kann ich mein iPhone in Wien verkaufen?", a: "In unserem Shop in der BahnhofCity Wien Hauptbahnhof, ohne Termin und auch samstags. Bringen Sie das iPhone einfach mit, ein Techniker prüft es an der Theke und nennt Ihnen unser Angebot." },
	{ q: "Wo kann ich mein iPhone in Niederösterreich verkaufen?", a: "In der Westfield Shopping City Süd in Vösendorf und im G3 Shopping Resort Gerasdorf, beide direkt an der Wiener Stadtgrenze und ebenfalls ohne Termin, auch samstags." },
	{ q: "Muss ich vorher einen Termin ausmachen?", a: "Nein. Kommen Sie zu den Öffnungszeiten einfach vorbei, egal ob Sie online schon angefragt haben." },
	{ q: "Funktioniert der Verkauf auch per Paket?", a: "Ja. Wählen Sie in der Anfrage unter „Übergabe“ die Option „Per Post schicken“. Adresse und Ablauf für die Sendung bekommen Sie danach per E-Mail." },
	{ q: "Wie bereite ich mein iPhone auf die Abgabe vor?", a: "Daten sichern, „Wo ist?“ deaktivieren, aus dem Apple Account abmelden, das Gerät auf Werkseinstellungen bringen und die SIM herausnehmen. Ohne Abmeldung ist eine Übernahme leider ausgeschlossen." },
	{ q: "Was gilt bei aktiver Aktivierungssperre?", a: "Dann ist das iPhone noch an einen Apple Account gekoppelt und für uns nicht übernehmbar. Lösen Sie die Sperre, indem Sie „Wo ist?“ ausschalten und sich abmelden, notfalls auch aus der Ferne über iCloud.com." },
];
