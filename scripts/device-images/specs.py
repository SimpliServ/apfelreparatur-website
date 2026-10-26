import json

S = ("Studio product photograph, photorealistic, accurate proportions and design details for this exact model, soft even studio lighting, "
     "transparent background, no shadow, no reflection on the ground, absolutely no text, letters, labels or logos anywhere, "
     "whole device visible and centered with generous margin.")
VIEW = "lid open about 110 degrees, seen from the front-left at a three-quarter angle from slightly above"
WALL = ["teal and violet", "amber and coral", "deep blue and cyan", "rose and peach", "emerald and lime", "indigo and magenta", "sunset orange and pink",
        "aqua and mint", "lavender and sky blue", "gold and copper", "crimson and plum", "turquoise and navy", "lilac and rose", "olive and sand",
        "cobalt and silver", "tangerine and yellow", "seafoam and blue", "berry and violet", "graphite and ice blue", "mint and lemon"]

AIR_NOTCH = "flat uniform-thickness aluminium body (no wedge), notch at the top centre of the display, thin black bezels, full-height function key row with Touch ID, black keys, large trackpad, MagSafe and two USB-C ports on the left side"
AIR_WEDGE = "tapered wedge-shaped aluminium body (thicker at the hinge, thin at the front edge), black glass display bezels without notch, half-height function keys with Touch ID key, black keys, wide Force Touch trackpad, two USB-C ports on the left side"
AIR_OLD = "tapered wedge-shaped silver aluminium body, wide silver aluminium frame around the display (not black glass), black keys with half-height function keys, no Touch ID, MagSafe 2 connector and a USB-A port on the left side"
MBP_RETINA = "silver aluminium unibody, black glass display bezel without notch, full row of physical function keys, black keys, glass trackpad, MagSafe 2, Thunderbolt and USB-A ports and headphone jack on the left side"
MBP_TB = "thin aluminium body, black display bezel without notch, Touch Bar (thin glossy OLED strip with colourful controls) above the keyboard with Touch ID at its right end, black butterfly keys, very large trackpad, {ports}"
MBP_FKEYS = "thin aluminium body, black display bezel without notch, physical function key row (no Touch Bar), black butterfly keys, very large trackpad, two USB-C ports on the left side"
MBP_NOTCH = "notch at the top centre of the display, thin black bezels, full-height black function keys, black keyboard, speaker grilles on both sides of the keyboard, large trackpad, MagSafe 3 and Thunderbolt ports on the left side, HDMI and SD card slot on the right side"

def mac(title, colour, size, design):
    return f"Apple {title} laptop in {colour}, {size}, {VIEW}. Design: {design}. The screen shows an abstract soft gradient wallpaper in {{wall}}. {S}"

def imac(title, colour, design):
    return f"Apple {title} all-in-one desktop computer in {colour}, front view turned slightly to the left, standing on its stand. Design: {design}. The screen shows an abstract soft gradient wallpaper in {{wall}}. {S}"

IMAC_SLIM = "thin-edge silver aluminium body, black glass border around the display, plain silver aluminium chin below the display, angled silver aluminium foot stand"
IMAC24 = "very thin flat body in the case colour, white display border, plain colour-matched lighter chin below the display, colour-matched flat aluminium stand"

M = {}
def add(slug, prompt, kind="mac"):
    M[slug] = {"prompt": prompt, "kind": kind}

# MacBook Air
for slug, chip, col in [("macbook-air-13-m5-2026", "M5, 2026", "Sky Blue (light blue-grey) aluminium"), ("macbook-air-13-m4-2025", "M4, 2025", "Starlight (warm champagne silver) aluminium"),
                        ("macbook-air-13-m3-2024", "M3, 2024", "Space Gray aluminium"), ("macbook-air-13-m2-2022", "M2, 2022", "Midnight (very dark blue-black) aluminium")]:
    add(slug, mac(f"MacBook Air 13-inch ({chip})", col, "13-inch", AIR_NOTCH))
