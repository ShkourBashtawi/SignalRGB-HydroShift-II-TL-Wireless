# Lian Li HydroShift II (Wireless) — SignalRGB Plugin

Community SignalRGB plugin that drives the **Lian Li HydroShift II LCD-S / LCD-C** AIO
over the **L-Wireless** dongles. It controls the pump-head ring and the fan rings live
from the SignalRGB canvas (about 10 updates per second).

> ⚠️ **Experimental, community-made, not affiliated with Lian Li or WhirlwindFX.**
> It has been verified against the reference protocol implementation and the official
> tinyuz decoder, but **not yet on every real unit**. Read "Before you start" first.

## What's included

| File | USB device | Purpose |
|------|-----------|---------|
| `LianLi_HydroShift_II_Wireless.js` | TX dongle `0416:8040` | Sends the lighting to the AIO |
| `LianLi_Wireless_RX_Finder.js` | RX dongle `0416:8041` | Finds the AIO's MAC and shows pump RPM + coolant temperature |

## Before you start

- **L-Connect 3 must be fully closed.** Both apps need the same USB dongles, and only one can hold them.
- **While L-Connect 3 is closed, you lose the LCD, fan curves and pump curves.** The plugin only does
  lighting. Fans and pump should keep the last speed L-Connect 3 set, so **before closing it, set a fixed
  fan and pump speed you're happy with.**
- On the first test, watch the **pump RPM and coolant temperature** on the RX Finder device page.
  If the pump shows 0 RPM or the temperature keeps climbing, close SignalRGB and reopen L-Connect 3.
- In L-Connect 3, **turn off Motherboard RGB Sync** for the AIO before closing it.

## Install

1. In L-Connect 3, set the fan and pump speeds you want and turn off MB RGB Sync for the AIO.
2. Fully quit L-Connect 3: tray icon → Exit. Then check Task Manager and end any remaining
   `L-Connect 3` / `L-Connect Service` processes. If a Windows service exists for it, stop it in `services.msc`.
3. Copy both `.js` files to:
   ```
   C:\Users\<you>\Documents\WhirlwindFX\Plugins\LianLi\
   ```
   (or `OneDrive\Documents\WhirlwindFX\Plugins\LianLi\` if Documents is synced)
4. Restart SignalRGB.

## First run

1. Open the **"Lian Li Wireless RX (Finder)"** device. Its page shows something like:
   `HydroShift II LCD-S (Wireless) — MAC 3c:11:22:33:44:55`
   Hover it to see the RX slot, channel, fan count, pump RPM and coolant temperature.
2. Open **"Lian Li HydroShift II (Wireless)"** and enter:
   - **AIO MAC**: the MAC from step 1
   - **RX Slot**: the slot from step 1 (or leave `255` to broadcast)
   - **Fans on the AIO**: `3` for a 360
3. The lights should now follow your SignalRGB effect.

## Tuning

| Setting | Use it when |
|--------|-------------|
| Ring Rotation | The effect looks rotated on a ring |
| Reverse Ring Direction | A spiral or rainbow runs the wrong way |
| Updates per Second | You see stutter: try 8 or 5 |
| Wireless Channel | The TX isn't found automatically: pick the channel L-Connect 3 used |
| Lighting Mode → Forced | Test with one solid colour |

## Troubleshooting

- **The devices don't appear in SignalRGB.** L-Connect 3 (or its service) is still running, or the
  dongle uses a driver SignalRGB can't open. Check the SignalRGB device log.
- **"Wireless TX did not answer"**: close L-Connect 3 completely and restart SignalRGB. If it still
  fails, set the Wireless Channel manually.
- **The Finder shows no devices**: the AIO must be powered and already bound to this dongle (bind it once in L-Connect 3).
- **Only some LEDs light, or the colours are offset**: check "Fans on the AIO" matches the fan count the Finder reports.

## Uninstall / roll back

Delete the two `.js` files, restart SignalRGB and reopen L-Connect 3. Nothing is written to the AIO's
firmware. The plugin only sends live lighting frames.

## How it works

- Finds the TX dongle's wireless channel and master MAC (`USB GetMac`, channel 8 first).
- Sends the 1-second `RF_ClockSync` heartbeat the fans expect from the host.
- For every update it builds a one-frame `RF_SET_RGB` upload (pump ring first, then each fan,
  24 LEDs each), compresses it with tinyuz, and sends it as 240-byte RF frames split into 64-byte USB packets.

## Verification done

- tinyuz encoder: 86 inputs (solid, gradients, random, 18 KB animations) all round-trip through the
  **official tinyuz decoder**, built with and without literal-line support.
- RF packets: byte-for-byte identical to the reference Rust implementation (32 packets + heartbeat).
- End-to-end simulation of both plugins against a mock dongle: the decoded payload equals the canvas colours for all 96 LEDs.

## Credits & license

MIT. Protocol knowledge from [sgtaziz/lian-li-linux](https://github.com/sgtaziz/lian-li-linux) (MIT).
Compression format from [sisong/tinyuz](https://github.com/sisong/tinyuz) (MIT).
