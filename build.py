#!/usr/bin/env python3
"""Inline src/core.cjs into the two plugin files at the repo root.

SignalRGB loads each plugin as a single .js file, so the shared protocol code in
src/core.cjs is pasted into both plugins at the //@@CORE@@ marker.
"""
import base64
import io
import re
from pathlib import Path

root = Path(__file__).parent
core = (root / "src/core.cjs").read_text(encoding="utf-8")
core = core[: core.index('if (typeof module !== "undefined")')].rstrip() + "\n"

def image_data_url(name):
    """Embed the device image (256x256 PNG) so SignalRGB shows it without any download."""
    from PIL import Image

    img = Image.open(root / "assets" / name).convert("RGBA")
    # Trim the transparent margin so the device fills SignalRGB's small card.
    left, top, right, bottom = img.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    side = max(right - left, bottom - top) + 24
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(img.crop((left, top, right, bottom)), ((side - (right - left)) // 2, (side - (bottom - top)) // 2))
    img = square.resize((256, 256), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


for src, dst in [
    ("tx_plugin.tpl", "LianLi_HydroShift_II_Wireless.js"),
    ("rx_plugin.tpl", "LianLi_Wireless_RX_Finder.js"),
]:
    text = (root / "src" / src).read_text(encoding="utf-8").replace("//@@CORE@@", core)
    text = re.sub(r"@@IMAGE:([\w.]+)@@", lambda m: image_data_url(m.group(1)), text)
    (root / dst).write_text(text, encoding="utf-8")
    print("built", dst)
