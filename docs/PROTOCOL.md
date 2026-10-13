# L-Wireless protocol notes (as used by this plugin)

Derived from [sgtaziz/lian-li-linux](https://github.com/sgtaziz/lian-li-linux) and verified against real hardware.

## USB

| Dongle | VID:PID | Interface | Endpoints |
|---|---|---|---|
| TX (master) | `0416:8040` | 0, vendor class | `0x01` bulk OUT, `0x81` bulk IN, 64-byte packets |
| RX (receiver) | `0416:8041` | 0, vendor class | same |

SignalRGB notes (`Type() = "rawusb"`):
- Write: `device.bulk_transfer(0x01, packet, 64, timeout)`.
- Read: `device.bulk_transfer(0x81, new Array(64).fill(0), 64, timeout)` returns `{length, data}`.
  The buffer must be pre-sized, and you read one 64-byte packet per call. Asking for 512 bytes times out.

## Commands

| USB byte 0 | Sent to | Meaning |
|---|---|---|
| `0x11` | TX | GetMac: `[0x11, channel]` → reply `[0x11, mac(6), clock(4 BE), fw(2 BE)]` |
| `0x10` | TX | Send RF: `[0x10, chunk 0..3, channel, rx_slot, 60 bytes of the RF frame]` |
| `0x10` | RX | GetDev: `[0x10, pages]` → `[0x10, count, pwm, pwm, records(42 bytes each)…]` |

## Device record (42 bytes)

| Bytes | Field |
|---|---|
| 0–5 | Device MAC |
| 6–11 | Master MAC |
| 12 | RF channel |
| 13 | RX slot |
| 18 | Device type (0 fans, 10 HydroShift II LCD-C, 11 LCD-S, 0xFF master) |
| 19 | Fan count |
| 20–23 | Current effect index |
| 24–27 | Fan type per slot (28–31 = UNI FAN TL Wireless, 26 LEDs) |
| 27 | Coolant °C (AIO) |
| 28–35 | 4× RPM (12-bit BE); slot 3 = pump on AIOs |
| 41 | Marker `0x1C` |

## RF frames (240 bytes)

- **Clock heartbeat** (every 1 s, broadcast on the master channel): `[0x12, 0x14, 0(6), master(6), 0x14×50, 0…]`.
- **RF_SET_RGB** (to the device channel and RX slot):
  - Header (index 0, sent twice): `[0x12, 0x20, mac(6), master(6), effect(4), 0, packets, len(4 BE), 0, frames(2 BE), leds, 0×4, ticks(2 BE), fraction, 0×5]`
  - Data (index 1..n): `[0x12, 0x20, mac, master, effect, index, packets, 220 bytes of tinyuz data]`
  - `effect` = FNV-1a over the compressed data + timing, high bit set. **It must change when the colors change**, otherwise the device ignores the upload.
  - Interval ticks = `ms × 160 / 100` (0.625 ms ticks).

## LED order

- HydroShift II: one 24-LED pump-head ring (`fan count` = 0 in its record).
- Fans: `fan count × LEDs per fan`, fan 1 first.
