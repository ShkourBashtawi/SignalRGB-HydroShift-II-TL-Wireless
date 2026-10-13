#!/usr/bin/env python3
"""Inline src/core.js into the two SignalRGB plugin files (SignalRGB loads single files)."""
from pathlib import Path
root = Path(__file__).parent
core = (root / "src/core.js").read_text()
core = core[: core.index('if (typeof module !== "undefined")')].rstrip() + "\n"
out = root / "plugin"
out.mkdir(exist_ok=True)
for src, dst in [("tx_plugin.js", "LianLi_HydroShift_II_Wireless.js"), ("rx_plugin.js", "LianLi_Wireless_RX_Finder.js")]:
    (out / dst).write_text((root / "src" / src).read_text().replace("//@@CORE@@", core))
    print("built", dst)