for slug, chip, col in [("macbook-air-15-m5-2026", "M5, 2026", "Silver aluminium"), ("macbook-air-15-m4-2025", "M4, 2025", "Sky Blue (light blue-grey) aluminium"),
                        ("macbook-air-15-m3-2024", "M3, 2024", "Midnight (very dark blue-black) aluminium"), ("macbook-air-15-m2-2023", "M2, 2023", "Starlight (warm champagne silver) aluminium")]:
    add(slug, mac(f"MacBook Air 15-inch ({chip})", col, "15-inch, noticeably wider body with speaker grilles hidden in the hinge", AIR_NOTCH))
for slug, chip, col in [("macbook-air-13-m1-2020", "M1, 2020", "Gold aluminium"), ("macbook-air-13-retina-2020", "Retina, 2020", "Space Gray aluminium"),
                        ("macbook-air-13-retina-2019", "Retina, 2019", "Silver aluminium"), ("macbook-air-13-retina-2018", "Retina, 2018", "Gold aluminium, seen slightly more from the front")]:
    add(slug, mac(f"MacBook Air 13-inch ({chip})", col, "13-inch", AIR_WEDGE))
for slug, t in [("macbook-air-13-2017", "MacBook Air 13-inch (2017)"), ("macbook-air-13-anfang-2015", "MacBook Air 13-inch (Early 2015)"), ("macbook-air-13-anfang-2014", "MacBook Air 13-inch (Early 2014)"),
                ("macbook-air-13-mitte-2013", "MacBook Air 13-inch (Mid 2013)"), ("macbook-air-13-mitte-2012", "MacBook Air 13-inch (Mid 2012)")]:
    add(slug, mac(t, "Silver aluminium", "13-inch", AIR_OLD))
for slug, t in [("macbook-air-11-anfang-2015", "MacBook Air 11-inch (Early 2015)"), ("macbook-air-11-anfang-2014", "MacBook Air 11-inch (Early 2014)"),
                ("macbook-air-11-mitte-2013", "MacBook Air 11-inch (Mid 2013)"), ("macbook-air-11-mitte-2012", "MacBook Air 11-inch (Mid 2012)")]:
    add(slug, mac(t, "Silver aluminium", "very compact 11-inch with a wide 16:9 display, keyboard reaching nearly edge to edge", AIR_OLD))

# MacBook Pro Retina 2012-2015
for slug, t, size in [("macbook-pro-15-retina-mitte-2015", "MacBook Pro 15-inch Retina (Mid 2015)", "15-inch, speaker grilles on both sides of the keyboard"),
                      ("macbook-pro-13-retina-anfang-2015", "MacBook Pro 13-inch Retina (Early 2015)", "13-inch"),
                      ("macbook-pro-15-retina-mitte-2014", "MacBook Pro 15-inch Retina (Mid 2014)", "15-inch, speaker grilles on both sides of the keyboard"),
                      ("macbook-pro-13-retina-mitte-2014", "MacBook Pro 13-inch Retina (Mid 2014)", "13-inch"),
                      ("macbook-pro-15-retina-ende-2013", "MacBook Pro 15-inch Retina (Late 2013)", "15-inch, speaker grilles on both sides of the keyboard"),
                      ("macbook-pro-13-retina-ende-2013", "MacBook Pro 13-inch Retina (Late 2013)", "13-inch"),
                      ("macbook-pro-15-retina-anfang-2013", "MacBook Pro 15-inch Retina (Early 2013)", "15-inch, speaker grilles on both sides of the keyboard"),
                      ("macbook-pro-13-retina-anfang-2013", "MacBook Pro 13-inch Retina (Early 2013)", "13-inch"),
                      ("macbook-pro-13-retina-ende-2012", "MacBook Pro 13-inch Retina (Late 2012)", "13-inch"),
                      ("macbook-pro-15-retina-mitte-2012", "MacBook Pro 15-inch Retina (Mid 2012)", "15-inch, speaker grilles on both sides of the keyboard")]:
    add(slug, mac(t, "Silver aluminium", size, MBP_RETINA))

