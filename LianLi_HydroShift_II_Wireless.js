// Lian Li HydroShift II + UNI FAN Wireless — SignalRGB plugin (L-Wireless TX dongle)
// Drives the HydroShift II pump-head ring and a group of UNI FAN wireless fans live
// from the SignalRGB canvas, and (optional) shows CPU/GPU temperature and load on
// the pump's LCD using the screen's built-in sensor theme.
//
// Community plugin, not affiliated with Lian Li or WhirlwindFX.
// Protocol ported from sgtaziz/lian-li-linux (MIT); compression from sisong/tinyuz (MIT).
// License: MIT

export function Name() { return "Lian Li HydroShift II (Wireless)"; }
export function VendorId() { return 0x0416; }
export function ProductId() { return 0x8040; }
export function Publisher() { return "ShkourArrio"; }
export function Documentation() { return ""; }
export function Type() { return "rawusb"; }
export function Size() { return layout.size; }
export function DefaultPosition() { return [10, 40]; }
export function DefaultScale() { return 8.0; }
export function ImageUrl() { return "data:image/png;base64,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"; }
export function DeviceType() { return "aio"; }
export function SupportsFanControl() { return true; }
export function ConflictingProcesses() { return ["L-Connect 3.exe", "L-Connect-Service.exe"]; }

