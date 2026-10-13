# SignalRGB × Lian Li HydroShift II + UNI FAN TL Wireless

Control the lighting of the **Lian Li HydroShift II** (wireless) and **UNI FAN TL Wireless** fans from **SignalRGB**, live, together with the rest of your setup.

> 🇯🇴 Arabic guide: [README.ar.md](README.ar.md)

| Status | |
|---|---|
| ✅ Works | HydroShift II LCD-S pump ring + 3× UNI FAN TL Wireless, live from the SignalRGB canvas |
| 🧪 Should work, untested | HydroShift II LCD-C, other UNI FAN Wireless fans (SL V3, SL-INF, CL, TL V3, SL V4, P28 V2) |
| ❌ Not included | LCD screen content, fan/pump speed control |

> ⚠️ Community project. Not affiliated with Lian Li or WhirlwindFX. Use at your own risk.

---

## Before you start

- **L-Connect 3 must be fully closed**, including its background service. Both apps need the same USB dongles, and only one can use them at a time.
- While L-Connect is closed you **lose the LCD, fan curves and pump curves**. Fans and pump keep the last speed L-Connect set, so **set the speeds you want in L-Connect first**.
- In L-Connect, turn **off Motherboard RGB Sync** for your devices.

### Stop L-Connect permanently (one time)

1. In L-Connect 3, set your fan and pump speeds, then quit it from the tray icon.
2. Press `Win + R`, type `services.msc`, press Enter.
3. Open **L-Connect Service**, set **Startup type** to **Manual**, click **Stop**, then **OK**.

To go back to L-Connect at any time, start that service again and open L-Connect 3.

---

## Install (SignalRGB Add-on)

1. Open SignalRGB → **Settings** → **Add-ons**.
2. Click **Add Add-on** and paste this repository's URL:
   ```
   https://github.com/ShkourBashtawi/SignalRGB-HydroShift-II-TL-Wireless
   ```
3. Restart SignalRGB.

Two new devices appear under **Devices**:

| Device | What it does |
|---|---|
| **Lian Li Wireless RX (Finder)** | Reads your wireless devices and prints the values you need. No LEDs. |
| **Lian Li HydroShift II (Wireless)** | Sends the lighting to the pump and fans. |

---

## Setup (about 2 minutes)

### 1. Get your values from the Finder

Open **Lian Li Wireless RX (Finder)** and click the **console** icon `>_` at the top right. You'll see a ready-to-copy block:

```
==================================================
 COPY THESE INTO: Lian Li HydroShift II (Wireless)
==================================================
  Pump MAC ........... e7:f5:f3:e5:66:e1
  Pump RX Slot ....... 2
  Fans MAC ........... 81:0c:73:e5:66:e1
  Fans RX Slot ....... 1
  Fan Count .......... 3
  LEDs per Fan ....... 26
  Device Channel ..... 39
  TX Master Channel .. Auto
==================================================
```

> Your values will be different. Every device has its own MAC.

### 2. Copy them into the HydroShift II device

Open **Lian Li HydroShift II (Wireless)** → **Settings**. The settings have the **same names, in the same order** as the block. Copy each value across, and set **Updates per Second** to `15`.

### 3. Test

Set **Lighting Mode** to **Forced** and pick a color. The pump and fans should change within a second. Then set it back to **Canvas**.

SignalRGB saves these settings, so you only do this once.

---

## Tuning

| Setting | Use it when |
|---|---|
| Updates per Second | The animation stutters: try `15` or `18` (max). Flicker: try `10`. |
| Ring Rotation | The effect looks rotated on the rings |
| Reverse Ring Direction | Spirals or rainbows spin the wrong way |
| No pump or no fans | Leave that MAC as `00:00:00:00:00:00` to skip it |

**About smoothness:** Lian Li's wireless system was built to receive an effect and play it on its own. Streaming every frame over the radio is limited to roughly **15–18 updates per second** at best. Slow and medium effects look great; very fast ones can look slightly choppy.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| The two devices don't appear | `L-Connect-Service.exe` is still running. Stop it (see above) and restart SignalRGB. |
| Finder shows "No wireless devices" | The devices must be powered and already bound to this dongle. Bind them once in L-Connect, then close it. |
| "Wireless TX did not answer" | Close L-Connect completely, restart SignalRGB. |
| Colors never change | Re-check the MACs, RX slots and Device Channel against the Finder. |
| It stops working after a Windows restart | The L-Connect service started again. Set its Startup type to Manual. |
| Wrong colors on part of a fan | Check Fan Count and LEDs per Fan match the Finder. |

---

## How it works (short)

- The **TX dongle** (`0416:8040`) sends commands over the air; the **RX dongle** (`0416:8041`) reports the device list.
- Every update is a one-frame **RF_SET_RGB** upload: colors are compressed with **tinyuz**, split into 240-byte RF frames and sent as 64-byte USB packets.
- A 1-second **clock heartbeat** keeps the fans out of their fallback mode.

Details: [docs/PROTOCOL.md](docs/PROTOCOL.md)

## Verified

- Hardware: HydroShift II LCD-S 360 TL + 3× UNI FAN TL Wireless, L-Wireless TX/RX V1.6, SignalRGB 2.5.79 beta, Windows 11.
- Tests (`test/run_all.sh`): the compressor round-trips 86 inputs through the **official tinyuz decoder**; RF packets and effect indexes are byte-identical to the reference Rust implementation; the parser is tested on a real dongle reply.

## For developers

```bash
python3 build.py        # rebuild the two plugin files from src/
./test/run_all.sh       # needs node, gcc/g++, and tinyuz + HDiffPatch in ./vendor
```

Edit `src/` (`core.cjs`, `*.tpl`), not the generated `.js` files at the root. Only the two root `.js` files use the `.js` extension, because SignalRGB loads every `.js` file in an add-on as a plugin.

## Credits

- Protocol: [sgtaziz/lian-li-linux](https://github.com/sgtaziz/lian-li-linux) (MIT)
- Compression format: [sisong/tinyuz](https://github.com/sisong/tinyuz) (MIT)

## License

[MIT](LICENSE)