# MacBook Pro 13 2016-2022
P4 = "two Thunderbolt 3 (USB-C) ports on each side"
P2 = "two Thunderbolt 3 (USB-C) ports on the left side"
for slug, t, col, design in [
    ("macbook-pro-13-m2-2022", "MacBook Pro 13-inch (M2, 2022)", "Silver aluminium", MBP_TB.format(ports=P2)),
    ("macbook-pro-13-m1-2020", "MacBook Pro 13-inch (M1, 2020)", "Space Gray aluminium", MBP_TB.format(ports=P2)),
    ("macbook-pro-13-2020-4-thunderbolt-3-anschluesse", "MacBook Pro 13-inch (2020, four Thunderbolt 3 ports)", "Silver aluminium", MBP_TB.format(ports=P4) + ", Magic Keyboard with scissor keys and a physical Esc key"),
    ("macbook-pro-13-2020-2-thunderbolt-3-anschluesse", "MacBook Pro 13-inch (2020, two Thunderbolt 3 ports)", "Space Gray aluminium", MBP_TB.format(ports=P2) + ", Magic Keyboard with a physical Esc key"),
    ("macbook-pro-13-2019-4-thunderbolt-3-anschluesse", "MacBook Pro 13-inch (2019, four Thunderbolt 3 ports)", "Space Gray aluminium", MBP_TB.format(ports=P4)),
    ("macbook-pro-13-2019-2-thunderbolt-3-anschluesse", "MacBook Pro 13-inch (2019, two Thunderbolt 3 ports)", "Silver aluminium", MBP_TB.format(ports=P2)),
    ("macbook-pro-13-2018-4-thunderbolt-3-anschluesse", "MacBook Pro 13-inch (2018, four Thunderbolt 3 ports)", "Silver aluminium", MBP_TB.format(ports=P4)),
    ("macbook-pro-13-2017-4-thunderbolt-3-anschluesse", "MacBook Pro 13-inch (2017, four Thunderbolt 3 ports)", "Space Gray aluminium", MBP_TB.format(ports=P4)),
    ("macbook-pro-13-2017-2-thunderbolt-3-anschluesse", "MacBook Pro 13-inch (2017, two Thunderbolt 3 ports, no Touch Bar)", "Silver aluminium", MBP_FKEYS),
    ("macbook-pro-13-2016-4-thunderbolt-3-anschluesse", "MacBook Pro 13-inch (2016, four Thunderbolt 3 ports)", "Silver aluminium, seen slightly more from the front", MBP_TB.format(ports=P4)),
    ("macbook-pro-13-2016-2-thunderbolt-3-anschluesse", "MacBook Pro 13-inch (2016, two Thunderbolt 3 ports, no Touch Bar)", "Space Gray aluminium", MBP_FKEYS),
]:
    add(slug, mac(t, col, "13-inch", design))

# MacBook Pro 14/16 notch
for slug, t, col in [("macbook-pro-14-m5-pro-m5-max-2026", "MacBook Pro 14-inch (M5 Pro/M5 Max, 2026)", "Space Black (deep matte black) aluminium"),
                     ("macbook-pro-14-m5-2025", "MacBook Pro 14-inch (M5, 2025)", "Silver aluminium"),
                     ("macbook-pro-14-m4-pro-m4-max-2024", "MacBook Pro 14-inch (M4 Pro/M4 Max, 2024)", "Silver aluminium, seen slightly more from the front"),
                     ("macbook-pro-14-m4-2024", "MacBook Pro 14-inch (M4, 2024)", "Space Black (deep matte black) aluminium"),
                     ("macbook-pro-14-m3-pro-m3-max-nov-2023", "MacBook Pro 14-inch (M3 Pro/M3 Max, 2023)", "Space Black (deep matte black) aluminium, seen slightly more from the front"),
                     ("macbook-pro-14-m3-nov-2023", "MacBook Pro 14-inch (M3, 2023)", "Space Gray aluminium"),
                     ("macbook-pro-14-m2-pro-m2-max-2023", "MacBook Pro 14-inch (M2 Pro/M2 Max, 2023)", "Silver aluminium"),
                     ("macbook-pro-14-m1-pro-m1-max-2021", "MacBook Pro 14-inch (M1 Pro/M1 Max, 2021)", "Space Gray aluminium")]:
    add(slug, mac(t, col, "14-inch", MBP_NOTCH))
