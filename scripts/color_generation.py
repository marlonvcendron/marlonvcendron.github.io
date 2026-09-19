import random

import oklab

random.seed(2666 + 2666)

N_TONES = 15
RAND_LOWER = -0.05
RAND_UPPER = 0.08

cmap = ["c", "m", "y"]
colors = ["#049EBC", "#ED4A96", "#FCEA33"]

tones = {}
for c, color in zip(cmap, colors):
    lch = oklab.hex_to_lch(color)

    tones[c] = []

    for i in range(N_TONES):
        rand = random.uniform(RAND_LOWER, RAND_UPPER)
        tone_lch = (lch[0], lch[1] + rand, lch[2])
        tone_lab = oklab.lch_to_lab(tone_lch)
        tone_rgb = oklab.clip(oklab.lab_to_rgb(tone_lab))
        hex = oklab.rgb_to_hex(tone_rgb) + "FF"
        js_hex = ("0x" + hex[1:]).upper()
        tones[c].append(js_hex)


print("{")
for c, c_tones in tones.items():
    print(f"  '{c}': [" + ", ".join(c_tones) + "],")
print("}")
