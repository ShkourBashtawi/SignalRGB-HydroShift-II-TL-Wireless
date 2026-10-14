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
  - **Stored (hardware) effects** are the same upload with many frames: `frames` × `leds` × RGB, compressed together, played in a loop by the device at the frame interval. The plugin keeps uploads at ≥ 50 ms per frame (20 fps) and under the compressed-size limit, dropping frames and stretching the interval if needed. The device reports the effect it is playing in bytes 20–23 of its RX record, which is how each upload is confirmed.

## LED order

- HydroShift II: one 24-LED pump-head ring (`fan count` = 0 in its record).
- Fans: `fan count × LEDs per fan`, fan 1 first.

## LCD sensor screen (wireless AIO)

Ported from lian-li-linux `wireless/aio.rs` and the daemon's `controllers/aio.rs`.

**Theme switch** `RF_AIO_SWITCH_WIRELESS` (0x19), 240-byte RF frame, sent on the device channel to its RX slot:

| Byte | Value |
|---|---|
| 0 | `0x12` (RF_SELECT) |
| 1 | `0x19` |
| 2–7 | AIO MAC |
| 8–13 | TX master MAC |
| 14 | AIO RX slot |
| 15 | master channel |
| 16 | slot index: 1-based position of the AIO among devices bound to this master, in RX list order |
| 17 | sequence = last target + 1, or the AIO's current `cmd_seq` + 1 (wraps 254 → 1) |

The AIO acknowledges by reporting the sequence as `cmd_seq` (byte 40 of its 42-byte RX record). Retry every 2 s until then.

**Params** `RF_AIO_PARAMS` (0x21): same header (byte 17 = 0), then the 32-byte `aio_param` at bytes 18–49. Sent once a second.

| aio_param byte | Meaning |
|---|---|
| 0, 1, 2, 3 | CPU temp, CPU load, GPU temp, GPU load (0–99, truncated) |
| 6 | page time, seconds (1–30, default 3) |
| 7 | 1 |
| 8–11 | enable flag for each of the four values |
| 13–16, 17–20, 21–24 | label / value / unit color, A R G B |
| 25 | brightness 0–100 |
| 26 | 1 |
| 27 | theme 0–12 |
| 28–29 | pump timer, big-endian (see below) |
| 30 | rotation 0–3 (×90°) |

Pump timer from target RPM, piecewise linear, computed in f32 and truncated:
LCD-S (square) 1600–3200 rpm → 1590…0 (3200 rpm = 0 = full speed); LCD-C (round) 1600–2500 rpm → 1500…10.

## Fan speed (RF_PWM_CMD 0x10)

Ported from lian-li-linux `wireless/fan_speed.rs`. Same header as the AIO commands (byte 14 RX slot, 15 master channel, 16 slot index), then four PWM duties at bytes 17–20 (one per fan slot; slot 4 is the pump on an AIO). Unused slots are 0, non-zero duties are raised to the family's floor (TL 11 %, SL 14 %, P28 8 %, others 10 %), CL fans skip 153–155, SL-INF right-attach chains are reversed. The fans report the duty they run at in bytes 36–39 of their RX record.

Observed on real hardware: the fans adopt byte 15 as their channel. With the master on channel 8 and the fans set up on 39, the first PWM command moved them to channel 8. Frames sent on 39 afterwards (PWM and colours) were ignored until the plugin followed the channel the RX reports. Sending a PWM frame with byte 15 = 39 moved them back.

Wireless fans fall back to their own default duty (128) when PWM traffic stops for a while, so the target is re-sent every second.

Behaviour copied from the official SignalRGB Lian Li wireless plugin: duty **6** is a sentinel ("follow the motherboard PWM line"), so a computed 6 is sent as 7; slightly negative levels from SignalRGB are its curve interpolator and are treated as "no change"; duties are averaged over the last 10 samples (reset on a jump > 100); RX slot 0 means "not assigned" and is never addressed.

## Picture upload (RF_SEND_PIC 0x22)

A 480×480 JPEG of at most 20 480 bytes, sent in 220-byte chunks (byte 17 sequence, byte 18 chunk index, data from byte 19), then a terminator with index 0xFF and the length (big-endian) in bytes 19–20. Each frame needs a new sequence number and must be acknowledged through the RX `cmd_seq` before the next one (about 0.7 s per chunk with the Finder polling; 79 chunks took 55 s).

Tested on an LCD-S: the upload completed and was acknowledged, but the screen kept showing the sensor theme. lian-li-linux uses this command for the H2 **startup image**, so it does not change what is on screen, and SignalRGB LCD themes cannot be streamed over the wireless link.