/* global
shutdownColor:readonly
LightingMode:readonly
forcedColor:readonly
PumpMac:readonly
PumpRxSlot:readonly
FansMac:readonly
FansRxSlot:readonly
FanCount:readonly
LedsPerFan:readonly
RingRotation:readonly
RingReverse:readonly
UpdateRate:readonly
WirelessChannel:readonly
DeviceChannel:readonly
ScreenMode:readonly
ScreenTheme:readonly
ScreenBrightness:readonly
ScreenRotation:readonly
ScreenCycle:readonly
ScreenLabelColor:readonly
ScreenValueColor:readonly
ScreenUnitColor:readonly
PumpSpeed:readonly
PumpHead:readonly
FanControl:readonly
FanStop:readonly
HwEffect:readonly
HwSpeed:readonly
HwColor:readonly
OnExit:readonly
*/
export function ControllableParameters() {
	return [
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#000000"},
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced", "Hardware Effect"], "default":"Canvas"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"HwEffect", "group":"lighting", "label":"Hardware Effect", "description":"Stored on the pump and fans and played by them at 20 frames per second. Used by Lighting Mode 'Hardware Effect' and by 'When SignalRGB Closes'. Canvas Loop records 4 seconds of the current SignalRGB effect.", "type":"combobox", "values":["Rainbow Wave", "Rainbow Spin", "Color Cycle", "Breathing", "Spinner", "Static", "Canvas Loop"], "default":"Rainbow Wave"},
		{"property":"HwSpeed", "group":"lighting", "label":"Effect Speed", "type":"number", "min":"1", "max":"10", "step":"1", "default":"5"},
		{"property":"HwColor", "group":"lighting", "label":"Effect Color", "description":"For Breathing, Spinner and Static.", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"OnExit", "group":"lighting", "label":"When SignalRGB Closes", "description":"Hardware Effect leaves the stored effect running on the devices after SignalRGB exits.", "type":"combobox", "values":["Shutdown Color", "Hardware Effect"], "default":"Shutdown Color"},
		{"property":"PumpMac", "group":"", "label":"Pump MAC", "description":"Leave 00:00:00:00:00:00 to use the pump the RX Finder sees (automatic).", "type":"textfield", "default":"00:00:00:00:00:00"},
		{"property":"PumpRxSlot", "group":"", "label":"Pump RX Slot", "description":"Broadcast = take it from the RX Finder (automatic).", "type":"combobox", "values":["Broadcast", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], "default":"Broadcast"},
		{"property":"FansMac", "group":"", "label":"Fans MAC", "description":"Leave 00:00:00:00:00:00 to use the fan group the RX Finder sees (automatic).", "type":"textfield", "default":"00:00:00:00:00:00"},
		{"property":"FansRxSlot", "group":"", "label":"Fans RX Slot", "description":"Broadcast = take it from the RX Finder (automatic).", "type":"combobox", "values":["Broadcast", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], "default":"Broadcast"},
		{"property":"FanCount", "group":"", "label":"Fan Count", "type":"combobox", "values":["Auto", "1", "2", "3", "4"], "default":"Auto"},
		{"property":"LedsPerFan", "group":"", "label":"LEDs per Fan", "type":"combobox", "values":["Auto", "26", "24", "40", "44", "52", "9"], "default":"Auto"},
		{"property":"DeviceChannel", "group":"", "label":"Device Channel", "type":"combobox", "values":["Same as TX", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"], "default":"Same as TX"},
		{"property":"WirelessChannel", "group":"", "label":"TX Master Channel", "type":"combobox", "values":["Auto", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"], "default":"Auto"},
		{"property":"UpdateRate", "group":"", "label":"Updates per Second", "type":"combobox", "values":["5", "10", "15", "18"], "default":"15"},
		{"property":"RingRotation", "group":"", "label":"Ring Rotation", "type":"number", "min":"0", "max":"23", "step":"1", "default":"0"},
		{"property":"RingReverse", "group":"", "label":"Reverse Ring Direction", "type":"boolean", "default":"false"},
		{"property":"FanStop", "group":"", "label":"Fans at 0%", "description":"What a 0% point on a SignalRGB fan curve does. Minimum speed keeps the fans turning (safer: a fresh or empty curve reads 0%).", "type":"combobox", "values":["Minimum speed", "Stop the fans"], "default":"Minimum speed"},
		{"property":"FanControl", "group":"", "label":"Fan & Pump Control", "description":"SignalRGB Fan Control drives the pump and every fan from curves on SignalRGB's Fan Control page. Off leaves the speeds the devices already have.", "type":"combobox", "values":["Off (keep current speeds)", "SignalRGB Fan Control"], "default":"Off (keep current speeds)"},
		{"property":"ScreenMode", "group":"", "label":"LCD Screen", "type":"combobox", "values":["Off (don't touch)", "CPU/GPU Sensors"], "default":"Off (don't touch)"},
		{"property":"ScreenTheme", "group":"", "label":"LCD Theme", "type":"combobox", "values":["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], "default":"1"},
		{"property":"ScreenBrightness", "group":"", "label":"LCD Brightness", "type":"number", "min":"0", "max":"100", "step":"5", "default":"80"},
		{"property":"ScreenRotation", "group":"", "label":"LCD Rotation", "type":"combobox", "values":["0°", "90°", "180°", "270°"], "default":"0°"},
		{"property":"ScreenCycle", "group":"", "label":"LCD Page Time (s)", "type":"number", "min":"1", "max":"30", "step":"1", "default":"3"},
		{"property":"ScreenLabelColor", "group":"", "label":"LCD Label Color", "min":"0", "max":"360", "type":"color", "default":"#ffffff"},
		{"property":"ScreenValueColor", "group":"", "label":"LCD Value Color", "min":"0", "max":"360", "type":"color", "default":"#ffffff"},
		{"property":"ScreenUnitColor", "group":"", "label":"LCD Unit Color", "min":"0", "max":"360", "type":"color", "default":"#ffffff"},
		{"property":"PumpSpeed", "group":"", "label":"Pump Speed (with LCD on)", "type":"combobox", "values":["3200 rpm (max)", "3000 rpm", "2800 rpm", "2600 rpm", "2400 rpm", "2200 rpm", "2000 rpm", "1800 rpm", "1600 rpm"], "default":"3200 rpm (max)"},
		{"property":"PumpHead", "group":"", "label":"Pump Head", "type":"combobox", "values":["LCD-S (square)", "LCD-C (round)"], "default":"LCD-S (square)"},
	];
}

import udp from "@SignalRGB/udp";

// ---------------------------------------------------------------------------
// Lian Li L-Wireless protocol core (shared by the TX and RX plugins).
//
// Ported from sgtaziz/lian-li-linux (MIT) and sisong/tinyuz (MIT).
// This block has no SignalRGB dependencies so it can be unit-tested in Node.
// ---------------------------------------------------------------------------

const LL_USB_CMD_SEND_RF = 0x10;
const LL_USB_CMD_GET_MAC = 0x11;

const LL_RF_SELECT = 0x12;
const LL_RF_CLOCK_SYNC = 0x14;
const LL_RF_SET_RGB = 0x20;
const LL_RF_PWM_CMD = 0x10;
const LL_RF_SEND_PIC = 0x22;
const LL_PIC_CHUNK_BYTES = 220;
const LL_MAX_AIO_IMAGE_BYTES = 20480;
const LL_RF_AIO_SWITCH_WIRELESS = 0x19;
const LL_RF_AIO_PARAMS = 0x21;
const LL_AIO_PARAM_LEN = 32;

const LL_RF_DATA_SIZE = 240;
const LL_RF_CHUNK_SIZE = 60;
const LL_RF_CHUNKS = 4;
const LL_RGB_CHUNK_BYTES = 220;
const LL_MAX_COMPRESSED_BYTES = 12288;

const LL_LEDS_PER_RING = 24;

// ----------------------------- tinyuz encoder ------------------------------
// Emits a stream the stock tinyuz decoder accepts: 4-byte LE dict size, then
// type bits interleaved with data / match / ctrl codes, ending in streamEnd.
// Literal-line ctrl codes are never emitted, so the stream is valid whether the
// firmware decoder was built with tuz_isNeedLiteralLine or not.

const TUZ_MIN_DICT_MATCH_LEN = 2;
const TUZ_BIG_POS_FOR_LEN = (1 << 11) + (1 << 9) + (1 << 7) - 1;
const TUZ_CTRL_STREAM_END = 3;
const TUZ_DICT_WINDOW = 4096;
const TUZ_MAX_MATCH = 1024;

function tuzCompress(input) {
	const n = input.length;
	if (n === 0) {
		throw new Error("tinyuz: cannot compress empty input");
	}

	const code = [0, 0, 0, 0]; // dict size placeholder
	let typesIndex = 0;
	let typeCount = 0;
	let haveDataBack = false;
	let dictPosBack = 1;
	let dictSizeMax = 1;

	function outType(bit) {
		if (typeCount === 0) {
			typesIndex = code.length;
			code.push(0);
		}
		code[typesIndex] |= (bit & 1) << typeCount;
		typeCount++;
		if (typeCount === 8) {
			typeCount = 0;
		}
	}

	function outLen(v, packBit) {
		let count = 1;
		while (true) {
			const m = 1 << (count * packBit);
			if (v < m) {
				break;
			}
			v -= m;
			count++;
		}
		let c = count;
		while (c--) {
			for (let i = 0; i < packBit; i++) {
				outType((v >> (c * packBit + i)) & 1);
			}
			outType(c > 0 ? 1 : 0);
		}
	}

	function outDictPos(pos) {
		const isOutLen = pos >= 128 ? 1 : 0;
		if (isOutLen) {
			pos -= 128;
		}
		code.push((pos & 127) | (isOutLen << 7));
		if (isOutLen) {
			outLen(pos >> 7, 2);
		}
	}

	function outData(byte) {
		outType(1);
		code.push(byte & 0xff);
		haveDataBack = true;
	}

	function outDict(matchLen, distance) {
		outType(0);
		const saved = distance; // dict_pos + 1
		if (saved > dictSizeMax) {
			dictSizeMax = saved;
		}
		const isSavedSamePos = dictPosBack === saved && haveDataBack;
		let len = matchLen - TUZ_MIN_DICT_MATCH_LEN;
		if (!isSavedSamePos && saved > TUZ_BIG_POS_FOR_LEN) {
			len--;
		}
		outLen(len, 1);
		if (haveDataBack) {
			outType(isSavedSamePos ? 1 : 0);
		}
		if (!isSavedSamePos) {
			outDictPos(saved);
		}
		haveDataBack = false;
		dictPosBack = saved;
	}

	function outCtrl(ctrl) {
		outType(0);
		outLen(ctrl, 1);
		if (haveDataBack) {
			outType(0);
		}
		outDictPos(0);
	}

	// Greedy LZ77 with a 3-byte hash chain.
	const head = new Map();
	const prev = new Array(n).fill(-1);
	const key = (i) => (input[i] << 16) | (input[i + 1] << 8) | input[i + 2];

	function insert(i) {
		if (i + 2 < n) {
			const k = key(i);
			prev[i] = head.has(k) ? head.get(k) : -1;
			head.set(k, i);
		}
	}

	let i = 0;
	while (i < n) {
		let bestLen = 0;
		let bestDist = 0;

		if (i + 2 < n) {
			let cand = head.has(key(i)) ? head.get(key(i)) : -1;
			let chain = 0;
			while (cand >= 0 && i - cand <= TUZ_DICT_WINDOW && chain < 64) {
				let l = 0;
				const maxL = Math.min(TUZ_MAX_MATCH, n - i);
				while (l < maxL && input[cand + l] === input[i + l]) {
					l++;
				}
				const dist = i - cand;
				const minLen = dist > TUZ_BIG_POS_FOR_LEN ? 3 : TUZ_MIN_DICT_MATCH_LEN;
				if (l >= minLen && l > bestLen) {
					bestLen = l;
					bestDist = dist;
				}
				cand = prev[cand];
				chain++;
			}
		}

		if (bestLen >= 3) {
			outDict(bestLen, bestDist);
			for (let k = 0; k < bestLen; k++) {
				insert(i + k);
			}
			i += bestLen;
		} else {
			outData(input[i]);
			insert(i);
			i++;
		}
	}

	outCtrl(TUZ_CTRL_STREAM_END);

	const dictSize = Math.max(1, dictSizeMax);
	code[0] = dictSize & 0xff;
	code[1] = (dictSize >> 8) & 0xff;
	code[2] = (dictSize >> 16) & 0xff;
	code[3] = (dictSize >> 24) & 0xff;

	return code;
}

// ------------------------------ helpers ------------------------------------

function llParseMac(text) {
	if (typeof text !== "string") {
		return null;
	}
	const parts = text.trim().split(/[:\-\s]/).filter((p) => p.length > 0);
	if (parts.length !== 6) {
		return null;
	}
	const mac = [];
	for (const p of parts) {
		if (!/^[0-9a-fA-F]{1,2}$/.test(p)) {
			return null;
		}
		mac.push(parseInt(p, 16));
	}
	if (mac.every((b) => b === 0)) {
		return null;
	}
	return mac;
}

function llMacToString(mac) {
	return mac.map((b) => b.toString(16).padStart(2, "0")).join(":");
}

function llU16BE(v) {
	return [(v >> 8) & 0xff, v & 0xff];
}

function llU32BE(v) {
	return [(v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
}

// ---------------------------- RF frames -------------------------------------

// Split a 240-byte RF frame into the four 64-byte USB packets the TX expects.
function llRfToUsbPackets(rf, channel, rxTarget) {
	if (rf.length !== LL_RF_DATA_SIZE) {
		throw new Error("RF frame must be 240 bytes");
	}
	const packets = [];
	for (let idx = 0; idx < LL_RF_CHUNKS; idx++) {
		const p = new Array(64).fill(0);
		p[0] = LL_USB_CMD_SEND_RF;
		p[1] = idx;
		p[2] = channel & 0xff;
		p[3] = rxTarget & 0xff;
		for (let k = 0; k < LL_RF_CHUNK_SIZE; k++) {
			p[4 + k] = rf[idx * LL_RF_CHUNK_SIZE + k];
		}
		packets.push(p);
	}
	return packets;
}

// RF_ClockSync heartbeat. Byte layout mirrors master_clock_rf_data(); the
// per-receiver block is all zeros, as the reference daemon sends it.
function llBuildClockFrame(masterMac) {
	const rf = new Array(LL_RF_DATA_SIZE).fill(0);
	rf[0] = LL_RF_SELECT;
	rf[1] = LL_RF_CLOCK_SYNC;
	for (let k = 0; k < 6; k++) {
		rf[8 + k] = masterMac[k];
	}
	for (let k = 14; k < 64; k++) {
		rf[k] = 0x14;
	}
	return rf;
}

function llGetMacPacket(channel) {
	const p = new Array(64).fill(0);
	p[0] = LL_USB_CMD_GET_MAC;
	p[1] = channel & 0xff;
	return p;
}

function llValidMasterResponse(r) {
	if (!r || r.length < 13 || r[0] !== LL_USB_CMD_GET_MAC) {
		return false;
	}
	let nonZero = false;
	for (let k = 1; k < 7; k++) {
		if (r[k] !== 0) {
			nonZero = true;
		}
	}
	const clock = ((r[7] << 24) | (r[8] << 16) | (r[9] << 8) | r[10]) >>> 0;
	return nonZero && clock > 1;
}

// Channel probe order used by the reference daemon: 8 first, then the even
// channels, then the odd ones.
function llChannelProbeOrder() {
	const order = [8];
	for (let ch = 2; ch <= 38; ch += 2) {
		if (ch !== 8) {
			order.push(ch);
		}
	}
	for (let ch = 1; ch <= 39; ch += 2) {
		order.push(ch);
	}
	return order;
}

// Build every RF frame for one RGB upload (header + data chunks).
// frames: array of frames, each an array of [r,g,b] for every LED.
function llBuildRgbUpload(frames, intervalMs, effectIndex) {
	if (intervalMs < 1 || intervalMs > 40959) {
		throw new Error("RGB interval must be 1..40959 ms");
	}
	return llBuildRgbUploadTicks(frames, intervalMs * 160, effectIndex);
}

// Same, with the interval in hundredths of a 0.625 ms RF tick.
function llBuildRgbUploadTicks(frames, hundredths, effectIndex) {
	if (!frames.length || frames.length > 4096) {
		throw new Error("RGB upload needs 1..4096 frames");
	}
	const ledCount = frames[0].length;
	if (ledCount < 1 || ledCount > 255) {
		throw new Error("RGB upload needs 1..255 LEDs per frame");
	}
	if (hundredths < 100 || hundredths > 6553599) {
		throw new Error("RGB interval out of range");
	}

	const raw = [];
	for (const frame of frames) {
		if (frame.length !== ledCount) {
			throw new Error("RGB frames must have equal LED counts");
		}
		for (const c of frame) {
			raw.push(c[0] & 0xff, c[1] & 0xff, c[2] & 0xff);
		}
	}

	const compressed = tuzCompress(raw);
	if (compressed.length > LL_MAX_COMPRESSED_BYTES) {
		throw new Error("compressed RGB animation is too large");
	}

	const intervalTicks = Math.floor(hundredths / 100);
	const intervalFraction = hundredths % 100;
	const dataPackets = Math.ceil(compressed.length / LL_RGB_CHUNK_BYTES);

	// FNV-1a over the payload + timing, as the vendor uploader does. The high
	// bit keeps the first byte from ever looking like a valid RX slot.
	let hash = 0x811c9dc5;
	const feed = (b) => {
		hash = Math.imul(hash ^ (b & 0xff), 0x01000193) >>> 0;
	};
	compressed.forEach(feed);
	llU16BE(intervalTicks).forEach(feed);
	feed(intervalFraction);
	llU16BE(frames.length).forEach(feed);
	feed(ledCount);
	[0, 0, 0, 0, 0].forEach(feed); // secondary interval (u16), secondary frames (u16), outer_longest
	const autoIndex = llU32BE(hash);
	autoIndex[0] |= 0x80;

	return {
		compressed,
		ledCount,
		frameCount: frames.length,
		intervalTicks,
		intervalFraction,
		effectIndex: (effectIndex || autoIndex).slice(0, 4),
		packetCount: dataPackets + 1,
	};
}

function llRgbPacket(upload, mac, master, index) {
	const p = new Array(LL_RF_DATA_SIZE).fill(0);
	p[0] = LL_RF_SELECT;
	p[1] = LL_RF_SET_RGB;
	for (let k = 0; k < 6; k++) {
		p[2 + k] = mac[k];
		p[8 + k] = master[k];
	}
	for (let k = 0; k < 4; k++) {
		p[14 + k] = upload.effectIndex[k];
	}
	p[18] = index & 0xff;
	p[19] = upload.packetCount & 0xff;

	if (index === 0) {
		const len = llU32BE(upload.compressed.length);
		for (let k = 0; k < 4; k++) {
			p[20 + k] = len[k];
		}
		const fc = llU16BE(upload.frameCount);
		p[25] = fc[0];
		p[26] = fc[1];
		p[27] = upload.ledCount;
		const it = llU16BE(upload.intervalTicks);
		p[32] = it[0];
		p[33] = it[1];
		p[34] = upload.intervalFraction;
		// [35..40] secondary timing: unused (zero)
	} else {
		const offset = (index - 1) * LL_RGB_CHUNK_BYTES;
		const end = Math.min(upload.compressed.length, offset + LL_RGB_CHUNK_BYTES);
		for (let k = offset; k < end; k++) {
			p[20 + (k - offset)] = upload.compressed[k];
		}
	}
	return p;
}

// Discovery: one 42-byte record from the RX GetDev reply.
function llParseDeviceRecord(d) {
	if (!d || d.length < 42 || d[41] !== 0x1c) {
		return null;
	}
	const mac = d.slice(0, 6);
	if (mac.every((b) => b === 0)) {
		return null;
	}
	const rawFans = d[19];
	const status = d[28];
	return {
		mac,
		masterMac: d.slice(6, 12),
		channel: d[12],
		rxType: d[13],
		deviceType: d[18],
		isMaster: d[18] === 0xff,
		fanCount: Math.min(rawFans >= 10 ? rawFans - 10 : rawFans, 4),
		coolantC: d[27],
		fanRpm: [
			((d[28] & 0x0f) << 8) | d[29],
			((d[30] & 0x0f) << 8) | d[31],
			((d[32] & 0x0f) << 8) | d[33],
			((d[34] & 0x0f) << 8) | d[35],
		],
		mbRgbSync: (status & 0x40) !== 0,
		pwmLineOn: (status & 0x20) !== 0,
		rightAttach: rawFans >= 10,
		currentPwm: d.slice(36, 40),
		cmdSeq: d[40],
		fanTypes: d.slice(24, 28),
		effectIndex: d.slice(20, 24),
	};
}

function llParseGetDev(resp) {
	if (!resp || resp.length < 4 || resp[0] !== LL_USB_CMD_SEND_RF) {
		return null;
	}
	const count = resp[1];
	const out = [];
	let off = 4;
	for (let i = 0; i < count && off + 42 <= resp.length; i++, off += 42) {
		const rec = llParseDeviceRecord(resp.slice(off, off + 42));
		if (rec) {
			out.push(rec);
		}
	}
	return out;
}

function llDeviceTypeName(t) {
	switch (t) {
	case 10: return "HydroShift II LCD-C (Wireless)";
	case 11: return "HydroShift II LCD-S (Wireless)";
	case 65: return "Lancool 217";
	case 66: return "Lancool V150";
	case 88: return "Universal Screen 8.8\"";
	case 0xff: return "Wireless master (TX)";
	default:
		return t >= 1 && t <= 9 ? "Strimer Wireless" : "Wireless fans";
	}
}

// Wireless fan family from the per-slot fan type byte (lian-li-linux fan_type.rs).
function llFanFamily(typeByte) {
	const b = typeByte;
	if (b >= 20 && b <= 22) return { name: "UNI FAN SL V3 Wireless", leds: 40 };
	if (b >= 23 && b <= 26) return { name: "UNI FAN SL V3 Wireless LCD", leds: 40 };
	if (b === 27 || (b >= 32 && b <= 35)) return { name: "UNI FAN TL Wireless LCD", leds: 26 };
	if (b >= 28 && b <= 31) return { name: "UNI FAN TL Wireless", leds: 26 };
	if (b >= 36 && b <= 39) return { name: "UNI FAN SL-INF Wireless", leds: 44 };
	if (b >= 40 && b <= 42) return { name: "UNI FAN CL Wireless", leds: 24 };
	if (b >= 43 && b <= 50) return { name: "UNI FAN SL-INF V3 Wireless", leds: 44 };
	if (b >= 51 && b <= 58) return { name: "UNI FAN TL V3 Wireless", leds: 26 };
	if (b >= 59 && b <= 62) return { name: "UNI FAN SL V4 Wireless", leds: 52 };
	if (b === 63) return { name: "UNI FAN P28 V2 Wireless", leds: 9 };
	if (b === 126 || b === 127) return { name: "UNI FAN CL V2 Wireless", leds: 24 };
	return null;
}

// Canvas layout. Index order matches what each device's firmware expects:
// [0..24) pump-head ring, then fan 1, fan 2, ... (ledsPerFan each).
function llBuildLayout(fanCount, ledsPerFan, rotation, reverse) {
	const names = [];
	const positions = [];
	const meta = []; // per LED: ring step / count (exact), x across the canvas 0..1
	const width = 12 * (fanCount + 1);
	const ring = (count, cx, cy, r, label) => {
		for (let i = 0; i < count; i++) {
			let step = reverse ? (count - i) % count : i;
			step = (step + Math.round((rotation * count) / LL_LEDS_PER_RING)) % count;
			const a = -Math.PI / 2 + (2 * Math.PI * step) / count;
			names.push(`${label} LED ${i + 1}`);
			const x = Math.round(cx + r * Math.cos(a));
			positions.push([x, Math.round(cy + r * Math.sin(a))]);
			meta.push({ step, count, x: (cx + r * Math.cos(a)) / width });
		}
	};
	ring(LL_LEDS_PER_RING, 6 + 12 * fanCount, 6, 5, "Pump");
	for (let f = 0; f < fanCount; f++) {
		ring(ledsPerFan, 6 + 12 * f, 6, 5, `Fan ${f + 1}`);
	}
	return {
		names,
		positions,
		meta,
		size: [12 * (fanCount + 1), 12],
		pumpCount: LL_LEDS_PER_RING,
		fanLedCount: fanCount * ledsPerFan,
	};
}

// ------------------------------ AIO LCD -------------------------------------
// The HydroShift II LCD has a built-in "wireless theme" mode that draws CPU/GPU
// values the host sends in a 32-byte aio_param block (RF_AIO_PARAMS). The block
// also carries the pump speed, so every send sets the pump too.
// Ported from lian-li-linux: wireless/aio.rs + daemon controllers/aio.rs.

const LL_PUMP_RANGE = {
	square: [1600, 3200], // LCD-S (WaterBlock2)
	circle: [1600, 2500], // LCD-C (WaterBlock)
};

// Rust computes these curves in f32; Math.fround keeps the truncation identical.
function llF32Curve(rpm, lo, hi, segments) {
	const f = Math.fround;
	const r = f(Math.min(Math.max(rpm, lo), hi));
	for (const [upTo, base, start, slope] of segments) {
		if (r <= upTo) {
			const t = f(f(base) - f(f(r - start) * f(slope)));
			return Math.min(Math.max(Math.trunc(t), 0), 0xffff);
		}
	}
	return 0;
}

function llSquarePumpTimer(rpm) {
	return llF32Curve(rpm, 1600, 3200, [
		[1800, 1590, 1600, 0.95],
		[2000, 1400, 1800, 1],
		[2200, 1200, 2000, 1],
		[2400, 1000, 2200, 1],
		[2600, 800, 2400, 1],
		[2800, 580, 2600, 1.11],
		[3000, 330, 2800, 1.2],
		[Infinity, 90, 3000, 0.45],
	]);
}

function llCirclePumpTimer(rpm) {
	return llF32Curve(rpm, 1600, 2500, [
		[1720, 1500, 1600, 1.667],
		[1870, 1300, 1720, 2],
		[2000, 1000, 1870, 1.23],
		[2300, 840, 2000, 2],
		[2400, 240, 2300, 1.8],
		[Infinity, 60, 2400, 0.5],
	]);
}

function llPumpTimer(rpm, shape) {
	return shape === "circle" ? llCirclePumpTimer(rpm) : llSquarePumpTimer(rpm);
}

// Colors are [r, g, b] (alpha is always 255) and written as A, R, G, B.
function llBuildAioParam(o) {
	const p = new Array(LL_AIO_PARAM_LEN).fill(0);
	const val = (v) => (typeof v === "number" && isFinite(v) ? Math.trunc(Math.min(Math.max(v, 0), 99)) : null); // Rust: clamp(0,99) as u8
	const sensors = [o.cpuTemp, o.cpuLoad, o.gpuTemp, o.gpuLoad].map(val);
	for (let k = 0; k < 4; k++) {
		p[k] = sensors[k] === null ? 0 : sensors[k];
		p[8 + k] = sensors[k] === null ? 0 : 1;
	}
	p[6] = Math.min(Math.max(o.loopInterval || 3, 1), 30);
	p[7] = 1;
	const argb = (at, c) => {
		const rgb = c || [255, 255, 255];
		p[at] = 255;
		p[at + 1] = rgb[0] & 0xff;
		p[at + 2] = rgb[1] & 0xff;
		p[at + 3] = rgb[2] & 0xff;
	};
	argb(13, o.labelColor);
	argb(17, o.valueColor);
	argb(21, o.unitColor);
	p[25] = Math.min(Math.max(o.brightness === undefined ? 80 : o.brightness, 0), 100);
	p[26] = 1;
	p[27] = Math.min(Math.max(o.theme || 0, 0), 12);
	const timer = llPumpTimer(o.pumpRpm, o.pumpShape);
	p[28] = (timer >> 8) & 0xff;
	p[29] = timer & 0xff;
	p[30] = Math.min(Math.max(o.rotation || 0, 0), 3);
	return p;
}

function llAioHeader(opcode, mac, master, rxSlot, masterChannel, slotIndex) {
	const rf = new Array(LL_RF_DATA_SIZE).fill(0);
	rf[0] = LL_RF_SELECT;
	rf[1] = opcode;
	for (let k = 0; k < 6; k++) {
		rf[2 + k] = mac[k];
		rf[8 + k] = master[k];
	}
	rf[14] = rxSlot & 0xff;
	rf[15] = masterChannel & 0xff;
	rf[16] = slotIndex & 0xff;
	return rf;
}

function llAioParamsFrame(mac, master, rxSlot, masterChannel, slotIndex, param) {
	const rf = llAioHeader(LL_RF_AIO_PARAMS, mac, master, rxSlot, masterChannel, slotIndex);
	for (let k = 0; k < LL_AIO_PARAM_LEN; k++) {
		rf[18 + k] = param[k] & 0xff;
	}
	return rf;
}

// Switches the LCD to the built-in sensor theme. The AIO acknowledges by
// reporting `sequence` as its cmd_seq (record byte 40) in the RX device list.
function llThemeSwitchFrame(mac, master, rxSlot, masterChannel, slotIndex, sequence) {
	const rf = llAioHeader(LL_RF_AIO_SWITCH_WIRELESS, mac, master, rxSlot, masterChannel, slotIndex);
	rf[17] = sequence & 0xff;
	return rf;
}

function llNextSequence(previous, observed) {
	const v = previous === null || previous === undefined ? observed : previous;
	return v <= 253 ? v + 1 : 1;
}

// Slot index = 1-based position among the devices bound to this TX master
// (the RX list order, master entry excluded), as lian-li-linux next_slot_index.
function llSlotIndex(records, mac, masterMac) {
	let slot = 1;
	for (const r of records) {
		if (r.isMaster || !r.masterMac.every((b, k) => b === masterMac[k])) {
			continue;
		}
		if (r.mac.every((b, k) => b === mac[k])) {
			return slot;
		}
		slot++;
	}
	return slot;
}

// Sensor packet from the helper: {"cpu_temp":51,"cpu_load":12,"gpu_temp":44,"gpu_load":3}
// Missing / null / out-of-range fields mean "not available".
function llParseSensorMessage(text) {
	let j;
	try {
		j = JSON.parse(text);
	} catch (e) {
		return null;
	}
	if (!j || typeof j !== "object") {
		return null;
	}
	const pick = (k) => {
		const v = j[k];
		return typeof v === "number" && isFinite(v) && v >= 0 && v <= 150 ? v : null;
	};
	return {
		cpuTemp: pick("cpu_temp"),
		cpuLoad: pick("cpu_load"),
		gpuTemp: pick("gpu_temp"),
		gpuLoad: pick("gpu_load"),
		source: typeof j.source === "string" ? j.source.slice(0, 40) : "",
	};
}

// Finder -> TX plugin status packet (local UDP). Carries what only the RX can see.
function llParseFinderMessage(text) {
	let j;
	try {
		j = JSON.parse(text);
	} catch (e) {
		return null;
	}
	if (!j || j.kind !== "finder" || !Array.isArray(j.devices)) {
		return null;
	}
	return j;
}

// ------------------------------ Fan speed ------------------------------------
// RF_PWM_CMD (0x10): four PWM duties (0-255), one per fan slot; slot 3 is the
// pump on an AIO. Wireless fans fall back to their default speed when the host
// goes quiet, so the target is re-sent every second.
// Ported from lian-li-linux wireless/fan_speed.rs (prepare_pwm, build_pwm_packet).

function llMinDutyPercent(deviceType, fanTypes) {
	if (deviceType === 10 || deviceType === 11 || deviceType === 66) return 10;
	if ((deviceType >= 1 && deviceType <= 9) || deviceType === 65 || deviceType === 88) return 0;
	const b = (fanTypes || []).find((x) => x !== 0) || 0;
	if ((b >= 20 && b <= 26) || (b >= 59 && b <= 62)) return 14;
	if ((b >= 28 && b <= 31) || (b >= 36 && b <= 39) || (b >= 51 && b <= 58)) return 11;
	if (b === 63) return 8;
	return 10; // TL LCD, CL, SL-INF V3, unknown
}

function llIsClFan(fanTypes) {
	const b = (fanTypes || []).find((x) => x !== 0) || 0;
	return (b >= 40 && b <= 42) || b === 126 || b === 127;
}

// rec: {deviceType, fanCount, rightAttach, fanTypes}
function llPreparePwm(pwm, rec) {
	const out = [0, 1, 2, 3].map((i) => Math.min(Math.max(Math.round(pwm[i] || 0), 0), 255));
	const isAio = rec.deviceType === 10 || rec.deviceType === 11;
	const f = Math.fround;
	const minPwm = Math.trunc(f(f(llMinDutyPercent(rec.deviceType, rec.fanTypes) / 100) * 255));
	const cl = isAio || rec.deviceType !== 0 ? false : llIsClFan(rec.fanTypes);
	for (let i = 0; i < 4; i++) {
		if (i >= rec.fanCount && !(i === 3 && isAio)) {
			out[i] = 0;
			continue;
		}
		if (out[i] > 0 && out[i] < minPwm) {
			out[i] = minPwm;
		}
		if (cl) {
			if (out[i] === 153 || out[i] === 154) out[i] = 152;
			else if (out[i] === 155) out[i] = 156;
		}
	}
	if (rec.rightAttach) {
		const n = Math.min(rec.fanCount, 4);
		if (n > 1) {
			const head = out.slice(0, n).reverse();
			for (let i = 0; i < n; i++) out[i] = head[i];
		}
	}
	return out;
}

// L-Connect never sends the raw value a curve produced: it averages the last
// ten requests (and drops the history on a big jump), so a temperature that
// wanders a little does not make the fans hunt. 6 is reserved by the firmware
// ("follow the motherboard header"), so a real request for it becomes 7.
const LL_PWM_FOLLOW_MB = 6;

function llSmoothPwm(history, target, size, resetJump) {
	const n = size || 10;
	const jump = resetJump || 100;
	let h = history || [];
	if (h.length && target.some((v, k) => Math.abs(v - h[0][k]) > jump)) {
		h = [];
	}
	h = h.concat([target.slice()]);
	while (h.length > n) {
		h.shift();
	}
	const out = [0, 1, 2, 3].map((k) => {
		const mean = Math.round(h.reduce((sum, row) => sum + (row[k] || 0), 0) / h.length);
		return mean === LL_PWM_FOLLOW_MB ? LL_PWM_FOLLOW_MB + 1 : mean;
	});
	return { history: h, out };
}

// Duty to hand the fans back at when control stops. A fan that was stopped
// (or barely turning) when control started is handed back at 60 % instead,
// so switching Fan Control off never leaves the fans standing still.
function llSafeHandBack(pwm, fanCount) {
	const n = fanCount > 0 ? fanCount : 4;
	return [0, 1, 2, 3].map((i) => {
		const v = pwm[i] || 0;
		return i < n && v < 51 ? 153 : v;
	});
}

function llPwmFrame(mac, master, rxSlot, masterChannel, slotIndex, pwm) {
	const rf = llAioHeader(LL_RF_PWM_CMD, mac, master, rxSlot, masterChannel, slotIndex);
	for (let k = 0; k < 4; k++) {
		rf[17 + k] = pwm[k] & 0xff;
	}
	return rf;
}

// Pump RPM <-> SignalRGB 0..1 fan level, inside the variant's range.
function llPumpRpmFromLevel(level, shape) {
	const [lo, hi] = LL_PUMP_RANGE[shape === "circle" ? "circle" : "square"];
	const l = Math.min(Math.max(typeof level === "number" && isFinite(level) ? level : 1, 0), 1);
	return Math.round(lo + l * (hi - lo));
}

// ------------------------------ LCD picture ----------------------------------
// RF_SEND_PIC (0x22): a JPEG (480x480, at most 20 KB) in 220-byte chunks, then a
// terminator (index 0xFF) carrying the total length. Every frame carries a fresh
// sequence number and must be acknowledged (AIO cmd_seq) before the next one.
// Ported from lian-li-linux wireless/opcodes.rs (picture_packets, send_aio_pic).

function llPicFrame(mac, master, rxSlot, masterChannel, sequence, index, data) {
	if (data.length > LL_PIC_CHUNK_BYTES) {
		throw new Error("picture chunk exceeds 220 bytes");
	}
	const rf = llAioHeader(LL_RF_SEND_PIC, mac, master, rxSlot, masterChannel, 0);
	rf[17] = sequence & 0xff;
	rf[18] = index & 0xff;
	for (let k = 0; k < data.length; k++) {
		rf[19 + k] = data[k] & 0xff;
	}
	return rf;
}

// [{index, data}] for every chunk plus the terminator.
function llPicChunks(jpeg) {
	if (!jpeg || jpeg.length < 1 || jpeg.length > LL_MAX_AIO_IMAGE_BYTES) {
		throw new Error(`LCD image must be 1..${LL_MAX_AIO_IMAGE_BYTES} bytes`);
	}
	const out = [];
	for (let i = 0; i * LL_PIC_CHUNK_BYTES < jpeg.length; i++) {
		out.push({ index: i, data: jpeg.slice(i * LL_PIC_CHUNK_BYTES, (i + 1) * LL_PIC_CHUNK_BYTES) });
	}
	out.push({ index: 0xff, data: [(jpeg.length >> 8) & 0xff, jpeg.length & 0xff] });
	return out;
}

function llToBase64(bytes) {
	const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	let out = "";
	for (let i = 0; i < bytes.length; i += 3) {
		const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0);
		out += abc[(n >> 18) & 63] + abc[(n >> 12) & 63] + (i + 1 < bytes.length ? abc[(n >> 6) & 63] : "=") + (i + 2 < bytes.length ? abc[n & 63] : "=");
	}
	return out;
}

function llFromBase64(text) {
	const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	const out = [];
	const clean = String(text || "").replace(/[^A-Za-z0-9+/]/g, "");
	for (let i = 0; i < clean.length; i += 4) {
		const n = (abc.indexOf(clean[i]) << 18) | (abc.indexOf(clean[i + 1]) << 12) | ((abc.indexOf(clean[i + 2]) & 63) << 6) | (abc.indexOf(clean[i + 3]) & 63);
		out.push((n >> 16) & 255);
		if (i + 2 < clean.length) out.push((n >> 8) & 255);
		if (i + 3 < clean.length) out.push(n & 255);
	}
	return out;
}

// ------------------------- SignalRGB glue helpers --------------------------

function llLog(msg) {
	try {
		device.log(`[LianLi] ${msg}`, {toFile: true});
	} catch (e) {
		device.log(`[LianLi] ${msg}`);
	}
}

// SignalRGB rawusb bulk_transfer returns {length, data}; length < 0 = failure.
function llToArray(r) {
	if (r === undefined || r === null) {
		return [];
	}
	if (Array.isArray(r)) {
		return r;
	}
	if (typeof r === "object") {
		const n = typeof r.length === "number" ? r.length : -1;
		if (n <= 0) {
			return [];
		}
		const d = r.data;
		if (d && typeof d.length === "number") {
			return Array.from(d).slice(0, n).map((b) => b & 0xff);
		}
		return Array.from(r).slice(0, n);
	}
	return [];
}

// IN transfers need a pre-sized buffer, one 64-byte USB packet at a time.
function llBulkRead(timeoutMs) {
	return llToArray(device.bulk_transfer(0x81, new Array(64).fill(0), 64, timeoutMs));
}

function llBulkWrite(packet) {
	device.bulk_transfer(0x01, packet, packet.length, 100);
}

function llFlushIn() {
	for (let i = 0; i < 16; i++) {
		if (!llBulkRead(5).length) {
			return;
		}
	}
}

function llHex(a) {
	return (a || []).slice(0, 64).map((b) => (b & 0xff).toString(16).padStart(2, "0")).join(" ");
}

// RF pacing: frames to a new target or of a new kind wait out the air gap.
function llGapBefore(last, target, opcode, nowMs) {
	if (!last) {
		return 0;
	}
	const same = last.opcode === opcode && last.target.every((b, k) => b === target[k]);
	if (same) {
		return 0;
	}
	const gap = last.opcode === LL_RF_SET_RGB ? 10 : 5;
	return Math.max(0, gap - (nowMs - last.sentAt));
}


// --------------------------- Stored (hardware) effects -----------------------
// A multi-frame RGB upload is stored on the device, which then loops it by
// itself at up to 20 frames per second: smooth, no radio traffic, and it keeps
// running after SignalRGB closes. lian-li-linux limits playback to 50 ms per
// frame and the compressed animation to 12288 bytes.

const LL_HW_FRAME_MS = 50;
const LL_HW_MAX_FRAMES = 400;
const LL_HW_EFFECTS = ["Rainbow Wave", "Rainbow Spin", "Color Cycle", "Breathing", "Spinner", "Static"];

function llHsvToRgb(h, s, v) {
	h = ((h % 1) + 1) % 1;
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function llScale(color, k) {
	return color.map((c) => Math.max(0, Math.min(255, Math.round(c * k))));
}

// Effect period in ms for speed 1 (slow) .. 10 (fast).
function llEffectPeriod(name, speed) {
	const s = Math.min(10, Math.max(1, Math.round(Number(speed) || 5)));
	const slow = name === "Breathing" || name === "Color Cycle" ? 12000 : 9000;
	const fast = name === "Breathing" || name === "Color Cycle" ? 2500 : 1300;
	return Math.round(slow + ((fast - slow) * (s - 1)) / 9);
}

// One looping colour function per effect; phase runs 0..1 over the period.
// steps: frames in the loop; the wave's hue is snapped to the same grid so each
// frame reuses the previous frames' colours (about 2x smaller upload).
function llEffectColor(name, led, phase, color, steps) {
	const angle = led.step / led.count;
	switch (name) {
	case "Rainbow Wave": {
		const h = led.x - phase;
		return llHsvToRgb(steps ? Math.round(h * steps) / steps : h, 1, 1);
	}
	case "Rainbow Spin":
		return llHsvToRgb(angle - phase, 1, 1);
	case "Color Cycle":
		return llHsvToRgb(phase, 1, 1);
	case "Breathing": {
		const b = (1 - Math.cos(2 * Math.PI * phase)) / 2;
		return llScale(color, b * b);
	}
	case "Spinner": {
		const d = (((phase - angle) % 1) + 1) % 1; // distance behind the head
		const k = Math.max(0, 1 - d * 2.5);
		return llScale(color, k * k);
	}
	default:
		return color.slice();
	}
}

// Frame plan for one device. Spinning effects use a whole number of frames per
// LED step so every frame is an exact rotation of the last (compresses well).
function llEffectPlan(name, leds, speed) {
	if (name === "Static") {
		return { frames: 1, intervalMs: 1000 };
	}
	const period = llEffectPeriod(name, speed);
	let frames = Math.max(2, Math.round(period / LL_HW_FRAME_MS));
	if (name === "Rainbow Spin" || name === "Spinner") {
		const count = leds.length ? leds[0].count : 24;
		frames = Math.max(1, Math.round(frames / count)) * count;
	}
	frames = Math.min(frames, LL_HW_MAX_FRAMES);
	return { frames, intervalMs: Math.max(LL_HW_FRAME_MS, period / frames) };
}

function llEffectFrames(name, leds, frames, color) {
	const out = [];
	for (let f = 0; f < frames; f++) {
		out.push(leds.map((led) => llEffectColor(name, led, f / frames, color, frames)));
	}
	return out;
}

// Builds the upload, halving the frame rate until it fits the device memory.
// intervalMs may be fractional; the RF timing has 1/100 tick precision.
function llBuildRgbUploadFrac(frames, intervalMs) {
	return llBuildRgbUploadTicks(frames, Math.round(intervalMs * 160), null);
}

function llFitAnimation(frames, intervalMs) {
	let f = frames;
	let interval = intervalMs;
	for (;;) {
		try {
			const up = llBuildRgbUploadFrac(f, interval);
			return { upload: up, frames: f.length, intervalMs: interval };
		} catch (e) {
			if (!/too large/.test(String(e)) || f.length <= 1) {
				throw e;
			}
			const half = f.filter((_, i) => i % 2 === 0);
			interval = (interval * f.length) / half.length;
			f = half;
		}
	}
}

// Turns a recording into a seamless loop: the last `blend` frames are faded
// into the first ones, so the end runs straight back into the start.
function llLoopFrames(recorded, blend) {
	const b = Math.max(0, Math.min(blend, Math.floor(recorded.length / 2)));
	const n = recorded.length - b;
	const out = [];
	for (let i = 0; i < n; i++) {
		if (i < b) {
			const k = (i + 1) / (b + 1);
			out.push(recorded[i].map((c, j) => c.map((v, ch) => Math.round(recorded[n + i][j][ch] * (1 - k) + v * k))));
		} else {
			out.push(recorded[i]);
		}
	}
	return out;
}

function llEffectUpload(name, leds, speed, color) {
	const plan = llEffectPlan(name, leds, speed);
	const frames = llEffectFrames(name, leds, plan.frames, color);
	return llFitAnimation(frames, plan.intervalMs);
}


const HEARTBEAT_MS = 1000;
const REFRESH_MS = 2000;
const PROBE_INTERVAL_MS = 150;

let layout = llBuildLayout(3, 26, 0, false);
let masterMac = null;
let masterChannel = 0;
let probeQueue = [];
let lastProbe = 0;
let probeLogs = 0;
let lastFrame = null;
let lastHeartbeat = 0;
let lastSend = 0;
let rgbHoldUntil = 0;
let lastSignature = "";
let pumpMac = null;
let fansMac = null;
let ioErrors = 0;

// ---- LCD sensor screen state ----
const SENSOR_PORT = 51870;      // helper + RX Finder send JSON here (127.0.0.1)
const SCREEN_TICK_MS = 1000;    // lian-li-linux sends aio params once a second
const THEME_RETRY_MS = 2000;    // resend the theme switch until the AIO echoes its sequence
const SENSOR_STALE_MS = 5000;
const FINDER_STALE_MS = 5000;
let sensorSocket = null;
let sensorBindAt = 0;
let sensors = null;             // latest helper reading
let sensorsAt = 0;
let finder = null;              // latest Finder device list
let finderAt = 0;
let screen = freshScreenState();

export function LedNames() { return layout.names; }
export function LedPositions() { return layout.positions; }

export function Validate(endpoint) {
	return endpoint.interface === 0;
}

export function Initialize() {
	rebuildLayout();
	openSensorSocket();
	readMacs();
	masterMac = null;
	probeQueue = channelsToProbe();
	llLog(`Plugin started. Probing ${probeQueue.length} wireless channel(s).`);
	probeNextChannel(3);
}

export function Render() {
	const now = Date.now();

	if (!masterMac) {
		if (now - lastProbe >= PROBE_INTERVAL_MS) {
			lastProbe = now;
			if (probeQueue.length === 0) {
				probeQueue = channelsToProbe();
			}
			probeNextChannel(1);
		}
		return;
	}

	if (now - lastHeartbeat >= HEARTBEAT_MS) {
		lastHeartbeat = now;
		safeSend(() => sendRf(llBuildClockFrame(masterMac), masterChannel, 0xff));
	}

	if (!sensorSocket && now - sensorBindAt > 10000) {
		openSensorSocket();
	}
	fanTick(now);
	if (screenEnabled() || fanControlOn() || fan.pumpRestore > 0) {
		screenTick(now);
	}

	if (!pumpMac && !fansMac) {
		return;
	}

	if (LightingMode === "Hardware Effect") {
		lastSignature = "";
		hwTick(now);
		return;
	}
	hw.key = "";
	hwRoll(now);

	const interval = 1000 / Math.max(1, parseInt(UpdateRate, 10) || 15);
	if (now - lastSend < interval || now < rgbHoldUntil) {
		return;
	}

	const colors = grabColors();
	const signature = colors.join(",");
	if (signature === lastSignature && now - lastSend < REFRESH_MS) {
		return;
	}
	lastSend = now;
	lastSignature = signature;
	safeSend(() => sendAll(colors));
}

export function Shutdown(SystemSuspending) {
	stopFanControl("shutdown");
	closeSensorSocket();
	if (!masterMac) {
		return;
	}
	if (!SystemSuspending && OnExit === "Hardware Effect") {
		hwOnExit();
		return;
	}
	const color = SystemSuspending ? "#000000" : shutdownColor;
	safeSend(() => sendAll(grabColors(color)));
}

export function onPumpMacChanged() { readMacs(); lastSignature = ""; }
export function onFansMacChanged() { readMacs(); lastSignature = ""; }
export function onPumpRxSlotChanged() { lastSignature = ""; }
export function onFansRxSlotChanged() { lastSignature = ""; }
export function onDeviceChannelChanged() { lastSignature = ""; }
export function onFanCountChanged() { rebuildLayout(); lastSignature = ""; }
export function onLedsPerFanChanged() { rebuildLayout(); lastSignature = ""; }
export function onRingRotationChanged() { rebuildLayout(); lastSignature = ""; }
export function onRingReverseChanged() { rebuildLayout(); lastSignature = ""; }
export function onScreenModeChanged() { screen = freshScreenState(); }
export function onFanControlChanged() {
	if (!fanControlOn()) {
		stopFanControl("turned off");
	}
}
export function onPumpHeadChanged() { screen.lastParams = 0; }

export function onWirelessChannelChanged() {
	masterMac = null;
	probeQueue = channelsToProbe();
}

// ------------------------------------------------------------------------

function fanCount() {
	const set = parseInt(FanCount, 10);
	if (set >= 1 && set <= 4) {
		return set;
	}
	return auto.fans && auto.fans.fans ? Math.min(4, Math.max(1, auto.fans.fans)) : 3;
}

function ledsPerFan() {
	const set = parseInt(LedsPerFan, 10);
	if (set >= 1 && set <= 64) {
		return set;
	}
	const family = auto.fans ? llFanFamily((auto.fans.fanTypes || []).find((b) => b !== 0) || 0) : null;
	return family ? family.leds : 26;
}

// ---- Auto setup: anything left at its default is filled from the RX Finder ----
let auto = { pump: null, fans: null, note: "" };

function applyAuto() {
	if (!finder) {
		return;
	}
	const ours = (d) => !masterMac || d.master === llMacToString(masterMac);
	const devices = finder.devices.filter((d) => !d.isMaster && ours(d));
	const pump = devices.find((d) => d.type === 10 || d.type === 11) || null;
	const fans = devices.find((d) => d.type === 0 && d.fans > 0) || null;
	auto.pump = llParseMac(PumpMac) ? devices.find((d) => d.mac === llMacToString(llParseMac(PumpMac))) || pump : pump;
	auto.fans = llParseMac(FansMac) ? devices.find((d) => d.mac === llMacToString(llParseMac(FansMac))) || fans : fans;
	const wantPump = llParseMac(PumpMac) || (pump ? llParseMac(pump.mac) : null);
	const wantFans = llParseMac(FansMac) || (fans ? llParseMac(fans.mac) : null);
	const before = `${pumpMac ? llMacToString(pumpMac) : "-"} ${fansMac ? llMacToString(fansMac) : "-"} ${layout.names.length}`;
	pumpMac = wantPump;
	fansMac = wantFans;
	const oldCount = layout.names.length;
	const lp = layout.pumpCount;
	const fanLeds = fanCount() * ledsPerFan();
	if (oldCount !== lp + fanLeds) {
		rebuildLayout();
	}
	const after = `${pumpMac ? llMacToString(pumpMac) : "-"} ${fansMac ? llMacToString(fansMac) : "-"} ${layout.names.length}`;
	if (after !== before) {
		const fam = auto.fans ? llFanFamily((auto.fans.fanTypes || []).find((b) => b !== 0) || 0) : null;
		llLog(`Auto setup: pump ${pumpMac ? llMacToString(pumpMac) : "none"}, fans ${fansMac ? `${llMacToString(fansMac)} (${fanCount()}x ${fam ? fam.name : "fan"}, ${ledsPerFan()} LEDs each)` : "none"}.`);
		try {
			device.removeMessage("ll_mac");
		} catch (e) { /* ignore */ }
		lastSignature = "";
	}
	const extra = devices.filter((d) => d !== auto.pump && d !== auto.fans).map((d) => d.mac);
	const note = extra.join(",");
	if (note && note !== auto.note) {
		llLog(`Also found ${extra.length} more wireless device(s) not used by this plugin: ${extra.join(", ")}.`);
	}
	auto.note = note;
}

function rebuildLayout() {
	const rotation = Math.min(23, Math.max(0, parseInt(RingRotation, 10) || 0));
	const reverse = RingReverse === true || RingReverse === "true" || RingReverse === 1;
	layout = llBuildLayout(fanCount(), ledsPerFan(), rotation, reverse);
	try {
		device.setSize(layout.size);
	} catch (e) { /* older SignalRGB builds */ }
	try {
		device.setControllableLeds(layout.names, layout.positions);
	} catch (e) { /* older SignalRGB builds */ }
}

function readMacs() {
	pumpMac = llParseMac(PumpMac);
	fansMac = llParseMac(FansMac);
	try {
		device.removeMessage("ll_mac");
	} catch (e) { /* ignore */ }
	applyAuto();
	if (!pumpMac && !fansMac) {
		llLog("Waiting for the 'Lian Li Wireless RX (Finder)' device to report the pump and fans (automatic setup).");
		try {
			device.addMessage("ll_mac", "Waiting for the RX Finder", "Keep the 'Lian Li Wireless RX (Finder)' device enabled. It finds the pump and fans for this plugin.");
		} catch (e) { /* ignore */ }
		return;
	}
	llLog(`Pump: ${pumpMac ? llMacToString(pumpMac) : "off"} | Fans: ${fansMac ? llMacToString(fansMac) : "off"}`);
}

function channelsToProbe() {
	if (WirelessChannel && WirelessChannel !== "Auto") {
		const ch = parseInt(WirelessChannel, 10);
		if (ch >= 1 && ch <= 39) {
			return [ch, ch, ch];
		}
	}
	return [8, 8].concat(llChannelProbeOrder());
}

function probeNextChannel(maxTries) {
	for (let t = 0; t < maxTries && probeQueue.length > 0 && !masterMac; t++) {
		const ch = probeQueue.shift();
		const reply = queryMaster(ch);
		if (reply) {
			masterMac = reply.slice(1, 7);
			masterChannel = ch;
			lastHeartbeat = 0;
			lastSignature = "";
			const fw = (reply[11] << 8) | reply[12];
			llLog(`Wireless master ${llMacToString(masterMac)} on channel ${ch} (firmware ${fw}).`);
			try {
				device.removeMessage("ll_master");
			} catch (e) { /* ignore */ }
		}
	}
	if (!masterMac && probeQueue.length === 0) {
		try {
			device.addMessage("ll_master", "Wireless TX did not answer", "Close L-Connect 3 and L-Connect-Service, or pick the Wireless Channel shown by the RX Finder.");
		} catch (e) { /* ignore */ }
	}
}

function queryMaster(channel) {
	try {
		llFlushIn();
		llBulkWrite(llGetMacPacket(channel));
		let r = [];
		for (let i = 0; i < 4 && !r.length; i++) {
			r = llBulkRead(i === 0 ? 150 : 100);
		}
		if (probeLogs < 6) {
			probeLogs++;
			llLog(`GetMac ch ${channel} reply ${r.length} bytes: ${llHex(r.slice(0, 16))}`);
		}
		return llValidMasterResponse(r) ? r : null;
	} catch (e) {
		llLog(`Master query on channel ${channel} failed: ${e}`);
		return null;
	}
}

function grabColors(override) {
	const colors = [];
	const forced = override ? hexToRgb(override) : (LightingMode === "Forced" ? hexToRgb(forcedColor) : null);
	for (let i = 0; i < layout.positions.length; i++) {
		const [x, y] = layout.positions[i];
		const c = forced || device.color(x, y);
		colors.push([c[0] & 0xff, c[1] & 0xff, c[2] & 0xff]);
	}
	return colors;
}

function deviceChannel() {
	const ch = parseInt(DeviceChannel, 10);
	return ch >= 1 && ch <= 39 ? ch : masterChannel;
}

// The channel a device listens on can change (a PWM command moves wireless fans
// to the master channel, for example), so follow what the RX Finder reports and
// fall back to the Device Channel setting without it.
let channelNotes = {};
function channelFor(mac) {
	if (finder && mac && Date.now() - finderAt <= FINDER_STALE_MS) {
		const key = llMacToString(mac);
		const rec = finder.devices.find((d) => d.mac === key);
		if (rec && rec.ch >= 1 && rec.ch <= 39) {
			if (rec.ch !== deviceChannel() && channelNotes[key] !== rec.ch) {
				channelNotes[key] = rec.ch;
				llLog(`${key} is listening on channel ${rec.ch} (Device Channel setting: ${deviceChannel()}). Following the device.`);
			}
			return rec.ch;
		}
	}
	return deviceChannel();
}

function slot(value) {
	const n = parseInt(value, 10);
	return n >= 1 && n <= 13 ? n : 0xff;
}

function rxFor(mac, setting) {
	const fixed = slot(setting);
	if (fixed !== 0xff || !finder || !mac) {
		return fixed;
	}
	const rec = finder.devices.find((d) => d.mac === llMacToString(mac));
	return rec && rec.rx >= 1 && rec.rx <= 13 ? rec.rx : 0xff;
}

function sendAll(colors) {
	if (pumpMac) {
		sendDirect(pumpMac, rxFor(pumpMac, PumpRxSlot), colors.slice(0, layout.pumpCount));
	}
	if (fansMac) {
		sendDirect(fansMac, rxFor(fansMac, FansRxSlot), colors.slice(layout.pumpCount, layout.pumpCount + layout.fanLedCount));
	}
}

let sendLogs = 0;
function sendDirect(targetMac, rxSlot, colors) {
	const upload = llBuildRgbUpload([colors], 5000, null);
	if (sendLogs < 6) {
		sendLogs++;
		llLog(`RGB -> ${llMacToString(targetMac)} ch ${channelFor(targetMac)} rx ${rxSlot}: ${colors.length} LEDs, ${upload.compressed.length} bytes, ${upload.packetCount} packets, effect ${llHex(upload.effectIndex)}, first colour ${colors[0].join(",")}`);
	}
	sendUpload(targetMac, rxSlot, upload);
}

function sendUpload(targetMac, rxSlot, upload) {
	const channel = channelFor(targetMac);
	for (let index = 0; index < upload.packetCount; index++) {
		const rf = llRgbPacket(upload, targetMac, masterMac, index);
		const repeats = index === 0 ? 2 : 1;
		for (let r = 0; r < repeats; r++) {
			sendRf(rf, channel, rxSlot);
			if (r + 1 < repeats) {
				device.pause(2);
			}
		}
	}
}

function sendRf(rf, channel, rxTarget) {
	const target = rf.slice(2, 8);
	const opcode = rf[1];
	const wait = llGapBefore(lastFrame, target, opcode, Date.now());
	if (wait > 0) {
		device.pause(wait);
	}
	for (const p of llRfToUsbPackets(rf, channel, rxTarget)) {
		llBulkWrite(p);
		device.pause(1);
	}
	lastFrame = { target, opcode, sentAt: Date.now() };
}

function safeSend(fn) {
	try {
		fn();
		ioErrors = 0;
	} catch (e) {
		ioErrors++;
		if (ioErrors <= 5 || ioErrors % 100 === 0) {
			llLog(`USB send failed (${ioErrors}): ${e}`);
		}
		if (ioErrors >= 20) {
			masterMac = null;
			probeQueue = channelsToProbe();
			ioErrors = 0;
		}
	}
}

// --------------------------- Hardware (stored) effects ----------------------
// The whole animation is uploaded once and the pump and fans loop it on their
// own (up to 20 fps). Smooth, no radio traffic per frame, and it keeps playing
// after SignalRGB closes. The RX Finder reports the effect each device is
// playing, so every upload is confirmed and repeated if it did not land.

const HW_RECORD_FRAMES = 80;   // Canvas Loop: 4 s at 20 fps ...
const HW_BLEND_FRAMES = 12;    // ... plus a crossfade at the loop point
const HW_RETRY_MS = 4000;
const HW_MAX_TRIES = 5;
let hw = freshHwState();

function freshHwState() {
	return { key: "", targets: [], recording: null, recordStart: 0, lastRecord: 0, checkedAt: 0, loop: null, rolling: [], rollingAt: 0, gaveUp: false };
}

function hwKey() {
	const loop = HwEffect === "Canvas Loop";
	return JSON.stringify([HwEffect, loop ? 0 : HwSpeed, loop ? 0 : HwColor,
		pumpMac ? llMacToString(pumpMac) : "", fansMac ? llMacToString(fansMac) : "",
		layout.names.length, RingRotation, RingReverse]);
}

function finderFresh() {
	return !!finder && Date.now() - finderAt <= FINDER_STALE_MS;
}

function recordFor(mac) {
	if (!finderFresh() || !mac) {
		return null;
	}
	const key = llMacToString(mac);
	return finder.devices.find((d) => d.mac === key && !d.stale) || null;
}

// loop: {frames, intervalMs} of whole-layout colours, or null for a generated effect.
function hwTargets(name, loop) {
	const out = [];
	const parts = [
		[pumpMac, PumpRxSlot, 0, layout.pumpCount, "pump"],
		[fansMac, FansRxSlot, layout.pumpCount, layout.pumpCount + layout.fanLedCount, "fans"],
	];
	for (const [mac, rx, a, b, label] of parts) {
		if (!mac || b <= a) {
			continue;
		}
		const fit = loop
			? llFitAnimation(loop.frames.map((f) => f.slice(a, b)), Math.max(LL_HW_FRAME_MS, loop.intervalMs))
			: llEffectUpload(name, layout.meta.slice(a, b), HwSpeed, hexToRgb(HwColor));
		out.push({ mac, rx, label, upload: fit.upload, frames: fit.frames, intervalMs: fit.intervalMs, sentAt: 0, tries: 0, ok: false, lostSince: 0 });
	}
	return out;
}

function hwSend(t, now) {
	t.sentAt = now;
	t.tries++;
	safeSend(() => sendUpload(t.mac, rxFor(t.mac, t.rx), t.upload));
	lastSend = Date.now();
}

function hwStart(name, loop, now) {
	try {
		hw.targets = hwTargets(name, loop);
	} catch (e) {
		hw.targets = [];
		llLog(`Hardware effect ${name} could not be built: ${e}`);
		return;
	}
	hw.gaveUp = false;
	for (const t of hw.targets) {
		llLog(`Hardware effect ${name} -> ${t.label} ${llMacToString(t.mac)}: ${t.frames} frames every ${t.intervalMs.toFixed(1)} ms, ${t.upload.compressed.length} bytes in ${t.upload.packetCount} packets, effect ${llHex(t.upload.effectIndex)}.`);
		hwSend(t, now);
	}
	try {
		device.removeMessage("ll_hw");
	} catch (e) { /* ignore */ }
}

function sameFx(rec, upload) {
	return rec && Array.isArray(rec.fx) && rec.fx.length === 4 && llHex(rec.fx) === llHex(upload.effectIndex);
}

function hwVerify(now) {
	if (now - hw.checkedAt < 1000) {
		return;
	}
	hw.checkedAt = now;
	for (const t of hw.targets) {
		const rec = recordFor(t.mac);
		if (t.ok) {
			// Re-send if the device stopped playing it (power cycle, another app).
			if (rec && Array.isArray(rec.fx) && !sameFx(rec, t.upload) && now - t.sentAt > HW_RETRY_MS) {
				if (!t.lostSince) {
					t.lostSince = now;
				} else if (now - t.lostSince > 3000) {
					llLog(`The ${t.label} is no longer playing the hardware effect; uploading it again.`);
					t.ok = false;
					t.tries = 0;
					t.lostSince = 0;
					hwSend(t, now);
				}
			} else {
				t.lostSince = 0;
			}
			continue;
		}
		if (sameFx(rec, t.upload)) {
			t.ok = true;
			llLog(`Hardware effect is playing on the ${t.label} (confirmed by the RX Finder).`);
			continue;
		}
		if (!finderFresh() && t.tries >= 1 && now - t.sentAt >= HW_RETRY_MS) {
			t.ok = true; // no Finder to confirm with: one upload is the best we can do
			llLog(`Hardware effect sent to the ${t.label} (not confirmed: the RX Finder is not running).`);
			continue;
		}
		if (now - t.sentAt < HW_RETRY_MS) {
			continue;
		}
		if (t.tries < HW_MAX_TRIES) {
			llLog(`The ${t.label} has not confirmed the hardware effect yet (try ${t.tries}); sending it again.`);
			hwSend(t, now);
		} else if (!hw.gaveUp) {
			hw.gaveUp = true;
			llLog(`The ${t.label} did not take the hardware effect after ${t.tries} tries. Will try again in 30 s.`);
			try {
				device.addMessage("ll_hw", "Hardware effect not confirmed", "The device did not report the stored effect. Check the RX Finder and the wireless link.");
			} catch (e) { /* ignore */ }
			t.tries = HW_MAX_TRIES - 1;
			t.sentAt = now + 26000;
		}
	}
}

function hwTick(now) {
	const key = hwKey();
	if (key !== hw.key) {
		hw.key = key;
		hw.targets = [];
		hw.recording = null;
		if (HwEffect === "Canvas Loop") {
			hw.recording = [];
			hw.recordStart = now;
			hw.lastRecord = 0;
			llLog("Recording 4 seconds of the SignalRGB canvas for the hardware effect...");
		} else {
			hwStart(HwEffect, null, now);
		}
	}
	if (hw.recording) {
		if (now - hw.lastRecord >= LL_HW_FRAME_MS) {
			if (!hw.recording.length) {
				hw.recordStart = now;
			}
			hw.lastRecord = now;
			hw.recording.push(grabColors());
		}
		if (hw.recording.length >= HW_RECORD_FRAMES + HW_BLEND_FRAMES) {
			const intervalMs = (now - hw.recordStart) / (hw.recording.length - 1);
			hw.loop = { frames: llLoopFrames(hw.recording, HW_BLEND_FRAMES), intervalMs };
			hw.recording = null;
			hwStart("Canvas Loop", hw.loop, now);
		}
		return;
	}
	hwVerify(now);
}

// While the live canvas runs, keep the last few seconds so "Canvas Loop" can
// be stored when SignalRGB closes.
function hwRoll(now) {
	if (OnExit !== "Hardware Effect" || HwEffect !== "Canvas Loop") {
		hw.rolling = [];
		return;
	}
	if (now - hw.rollingAt < LL_HW_FRAME_MS) {
		return;
	}
	hw.rollingAt = now;
	hw.rolling.push({ at: now, colors: grabColors() });
	while (hw.rolling.length > HW_RECORD_FRAMES + HW_BLEND_FRAMES) {
		hw.rolling.shift();
	}
}

function hwOnExit() {
	if (LightingMode === "Hardware Effect" && hw.targets.length && hw.key === hwKey()) {
		llLog("SignalRGB is closing: leaving the hardware effect running.");
		return;
	}
	let name = HwEffect;
	let loop = null;
	if (name === "Canvas Loop") {
		const r = hw.rolling;
		if (r.length >= 2 * HW_BLEND_FRAMES) {
			loop = { frames: llLoopFrames(r.map((x) => x.colors), HW_BLEND_FRAMES), intervalMs: (r[r.length - 1].at - r[0].at) / (r.length - 1) };
		} else if (hw.loop) {
			loop = hw.loop;
		} else {
			name = "Rainbow Wave";
		}
	}
	try {
		const targets = hwTargets(name, loop);
		for (const t of targets) {
			safeSend(() => sendUpload(t.mac, rxFor(t.mac, t.rx), t.upload));
		}
		llLog(`SignalRGB is closing: ${name} stored on the devices and left running.`);
	} catch (e) {
		llLog(`Could not store the hardware effect on exit (${e}); using the shutdown color.`);
		safeSend(() => sendAll(grabColors(shutdownColor)));
	}
}

// ------------------------------- LCD screen ------------------------------

function freshScreenState() {
	return {
		target: null,       // sequence we asked the AIO to adopt
		sentAt: 0,
		tries: 0,
		acked: false,
		lastParams: 0,
		lastStatus: 0,
		lowRpmCount: 0,
		warnedNoFinder: false,
		paramsLogged: 0,
	};
}

function screenEnabled() {
	return typeof ScreenMode !== "undefined" && ScreenMode === "CPU/GPU Sensors";
}

function openSensorSocket() {
	sensorBindAt = Date.now();
	try {
		const s = udp.createSocket();
		s.on("message", onSensorMessage);
		s.on("error", (e) => llLog(`Sensor socket error: ${e}`));
		s.bind(SENSOR_PORT);
		sensorSocket = s;
		llLog(`Listening for sensor data on 127.0.0.1:${SENSOR_PORT}.`);
	} catch (e) {
		sensorSocket = null;
		llLog(`Could not open UDP port ${SENSOR_PORT}: ${e}`);
	}
}

function closeSensorSocket() {
	try {
		if (sensorSocket) {
			sensorSocket.close();
		}
	} catch (e) { /* ignore */ }
	sensorSocket = null;
}

function onSensorMessage(msg) {
	const text = typeof msg === "string" ? msg : (msg && typeof msg.data === "string" ? msg.data : "");
	if (!text) {
		return;
	}
	if (text.indexOf('"kind":"finder"') >= 0) {
		const f = llParseFinderMessage(text);
		if (f) {
			finder = f;
			finderAt = Date.now();
			applyAuto();
		}
		return;
	}
	const s = llParseSensorMessage(text);
	if (s) {
		if (!sensors) {
			llLog(`Sensor helper connected (${s.source || "unknown source"}).`);
		}
		sensors = s;
		sensorsAt = Date.now();
	}
}

function pumpRecord() {
	if (!finderFresh() || !pumpMac) {
		return null;
	}
	const mac = llMacToString(pumpMac);
	return finder.devices.find((d) => d.mac === mac && !d.stale) || null;
}

function pumpSlotIndex() {
	if (finder && masterMac) {
		const records = finder.devices.map((d) => ({
			mac: llParseMac(d.mac) || [],
			masterMac: llParseMac(d.master) || [],
			isMaster: d.isMaster,
		}));
		return llSlotIndex(records, pumpMac, masterMac);
	}
	return 1;
}

function pumpRx(rec) {
	const fromSetting = slot(PumpRxSlot);
	if (fromSetting !== 0xff) {
		return fromSetting;
	}
	return rec ? rec.rx : 0xff;
}

function pumpRpmSetting() {
	const rpm = parseInt(PumpSpeed, 10);
	return rpm >= 1600 && rpm <= 3200 ? rpm : 3200;
}

function screenTick(now) {
	if (!masterMac || !pumpMac) {
		return;
	}
	const rec = pumpRecord();
	const slotIndex = pumpSlotIndex();
	const rx = pumpRx(rec);

	// 1) Switch the LCD to the sensor theme, confirmed through the Finder.
	if (screenEnabled() && !screen.acked) {
		if (rec && screen.target !== null && rec.seq === screen.target && finderAt > screen.sentAt) {
			screen.acked = true;
			llLog(`LCD switched to the sensor theme (sequence ${screen.target}).`);
		} else if (now - screen.sentAt >= THEME_RETRY_MS) {
			if (!rec && !screen.warnedNoFinder) {
				screen.warnedNoFinder = true;
				llLog("LCD: no data from 'Lian Li Wireless RX (Finder)'. Keep the Finder device enabled so the screen switch can be confirmed.");
			}
			const observed = rec ? rec.seq : (screen.target === null ? 0 : screen.target);
			screen.target = llNextSequence(screen.target, observed);
			screen.sentAt = now;
			screen.tries++;
			const frame = llThemeSwitchFrame(pumpMac, masterMac, rx, masterChannel, slotIndex, screen.target);
			safeSend(() => sendRf(frame, channelFor(pumpMac), rx));
			if (screen.tries <= 5 || screen.tries % 30 === 0) {
				llLog(`LCD theme switch -> ${llMacToString(pumpMac)} seq ${screen.target} (device seq ${rec ? rec.seq : "?"}, slot ${slotIndex}, rx ${rx}, try ${screen.tries})`);
			}
			if (!rec && screen.tries >= 15) {
				screen.acked = true; // no way to confirm: stop switching, keep sending values
			}
		}
	}

	// 2) Send the values (and pump speed) once a second.
	if (now - screen.lastParams < SCREEN_TICK_MS) {
		return;
	}
	screen.lastParams = now;
	const fresh = screenEnabled() && sensors && now - sensorsAt <= SENSOR_STALE_MS ? sensors : {};
	const param = llBuildAioParam({
		cpuTemp: fresh.cpuTemp,
		cpuLoad: fresh.cpuLoad,
		gpuTemp: fresh.gpuTemp,
		gpuLoad: fresh.gpuLoad,
		loopInterval: parseInt(ScreenCycle, 10) || 3,
		labelColor: hexToRgb(ScreenLabelColor),
		valueColor: hexToRgb(ScreenValueColor),
		unitColor: hexToRgb(ScreenUnitColor),
		brightness: parseInt(ScreenBrightness, 10),
		theme: (parseInt(ScreenTheme, 10) || 1) - 1,
		pumpRpm: fan.active ? fan.pumpRpm : pumpRpmSetting(),
		pumpShape: PumpHead === "LCD-C (round)" ? "circle" : "square",
		rotation: ["0°", "90°", "180°", "270°"].indexOf(ScreenRotation),
	});
	safeSend(() => sendRf(llAioParamsFrame(pumpMac, masterMac, rx, masterChannel, slotIndex, param), channelFor(pumpMac), rx));
	if (fan.pumpRestore > 0 && !fan.active) {
		fan.pumpRestore--;
		if (fan.pumpRestore === 0) {
			llLog(`Pump handed back at ${pumpRpmSetting()} rpm (Pump Speed setting).`);
		}
	}
	if (screen.paramsLogged < 3) {
		screen.paramsLogged++;
		llLog(`LCD params -> ${llMacToString(pumpMac)} slot ${slotIndex} rx ${rx}: ${llHex(param)}`);
	}
	screenStatus(now, rec, fresh);
}

function screenStatus(now, rec, fresh) {
	// Pump watchdog: the params also carry the pump speed.
	if (rec && screen.paramsLogged > 0) {
		if (rec.pumpRpm < 1000) {
			screen.lowRpmCount++;
		} else {
			screen.lowRpmCount = 0;
		}
		if (screen.lowRpmCount === 5) {
			llLog(`WARNING: pump reports ${rec.pumpRpm} rpm. Set LCD Screen to Off and reopen L-Connect 3.`);
			try {
				device.addMessage("ll_pump", `Pump RPM low (${rec.pumpRpm})`, "Set LCD Screen to Off and reopen L-Connect 3 to restore the pump speed.");
			} catch (e) { /* ignore */ }
		}
		if (screen.lowRpmCount === 0) {
			try {
				device.removeMessage("ll_pump");
			} catch (e) { /* ignore */ }
		}
	}
	if (now - screen.lastStatus < 30000) {
		return;
	}
	screen.lastStatus = now;
	const v = (x, unit) => (typeof x === "number" ? `${Math.round(x)}${unit}` : "--");
	llLog(`LCD  CPU ${v(fresh.cpuTemp, "°C")} ${v(fresh.cpuLoad, "%")} | GPU ${v(fresh.gpuTemp, "°C")} ${v(fresh.gpuLoad, "%")}` +
		` | ${sensors ? `helper: ${sensors.source || "?"}` : "no sensor helper yet"}` +
		` | pump ${rec ? `${rec.pumpRpm} rpm, coolant ${rec.coolant} °C` : "? (Finder off)"}` +
		` | theme ${!screenEnabled() ? "off" : screen.acked ? "on" : "switching"}` +
		(fan.active ? ` | curve pump ${fan.pumpRpm} rpm, fans pwm ${fan.lastPwm.join("/")}` : ""));
}

// ------------------------- Fan & pump control -----------------------------
// SignalRGB's Fan Control page owns the curves; we read each control's level
// once a second and turn it into wireless commands:
//   fans -> RF_PWM_CMD to the fan group (duty 0-255 per slot, keep-alive 1/s)
//   pump -> the pump timer inside the aio params (same packet as the LCD data)
// Live RPM and coolant come from the RX Finder.

const FAN_TICK_MS = 1000;
const PWM_QUIET_MS = 40;
const FAN_SETTLE_MS = 3000;
let fan = freshFanState();

function freshFanState() {
	return { active: false, created: [], lastTick: 0, pumpRpm: 3200, pumpRestore: 0, originalChannel: 0, handBackChannel: 0, waitSince: 0, history: [], sentAny: false, rxZeroLogged: false, lastPwm: [0, 0, 0, 0], original: null, restoreLeft: 0, pwmLogged: 0, disabledLogged: false, startedAt: 0, zeroWarned: "" };
}

function fanControlOn() {
	return typeof FanControl !== "undefined" && FanControl === "SignalRGB Fan Control";
}

function fansRecord() {
	if (!finderFresh() || !fansMac) {
		return null;
	}
	const mac = llMacToString(fansMac);
	return finder.devices.find((d) => d.mac === mac && !d.stale) || null;
}

function fanSlotIndex() {
	if (finder && masterMac && fansMac) {
		const records = finder.devices.map((d) => ({ mac: llParseMac(d.mac) || [], masterMac: llParseMac(d.master) || [], isMaster: d.isMaster }));
		return llSlotIndex(records, fansMac, masterMac);
	}
	return 2;
}

function fanNames(rec) {
	const n = rec && rec.fans ? rec.fans : fanCount();
	const names = [];
	for (let i = 0; i < n; i++) {
		names.push(`Fan ${i + 1}`);
	}
	return names;
}

function safeCall(fn) {
	try {
		return fn();
	} catch (e) {
		return undefined;
	}
}

// The controls SignalRGB should show for the devices as they are now.
function wantedFanControls(rec) {
	const names = [];
	if (pumpMac) names.push("Pump");
	if (fansMac) names.push(...fanNames(rec));
	return names;
}

function syncFanControls(rec) {
	const want = wantedFanControls(rec);
	const added = want.filter((n) => !fan.created.includes(n));
	const removed = fan.created.filter((n) => !want.includes(n));
	if (!added.length && !removed.length) {
		return;
	}
	for (const n of removed) {
		safeCall(() => device.removeFanControl(n));
	}
	for (const n of added) {
		safeCall(() => device.createFanControl(n));
	}
	fan.created = want;
	if (added.some((n) => n.startsWith("Fan "))) {
		fan.startedAt = Date.now(); // let SignalRGB settle the new controls
		if (!fan.original && rec && rec.pwm) {
			fan.original = llSafeHandBack(rec.pwm, rec.fans);
			fan.originalChannel = rec.ch;
		}
	}
	llLog(`Fan Control entries now: ${want.join(", ")}.`);
}

function startFanControl(rec) {
	if (safeCall(() => device.fanControlDisabled())) {
		if (!fan.disabledLogged) {
			fan.disabledLogged = true;
			llLog("Fan & Pump Control is on, but Fan Control is disabled in SignalRGB. Speeds are left alone.");
		}
		return false;
	}
	const names = wantedFanControls(rec);
	for (const n of names) {
		safeCall(() => device.createFanControl(n));
	}
	safeCall(() => device.createTemperatureSensor("Coolant"));
	fan.created = names;
	fan.active = true;
	fan.startedAt = Date.now();
	fan.pumpRestore = 0;
	fan.original = rec && rec.pwm ? llSafeHandBack(rec.pwm, rec.fans) : null;
	fan.originalChannel = rec ? rec.ch : 0;
	llLog(`Fan & Pump Control on: ${names.join(", ")} added to SignalRGB Fan Control${fan.original ? ` (fan PWM before: ${fan.original.join("/")})` : ""}.`);
	return true;
}

function stopFanControl(reason) {
	if (!fan.active) {
		return;
	}
	for (const n of fan.created) {
		safeCall(() => device.removeFanControl(n));
	}
	safeCall(() => device.removeTemperatureSensor("Coolant"));
	const original = fan.original;
	const configured = parseInt(DeviceChannel, 10);
	const handBack = configured >= 1 && configured <= 39 ? configured : fan.originalChannel;
	fan = freshFanState();
	fan.handBackChannel = handBack;
	// Put the pump back on the Pump Speed setting with one last params packet.
	fan.pumpRestore = screenEnabled() ? 0 : 2;
	llLog(`Fan & Pump Control off (${reason}).`);
	// Hand the fans back at the speed they had before we took over.
	if (original && fansMac && masterMac && reason !== "shutdown") {
		fan.original = original;
		fan.restoreLeft = 3;
	} else if (original && fansMac && masterMac) {
		sendFanPwm(original, handBack);
	}
}

function sendFanPwm(pwm, handBackChannel) {
	const rec = fansRecord();
	const info = rec ? { deviceType: rec.type, fanCount: rec.fans, rightAttach: rec.right, fanTypes: rec.fanTypes }
		: { deviceType: 0, fanCount: fanCount(), rightAttach: false, fanTypes: [28] };
	const prepared = llPreparePwm(pwm, info);
	const rx = slot(FansRxSlot) !== 0xff ? slot(FansRxSlot) : (rec ? rec.rx : 0xff);
	// rx 0 is not an address: it is what a device reports before it was given a
	// slot. Writing it back in a PWM frame would make that permanent.
	if (rx === 0) {
		if (!fan.rxZeroLogged) {
			fan.rxZeroLogged = true;
			llLog("Fans report RX slot 0 (not paired to a slot). Not sending fan speeds; re-pair them in L-Connect 3.");
		}
		return null;
	}
	// Byte 15 is the channel the fans adopt: the master channel while we drive them,
	// and on hand-back the channel they were set up on, so L-Connect and older
	// versions of this plugin still find them where they expect.
	const adopt = handBackChannel || masterChannel;
	const frame = llPwmFrame(fansMac, masterMac, rx, adopt, fanSlotIndex(), prepared);
	// The fans drop a command that lands while they are still applying a colour
	// upload, so leave a quiet gap after the last RGB frame and send it twice.
	const quiet = PWM_QUIET_MS - (Date.now() - lastSend);
	if (quiet > 0) {
		device.pause(quiet);
	}
	const channel = channelFor(fansMac);
	safeSend(() => sendRf(frame, channel, rx));
	device.pause(15);
	safeSend(() => sendRf(frame, channel, rx));
	rgbHoldUntil = Date.now() + 30; // and keep the next colour frame off the air briefly
	return prepared;
}

// null = no usable level. A slightly negative value is the engine's curve
// interpolator between states, not a request to stop, so it is not used either.
function levelOf(name) {
	const v = safeCall(() => device.getNormalizedFanlevel(name));
	if (typeof v !== "number" || !isFinite(v) || v < 0) {
		return null;
	}
	return Math.min(v, 1);
}

function fanTick(now) {
	// Stay clear of the clock heartbeat: it goes out on the master channel and a
	// frame sent right after the channel switch can be lost.
	if (now - fan.lastTick < FAN_TICK_MS || now - lastHeartbeat < 300 || now - lastHeartbeat > 800) {
		return;
	}
	fan.lastTick = now;

	if (fan.restoreLeft > 0) {
		fan.restoreLeft--;
		const sent = sendFanPwm(fan.original, fan.handBackChannel);
		if (fan.restoreLeft === 0 && sent) {
			llLog(`Fans handed back at PWM ${sent.join("/")}${fan.handBackChannel ? `, channel ${fan.handBackChannel}` : ""}.`);
		}
	}
	if (!fanControlOn()) {
		return;
	}
	// Turning Fan Control off in SignalRGB makes every level read 0, which would
	// stop the fans, so treat it like switching the feature off.
	if (fan.active && safeCall(() => device.fanControlDisabled())) {
		stopFanControl("Fan Control was disabled in SignalRGB");
		return;
	}
	const rec = fansRecord();
	if (!fan.active) {
		// Nothing to control until the pump/fans are known (auto setup fills
		// them in from the RX Finder a moment after start).
		if (!pumpMac && !fansMac) {
			return;
		}
		// Wait (up to 5 s) for the Finder, so the speeds and channel the fans had
		// before we took over are known and can be handed back later.
		if (fansMac && !rec) {
			fan.waitSince = fan.waitSince || now;
			if (now - fan.waitSince < 5000) {
				return;
			}
		}
		if (!startFanControl(rec)) {
			return;
		}
	}

	// Keep the Fan Control entries in step with the devices (auto setup can
	// find the fans, or a different fan count, after control started).
	syncFanControls(rec);

	// Pump: level -> RPM -> timer (sent by screenTick with the aio params).
	// A missing level keeps the last speed (full speed until the first real one).
	if (pumpMac) {
		const level = levelOf("Pump");
		if (level !== null) {
			fan.pumpRpm = llPumpRpmFromLevel(level, PumpHead === "LCD-C (round)" ? "circle" : "square");
		}
	}

	// Fans: one duty per slot. A missing level keeps the duty the fan had.
	// Right after the controls are created SignalRGB can still report 0 for
	// every fan, so the first seconds keep the speed the fans already run at.
	const fanNamesNow = fan.created.filter((n) => n.startsWith("Fan "));
	if (fansMac && fanNamesNow.length) {
		const names = fanNamesNow;
		const settling = now - fan.startedAt < FAN_SETTLE_MS;
		const allowStop = typeof FanStop !== "undefined" && FanStop === "Stop the fans";
		const pwm = [0, 0, 0, 0];
		const zero = [];
		names.forEach((n, i) => {
			const level = settling ? null : levelOf(n);
			const hold = fan.sentAny ? fan.lastPwm[i] : (rec && rec.pwm && rec.pwm[i] ? rec.pwm[i] : 255);
			pwm[i] = level === null ? hold : Math.round(level * 255);
			if (level !== null && pwm[i] === 0 && !allowStop) {
				pwm[i] = 1; // raised to the fan's minimum duty when the frame is built
				zero.push(n);
			}
		});
		const zeroKey = zero.join(",");
		if (zeroKey && zeroKey !== fan.zeroWarned) {
			llLog(`SignalRGB asks 0% for ${zero.join(", ")}: running at minimum speed instead. Set a curve for them on the Cooling page (or set 'Fans at 0%' to 'Stop the fans').`);
			safeCall(() => device.addMessage("ll_fan0", "Fan curve at 0%", `${zero.join(", ")} run at minimum speed. Check their curves on SignalRGB's Cooling page.`));
		} else if (!zeroKey && fan.zeroWarned) {
			safeCall(() => device.removeMessage("ll_fan0"));
		}
		fan.zeroWarned = zeroKey;
		const smooth = llSmoothPwm(fan.history, pwm);
		fan.history = smooth.history;
		const sent = sendFanPwm(smooth.out);
		if (sent) {
			fan.lastPwm = sent;
			fan.sentAny = true;
		}
		if (fan.pwmLogged < 12) {
			fan.pwmLogged++;
			llLog(`Fan PWM -> ${llMacToString(fansMac)} slot ${fanSlotIndex()}: ${fan.lastPwm.join("/")} (device reports ${rec && rec.pwm ? rec.pwm.join("/") : "?"})`);
		}
	}

	// Live readings for the Fan Control page.
	const pump = pumpRecord();
	if (pump) {
		safeCall(() => device.setRPM("Pump", pump.pumpRpm));
		if (pump.coolant > 0) {
			safeCall(() => device.SetTemperature("Coolant", pump.coolant));
		}
	}
	if (rec && rec.rpm) {
		fan.created.filter((n) => n.startsWith("Fan ")).forEach((n, i) => safeCall(() => device.setRPM(n, rec.rpm[i])));
	}
}

function hexToRgb(hex) {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
	return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}