for slug, t, col in [("macbook-pro-16-m5-pro-m5-max-2026", "MacBook Pro 16-inch (M5 Pro/M5 Max, 2026)", "Silver aluminium"),
                     ("macbook-pro-16-m4-pro-m4-max-2024", "MacBook Pro 16-inch (M4 Pro/M4 Max, 2024)", "Space Black (deep matte black) aluminium"),
                     ("macbook-pro-16-m3-pro-m3-max-nov-2023", "MacBook Pro 16-inch (M3 Pro/M3 Max, 2023)", "Silver aluminium, seen slightly more from the front"),
                     ("macbook-pro-16-m2-pro-m2-max-2023", "MacBook Pro 16-inch (M2 Pro/M2 Max, 2023)", "Space Gray aluminium"),
                     ("macbook-pro-16-m1-pro-m1-max-2021", "MacBook Pro 16-inch (M1 Pro/M1 Max, 2021)", "Silver aluminium")]:
    add(slug, mac(t, col, "16-inch, large", MBP_NOTCH))
add("macbook-pro-16-2019", mac("MacBook Pro 16-inch (2019)", "Space Gray aluminium", "16-inch, large", MBP_TB.format(ports=P4) + ", Magic Keyboard with a separate physical Esc key, speaker grilles on both sides of the keyboard, thin black bezels without notch"))
for slug, t, col in [("macbook-pro-15-2019", "MacBook Pro 15-inch (2019)", "Silver aluminium"), ("macbook-pro-15-2018", "MacBook Pro 15-inch (2018)", "Space Gray aluminium"),
                     ("macbook-pro-15-2017", "MacBook Pro 15-inch (2017)", "Space Gray aluminium, seen slightly more from the front"), ("macbook-pro-15-2016", "MacBook Pro 15-inch (2016)", "Silver aluminium, seen slightly more from the front")]:
    add(slug, mac(t, col, "15-inch, speaker grilles on both sides of the keyboard", MBP_TB.format(ports=P4)))

# MacBook 12
MB12 = "extremely thin and light body, single USB-C port and headphone jack, black butterfly keys spanning almost the full width, black glass display bezel, Force Touch trackpad"
add("macbook-retina-12-2017", mac("MacBook 12-inch (2017)", "Rose Gold aluminium", "12-inch", MB12))
add("macbook-retina-12-anfang-2016", mac("MacBook 12-inch (Early 2016)", "Space Gray aluminium", "12-inch", MB12))
add("macbook-retina-12-anfang-2015", mac("MacBook 12-inch (Early 2015)", "Gold aluminium", "12-inch", MB12))

# iMac
for slug, t in [("imac-21-5-2017", "iMac 21.5-inch (2017)"), ("imac-21-5-ende-2015", "iMac 21.5-inch (Late 2015)"), ("imac-21-5-mitte-2014", "iMac 21.5-inch (Mid 2014)"),
                ("imac-21-5-ende-2013", "iMac 21.5-inch (Late 2013)"), ("imac-21-5-ende-2012", "iMac 21.5-inch (Late 2012)"),
                ("imac-21-5-retina-4k-2019", "iMac 21.5-inch Retina 4K (2019)"), ("imac-21-5-retina-4k-2017", "iMac 21.5-inch Retina 4K (2017)"), ("imac-21-5-retina-4k-ende-2015", "iMac 21.5-inch Retina 4K (Late 2015)")]:
    add(slug, imac(t, "silver aluminium", IMAC_SLIM + ", compact 21.5-inch size"), "imac")
for slug, t in [("imac-27-retina-5k-2020", "iMac 27-inch Retina 5K (2020)"), ("imac-27-retina-5k-2019", "iMac 27-inch Retina 5K (2019)"), ("imac-27-retina-5k-2017", "iMac 27-inch Retina 5K (2017)"),
                ("imac-27-retina-5k-ende-2015", "iMac 27-inch Retina 5K (Late 2015)"), ("imac-27-retina-5k-mitte-2015", "iMac 27-inch Retina 5K (Mid 2015)"), ("imac-27-retina-5k-ende-2014", "iMac 27-inch Retina 5K (Late 2014)"),
                ("imac-27-ende-2013", "iMac 27-inch (Late 2013)"), ("imac-27-ende-2012", "iMac 27-inch (Late 2012)")]:
    add(slug, imac(t, "silver aluminium", IMAC_SLIM + ", large 27-inch size"), "imac")
