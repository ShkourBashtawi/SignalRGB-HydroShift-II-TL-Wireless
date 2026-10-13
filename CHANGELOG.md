# Changelog

## 1.3.0 — 2026-10-13

- **Fan & Pump Control**: the pump and each fan appear on SignalRGB's Fan Control page and follow its curves (RF_PWM_CMD for fans, pump timer in the aio params). Coolant temperature is published as a sensor, live RPM from the RX Finder. Off by default; turning it off hands the previous fan duty, fan channel and the Pump Speed setting back.
- Each device is now addressed on the channel the RX Finder reports for it (Device Channel is the fallback). Found on real hardware: the first speed command moves the fans to the master channel.
- `DeviceType` is now `aio`.
- New device artwork (360 radiator with three TL fans and the square LCD pump head), embedded in the plugins so it shows without any download.
- RX Finder: a single missed reply no longer flashes a warning.
- Researched SignalRGB LCD themes on the wireless LCD: the wireless picture command (RF_SEND_PIC) sets the startup image, it does not change what is on screen, so live LCD themes/images are not possible over the wireless link. Frame builder and Rust-verified tests kept in `src/core.cjs` for reference.

## 1.2.0 — 2026-10-13

- **LCD sensor screen**: shows CPU/GPU temperature and load on the HydroShift II LCD using its built-in sensor themes (13 layouts), with brightness, rotation, page time and text colors.
- **HydroShiftSensors helper** (`helper/`): PowerShell, no install needed to test. Reads LibreHardwareMonitor's web server when available, otherwise Windows counters + `nvidia-smi`. Sends JSON to the plugin on `127.0.0.1:51870`. Optional hidden autostart task.
- RX Finder polls every second and shares the device list with the HydroShift plugin over local UDP (confirms the screen switch, watches the pump).
- Pump speed setting (sent with the LCD data, default 3200 rpm) and a low-RPM warning.
- Device images for both devices.
- LCD is **off by default**: existing setups behave exactly as in 1.1 until you turn it on.

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
