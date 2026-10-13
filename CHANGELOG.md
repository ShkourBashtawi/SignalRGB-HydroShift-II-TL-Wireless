# Changelog

## 1.1.0 — 2026-10-13

- RX Finder prints a ready-to-copy settings block with the exact setting names and order.
- HydroShift II settings renamed to match (Pump MAC, Pump RX Slot, Fans MAC, …) and reordered; saved values are kept.
- Less log noise: the Finder no longer logs a USB timeout every 5 seconds; pump/fan status is logged once a minute.

## 1.0.0 — 2026-10-13

First working release.

- Live SignalRGB lighting for the HydroShift II pump ring and UNI FAN Wireless fans over the L-Wireless TX dongle.
- RX Finder device: lists wireless devices with MAC, RX slot, channel, pump/fan RPM and coolant temperature.
- tinyuz encoder in JavaScript, byte-identical to the official encoder for solid colors and verified with the official decoder.
- Content-based effect index (matches the vendor uploader), required for the device to accept each new frame.
- Verified on HydroShift II LCD-S 360 TL + 3× UNI FAN TL Wireless.
