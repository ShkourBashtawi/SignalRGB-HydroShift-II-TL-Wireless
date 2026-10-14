# Changelog

## 1.4.0 — 2026-10-14

- **Automatic setup**: Pump MAC, RX slots, fan count, LEDs per fan and channel are taken from the RX Finder. Leave them at their defaults (`00:00:00:00:00:00`, `Broadcast`, `Auto`); values set by hand still win, so existing setups keep working.
- **Hardware effects**: new Lighting Mode `Hardware Effect` uploads a whole looping animation (Rainbow Wave, Rainbow Spin, Color Cycle, Breathing, Spinner, Static, or Canvas Loop = 4 s recorded from the running SignalRGB effect). The devices play it on their own at up to 20 fps. Each upload is confirmed through the effect index the RX Finder reports and re-sent if a device missed it or was power-cycled.
- **When SignalRGB Closes**: `Hardware Effect` stores the effect on the way out so the lighting keeps running with SignalRGB closed.
- Fan & Pump Control safety (from the official Lian Li wireless plugin's behaviour): never sends PWM 6 (the "follow motherboard" value), a missing or in-between curve value keeps the last speed, small changes are averaged over 10 samples, turning Fan Control off for the device in SignalRGB hands the fans back instead of stopping them, and devices without an RX slot (0) are never sent speeds.
- RX Finder remembers a device for 15 s when it misses a reply, so the pump no longer flickers out of the settings block or the auto setup.
- Sensor helper 1.4: the install test run no longer blocks the background copy from starting (single-instance lock is only taken by the background copy; the task is started after the test).
- **Fix (important): fans could be stopped** when Fan & Pump Control was on at start-up with automatic setup. Control started before the RX Finder had reported the fans, so no Fan 1-3 entries were created and the fans were sent PWM 0. Control now waits for the devices, adds or removes Fan Control entries when the devices change, never sends a fan PWM without its entry, and ignores levels for the first 3 s while SignalRGB applies the curves.
- New setting **Fans at 0%**: `Minimum speed` (default) runs a fan at its minimum duty when its curve reads 0%, and says so in the log and on the device page; `Stop the fans` allows 0%. Hand-back never returns a fan to a stopped or near-stopped duty (uses 60% instead).
- **Fan Handoff** (`helper/Install-Fan-Handoff.bat`): wireless fans don't spin until something talks to the dongle, and SignalRGB only starts after sign-in. L-Connect Service now runs the fans from power-on (Watcher stays disabled) and a task at sign-in stops it once SignalRGB is running, restarting SignalRGB once if it doesn't pick the devices up. Tested on hardware.
- Tests: new auto-setup + hardware-effect simulation, every built-in effect checked with the official tinyuz decoder, more fan-safety checks.

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
