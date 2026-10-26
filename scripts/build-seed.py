#!/usr/bin/env python3
"""Builds seed/seed.json (schema + legal pages). Only applies to an empty DB; afterwards the CMS is the source of truth."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
_n = 0


def key():
    global _n
    _n += 1
    return f"k{_n}"


def spans(text):
    children, defs, pos = [], [], 0
    for m in LINK.finditer(text):
        if m.start() > pos:
            children.append({"_type": "span", "_key": key(), "text": text[pos:m.start()], "marks": []})
        k = key()
        defs.append({"_type": "link", "_key": k, "href": m.group(2)})
        children.append({"_type": "span", "_key": key(), "text": m.group(1), "marks": [k]})
        pos = m.end()
    if pos < len(text):
        children.append({"_type": "span", "_key": key(), "text": text[pos:], "marks": []})
    return children, defs


def portable(md):
    blocks = []
    for raw in md.strip().split("\n"):
        line = raw.strip()
        if not line:
            continue
        block = {"_type": "block", "_key": key(), "style": "normal", "markDefs": []}
        if line.startswith("### "):
            block["style"], line = "h3", line[4:]
        elif line.startswith("## "):
            block["style"], line = "h2", line[3:]
        elif line.startswith("- "):
            block["listItem"], block["level"], line = "bullet", 1, line[2:]
        block["children"], block["markDefs"] = spans(line)
        blocks.append(block)
    return blocks


DATENSCHUTZ = """
Wir nehmen den Schutz Ihrer Daten ernst und verarbeiten sie ausschließlich auf Grundlage der Datenschutz-Grundverordnung (DSGVO) und des österreichischen Datenschutzgesetzes (DSG). Hier erfahren Sie, welche Daten wir verarbeiten, wozu und wie lange.
## Verantwortlicher
Verantwortlich für die Datenverarbeitung ist die Mobi GmbH, SCS Allee 4, 2331 Vösendorf, Österreich (Betreiberin der Marke Apfelreparatur, weitere Angaben im [Impressum](/impressum)). Sie erreichen uns unter [office@apfelreparatur.at](mailto:office@apfelreparatur.at).
## Aufruf der Website
Beim Aufruf unserer Website verarbeitet unser Hosting-Anbieter technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser und Betriebssystem. Das ist nötig, um die Website auszuliefern und vor Angriffen zu schützen (Art. 6 Abs. 1 lit. f DSGVO).
Die Website wird über Cloudflare (Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA) bereitgestellt. Cloudflare ist nach dem EU-US Data Privacy Framework zertifiziert; mit Cloudflare besteht ein Auftragsverarbeitungsvertrag. Protokolldaten werden nach kurzer Zeit automatisch gelöscht.
## Keine Tracking-Cookies, keine externen Schriften
Wir verwenden keine Analyse- oder Marketing-Tools, keine Tracking-Cookies und laden keine Schriften, Karten oder Videos von Drittanbietern. Deshalb brauchen wir auch keinen Cookie-Banner. Technisch notwendige Cookies setzen wir nur im geschützten Verwaltungsbereich der Website.
## Reparaturanfrage und Kontakt
Wenn Sie uns über das Formular „Reparatur anfragen“ oder per E-Mail kontaktieren, verarbeiten wir Ihre Angaben (Name, E-Mail-Adresse, optional Telefonnummer, Gerät, Modell, Anliegen und Beschreibung), um Ihre Anfrage zu beantworten und einen Termin zu vereinbaren. Rechtsgrundlage ist die Durchführung vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO).
Die Anfrage wird nicht in einer Datenbank gespeichert, sondern per E-Mail an uns übermittelt; Sie erhalten eine Kopie als Bestätigung. Für den E-Mail-Versand nutzen wir Resend (Resend, Inc., USA) als Auftragsverarbeiter. Die Übermittlung in die USA erfolgt auf Grundlage von Standardvertragsklauseln der EU-Kommission.
Kommt kein Auftrag zustande, löschen wir Ihre Anfrage spätestens nach 6 Monaten.
## Reparaturauftrag
Für die Abwicklung eines Auftrags verarbeiten wir Ihre Kontaktdaten, Angaben zum Gerät (Modell, Seriennummer), den Auftragsumfang sowie Rechnungsdaten (Art. 6 Abs. 1 lit. b DSGVO). Rechnungen und Buchhaltungsunterlagen bewahren wir 7 Jahre auf, wie es das Unternehmens- und Steuerrecht vorschreibt (Art. 6 Abs. 1 lit. c DSGVO).
Auf die Inhalte Ihres Geräts greifen wir bei einer Reparatur nicht zu. Nur wenn Sie uns mit einer Datenrettung oder Datenübertragung beauftragen, verarbeiten wir die dafür nötigen Daten ausschließlich zu diesem Zweck und löschen Rettungskopien nach der Übergabe sicher.
## Widerruf eines Vertrags
Nutzen Sie die Seite [Vertrag widerrufen](/vertrag-widerrufen), verarbeiten wir Ihre Angaben, um den Widerruf zu bearbeiten und den Eingang zu bestätigen (Art. 6 Abs. 1 lit. c DSGVO).
## Ihre Rechte
Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Schreiben Sie uns dazu einfach an [office@apfelreparatur.at](mailto:office@apfelreparatur.at).
Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt, können Sie sich bei der Österreichischen Datenschutzbehörde beschweren: Barichgasse 40–42, 1030 Wien, [www.dsb.gv.at](https://www.dsb.gv.at).
"""

AGB = """
Diese Allgemeinen Geschäftsbedingungen gelten für alle Reparatur-, Datenrettungs- und Datenübertragungsaufträge an Apfelreparatur. Apfelreparatur ist eine Marke der Mobi GmbH, SCS Allee 4, 2331 Vösendorf, FN 397203y, Landesgericht Wiener Neustadt („wir“); sie ist Ihr Vertragspartner. Abweichende Vereinbarungen gelten nur, wenn wir sie schriftlich bestätigen. Für Verbraucher:innen gelten zusätzlich die zwingenden Bestimmungen des Konsumentenschutzgesetzes (KSchG) und des Fern- und Auswärtsgeschäfte-Gesetzes (FAGG).
## 1. Anfrage und Vertragsabschluss
Eine Anfrage über unsere Website ist unverbindlich. Ein Auftrag kommt erst zustande, wenn Sie an einem unserer Standorte den genannten Preis bzw. Kostenvoranschlag annehmen.
## 2. Kostenvoranschlag
Vor der Reparatur nennen wir Ihnen den Preis. Dieser Kostenvoranschlag ist verbindlich. Stellt sich während der Reparatur heraus, dass zusätzliche Arbeiten nötig sind, informieren wir Sie vorher und führen sie nur mit Ihrer Zustimmung durch. Lehnen Sie den Kostenvoranschlag ab, erhalten Sie Ihr Gerät im Zustand der Übergabe zurück.
## 3. Ersatzteile
Wir verwenden Original Apple Ersatzteile, sofern Apple sie für das jeweilige Modell und die jeweilige Reparatur bereitstellt. Ist kein Originalteil erhältlich, nennen wir Ihnen vor der Reparatur die Alternative und deren Preis. Ohne Ihre Zustimmung wird kein anderes Teil verbaut. Ausgebaute Teile entsorgen wir fachgerecht, sofern Sie sie nicht zurückhaben möchten.
## 4. Ihre Mitwirkung und Datensicherung
Bitte sichern Sie Ihre Daten vor der Übergabe (z. B. Backup in der Cloud oder am Computer). Reparaturen können in seltenen Fällen zu Datenverlust führen, auch wenn wir sorgfältig arbeiten. Haben Sie keine Sicherung angelegt, kann Sie bei einem Datenverlust ein Mitverschulden treffen. Für Tests nach der Reparatur kann es nötig sein, den Gerätecode anzugeben oder die Ortungsfunktion vorübergehend zu deaktivieren; wir weisen Sie darauf hin.
## 5. Vorschäden, Wasser- und Sturzschäden
Geräte mit Flüssigkeits- oder schweren Sturzschäden können versteckte Folgeschäden haben. Treten diese erst während oder nach der Reparatur zutage, informieren wir Sie vor weiteren Arbeiten. Bereits vorhandene Schäden, die nicht Gegenstand des Auftrags sind, sind von der Garantie ausgeschlossen.
## 6. Preise und Zahlung
Alle Preise verstehen sich in Euro inklusive gesetzlicher Umsatzsteuer. Die Zahlung erfolgt bei Abholung des Geräts in bar oder mit Karte.
## 7. Abholung
Wir informieren Sie, sobald Ihr Gerät abholbereit ist. Holen Sie es trotz Erinnerung nicht innerhalb von 3 Monaten ab, können wir nach nochmaliger schriftlicher Ankündigung angemessene Lagerkosten verrechnen.
## 8. Garantie und Gewährleistung
Garantiegeberin ist die Mobi GmbH (Anschrift siehe oben). Auf getauschte Teile und unsere Arbeit geben wir 6 Monate Garantie ab Abholung, gültig in Österreich an allen unseren Standorten. Tritt in dieser Zeit ein Mangel am getauschten Teil oder an unserer Arbeit auf, beheben wir ihn kostenlos. Melden Sie sich dazu mit Ihrer Rechnung per E-Mail an [office@apfelreparatur.at](mailto:office@apfelreparatur.at) oder an einem unserer Standorte.
Ausgenommen sind Schäden durch Sturz, Bruch, Flüssigkeit oder unsachgemäße Behandlung nach der Reparatur sowie Eingriffe Dritter. Die Garantie gilt zusätzlich zu Ihren gesetzlichen Gewährleistungsrechten; diese bleiben durch die Garantie unberührt und werden nicht eingeschränkt.
## 9. Widerrufsrecht für Verbraucher:innen
Schließen Sie einen Vertrag mit uns im Fernabsatz oder außerhalb unserer Geschäftsräume, können Sie ihn binnen 14 Tagen ab Vertragsabschluss ohne Angabe von Gründen widerrufen. Für Verträge, die Sie an einem unserer Standorte abschließen, besteht kein gesetzliches Widerrufsrecht.
Den Widerruf erklären Sie über unsere Seite [Vertrag widerrufen](/vertrag-widerrufen) oder formlos per E-Mail an [office@apfelreparatur.at](mailto:office@apfelreparatur.at). Zur Fristwahrung genügt das rechtzeitige Absenden.
Verlangen Sie ausdrücklich, dass wir vor Ablauf der Widerrufsfrist mit der Reparatur beginnen, und ist die Leistung vollständig erbracht, erlischt Ihr Widerrufsrecht (§ 18 Abs. 1 Z 1 FAGG). Widerrufen Sie nach Beginn, aber vor vollständiger Erbringung, zahlen Sie einen anteiligen Betrag für die bis dahin erbrachten Leistungen (§ 16 FAGG).
### Muster-Widerrufsformular
Wenn Sie den Vertrag widerrufen wollen, können Sie dieses Formular ausfüllen und an uns senden (Pflicht ist das nicht):
An Mobi GmbH (Apfelreparatur), SCS Allee 4, 2331 Vösendorf, E-Mail office@apfelreparatur.at:
Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung: …
Bestellt am … / erhalten am …
Name des/der Verbraucher(s): …
Anschrift des/der Verbraucher(s): …
Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): …
Datum: …
## 10. Haftung
Für Schäden an Personen und für Schäden an den Geräten, die Sie uns zur Reparatur übergeben, haften wir nach den gesetzlichen Bestimmungen. Für sonstige Schäden haften wir bei Vorsatz und grober Fahrlässigkeit; gegenüber Unternehmern ist die Haftung für leichte Fahrlässigkeit ausgeschlossen. Zwingende Bestimmungen des Konsumentenschutzgesetzes bleiben unberührt.
## 11. Schlussbestimmungen
Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts. Für Verbraucher:innen gelten zwingende Schutzvorschriften ihres Wohnsitzstaates weiter. Gerichtsstand für Unternehmer ist Wien. Sollte eine Bestimmung unwirksam sein, bleiben die übrigen wirksam.
"""

# Old Joomla site (apfelreparatur.at, crawled 2026-10-24): every URL without a counterpart 301s.
# /kontakt, /impressum and /datenschutz exist on the new site and need no rule.
OLD = "Alte Website (apfelreparatur.at)"
OLD_REDIRECTS = [
    ("/reparatur", "/reparatur-anfragen"),
    ("/reparatur/[...rest]", "/reparatur-anfragen"),
    ("/Reparaturformular.pdf", "/reparatur-anfragen"),
    ("/service", "/"),
    ("/service/[...rest]", "/"),
    ("/1-iphone-ipad-ipod-service", "/"),
    ("/entsperren", "/"),
    ("/entsperren/[...rest]", "/"),
    ("/shop", "/kontakt"),
    ("/shop/[...rest]", "/kontakt"),
    ("/anfahrt", "/kontakt"),
    ("/anfahrt/[...rest]", "/kontakt"),
    ("/index.php", "/"),
    ("/index.php/reparatur", "/reparatur-anfragen"),
    ("/index.php/service", "/"),
    ("/index.php/1-iphone-ipad-ipod-service", "/"),
    ("/index.php/entsperren", "/"),
    ("/index.php/shop", "/kontakt"),
    ("/index.php/anfahrt", "/kontakt"),
    ("/index.php/kontakt", "/kontakt"),
    ("/index.php/impressum", "/impressum"),
    ("/index.php/datenschutz", "/datenschutz"),
    ("/index.php/[...rest]", "/"),
    ("/component/[...rest]", "/"),
]
REDIRECTS = [{"source": a, "destination": b, "type": 301, "enabled": True, "groupName": OLD} for a, b in OLD_REDIRECTS]

seed = {
    "$schema": "https://emdashcms.com/seed.schema.json",
    "version": "1",
    "meta": {"name": "Apfelreparatur", "description": "Reparatur für iPhone, iPad und Mac in Wien", "author": "Apfelreparatur"},
    "settings": {
        "title": "Apfelreparatur",
        "tagline": "Premium Reparatur für iPhone, iPad und Mac in Wien. Mit Original Apple Teilen.",
        "seo": {"titleSeparator": "–"},
    },
    "collections": [
        {
            "slug": "pages",
            "label": "Seiten",
            "labelSingular": "Seite",
            "urlPattern": "/{slug}",
            "supports": ["drafts", "revisions", "preview", "seo"],
            "fields": [
                {"slug": "title", "label": "Titel", "type": "string", "required": True},
                {"slug": "content", "label": "Inhalt", "type": "portableText"},
            ],
        }
    ],
    "redirects": REDIRECTS,
    "content": {
        "pages": [
            {"id": "datenschutz", "slug": "datenschutz", "status": "published", "data": {"title": "Datenschutzerklärung", "content": portable(DATENSCHUTZ)}},
            {"id": "agb", "slug": "agb", "status": "published", "data": {"title": "Allgemeine Geschäftsbedingungen", "content": portable(AGB)}},
        ]
    },
}

(ROOT / "seed" / "seed.json").write_text(json.dumps(seed, ensure_ascii=False, indent="\t") + "\n")
print("seed/seed.json written")
