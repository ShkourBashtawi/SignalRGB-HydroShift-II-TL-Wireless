#!/usr/bin/env python3
"""Inline src/core.cjs into the two plugin files at the repo root.

SignalRGB loads each plugin as a single .js file, so the shared protocol code in
src/core.cjs is pasted into both plugins at the //@@CORE@@ marker.
"""
from pathlib import Path

root = Path(__file__).parent
core = (root / "src/core.cjs").read_text(encoding="utf-8")
core = core[: core.index('if (typeof module !== "undefined")')].rstrip() + "\n"

for src, dst in [
    ("tx_plugin.tpl", "LianLi_HydroShift_II_Wireless.js"),
    ("rx_plugin.tpl", "LianLi_Wireless_RX_Finder.js"),
]:
    text = (root / "src" / src).read_text(encoding="utf-8").replace("//@@CORE@@", core)
    (root / dst).write_text(text, encoding="utf-8")
    print("built", dst)