for slug, t, col in [("imac-24-m4-2024-4-anschluesse", "iMac 24-inch (M4, 2024)", "Yellow"), ("imac-24-m4-2024-2-anschluesse", "iMac 24-inch (M4, 2024)", "Blue"),
                     ("imac-24-m3-2023-4-anschluesse", "iMac 24-inch (M3, 2023)", "Purple"), ("imac-24-m3-2023-2-anschluesse", "iMac 24-inch (M3, 2023)", "Pink"),
                     ("imac-24-m1-2021-4-anschluesse", "iMac 24-inch (M1, 2021)", "Orange"), ("imac-24-m1-2021-2-anschluesse", "iMac 24-inch (M1, 2021)", "Green")]:
    add(slug, imac(t, col, IMAC24), "imac")

# Apple Watch
FACE = "Display on, showing a simple analog watch face: thin white hour markers and white hands on pure black, no numbers or text."
BAND = "The band is attached at the top and bottom of the case and curves back behind it, forming a closed loop seen from the front, like a classic watch product shot."
def watch(t, case, band, design):
    return f"Apple {t} smartwatch, {case}, with {band}. Front view, upright, centered. Design: {design}. {BAND} {FACE} Digital Crown and side button on the right edge. {S}"
ULTRA = "large rugged 49 mm titanium case with flat sapphire front crystal and a slightly raised titanium edge around it, bright orange Action Button on the left side, larger protected Digital Crown on the right"
NEW = "thin rounded-rectangle aluminium case with very thin display borders and a large wide-angle display"
MID = "rounded-rectangle aluminium case with thin display borders"
OLD = "rounded-rectangle aluminium case with slightly thicker black display borders"
for slug, t, case, band, design in [
    ("apple-watch-ultra-3", "Watch Ultra 3", "black titanium case", "a black Ocean Band", ULTRA),
    ("apple-watch-ultra-2", "Watch Ultra 2", "natural titanium case", "an orange Alpine Loop band", ULTRA),
    ("apple-watch-ultra", "Watch Ultra", "natural titanium case", "a green and grey Trail Loop band", ULTRA),
    ("apple-watch-series-11", "Watch Series 11", "Space Gray aluminium case", "a black Sport Band", NEW),
    ("apple-watch-series-10", "Watch Series 10", "Rose Gold aluminium case", "a light blush Sport Band", NEW),
    ("apple-watch-series-9", "Watch Series 9", "Pink aluminium case", "a light pink Sport Band", MID),
    ("apple-watch-series-8", "Watch Series 8", "Midnight (dark blue-black) aluminium case", "a Midnight Sport Band", MID),
    ("apple-watch-series-7", "Watch Series 7", "Green aluminium case", "a dark Clover green Sport Band", MID),
    ("apple-watch-series-6", "Watch Series 6", "Blue aluminium case", "a Deep Navy Sport Band", OLD),
    ("apple-watch-series-5", "Watch Series 5", "Gold aluminium case", "a Pink Sand Sport Band", OLD),
    ("apple-watch-series-4", "Watch Series 4", "Space Gray aluminium case", "a black Sport Band", OLD),
    ("apple-watch-se-3-generation", "Watch SE (3rd generation)", "Starlight (warm champagne silver) aluminium case", "a Starlight Sport Band", MID),
    ("apple-watch-se-2-generation", "Watch SE (2nd generation)", "Silver aluminium case", "a white Sport Band", OLD),
    ("apple-watch-se", "Watch SE (1st generation)", "Gold aluminium case", "a beige Sport Band", OLD),
]:
    add(slug, watch(t, case, band, design), "watch")

for i, (slug, m) in enumerate(M.items()):
    m["prompt"] = m["prompt"].replace("{wall}", WALL[i % len(WALL)])
    m["size"] = "1024x1024" if m["kind"] == "watch" else "1536x1024"

json.dump(M, open("/tmp/apfel-dev-img/specs.json", "w"), indent=1, ensure_ascii=False)
print(len(M))
