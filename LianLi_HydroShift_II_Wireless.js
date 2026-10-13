// Lian Li HydroShift II + UNI FAN Wireless — SignalRGB plugin (L-Wireless TX dongle)
// Drives the HydroShift II pump-head ring and a group of UNI FAN wireless fans live
// from the SignalRGB canvas.
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
export function ImageUrl() { return ""; }
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
*/
export function ControllableParameters() {
	return [
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#000000"},
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"PumpMac", "group":"", "label":"Pump (HydroShift II) MAC — from RX Finder", "type":"textfield", "default":"00:00:00:00:00:00"},
		{"property":"PumpRxSlot", "group":"", "label":"Pump RX Slot (from RX Finder)", "type":"combobox", "values":["Broadcast", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], "default":"Broadcast"},
		{"property":"FansMac", "group":"", "label":"Fans MAC — from RX Finder (empty = none)", "type":"textfield", "default":"00:00:00:00:00:00"},
		{"property":"FansRxSlot", "group":"", "label":"Fans RX Slot (from RX Finder)", "type":"combobox", "values":["Broadcast", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], "default":"Broadcast"},
		{"property":"FanCount", "group":"", "label":"Fan Count", "type":"combobox", "values":["1", "2", "3", "4"], "default":"3"},
		{"property":"LedsPerFan", "group":"", "label":"LEDs per Fan (TL = 26)", "type":"combobox", "values":["26", "24", "40", "44", "52", "9"], "default":"26"},
		{"property":"RingRotation", "group":"", "label":"Ring Rotation", "type":"number", "min":"0", "max":"23", "step":"1", "default":"0"},
		{"property":"RingReverse", "group":"", "label":"Reverse Ring Direction", "type":"boolean", "default":"false"},
		{"property":"UpdateRate", "group":"", "label":"Updates per Second", "type":"combobox", "values":["5", "10", "15", "18"], "default":"15"},
		{"property":"DeviceChannel", "group":"", "label":"Device Channel (from RX Finder)", "type":"combobox", "values":["Same as TX", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"], "default":"Same as TX"},
		{"property":"WirelessChannel", "group":"", "label":"TX Master Channel", "type":"combobox", "values":["Auto", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"], "default":"Auto"},
	];
}

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
	if (!frames.length) {
		throw new Error("RGB upload needs at least one frame");
	}
	const ledCount = frames[0].length;
	if (ledCount < 1 || ledCount > 255) {
		throw new Error("RGB upload needs 1..255 LEDs per frame");
	}
	if (intervalMs < 1 || intervalMs > 40959) {
		throw new Error("RGB interval must be 1..40959 ms");
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

	const hundredths = intervalMs * 160; // 0.625 ms RF ticks, in hundredths
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
	const ring = (count, cx, cy, r, label) => {
		for (let i = 0; i < count; i++) {
			let step = reverse ? (count - i) % count : i;
			step = (step + Math.round((rotation * count) / LL_LEDS_PER_RING)) % count;
			const a = -Math.PI / 2 + (2 * Math.PI * step) / count;
			names.push(`${label} LED ${i + 1}`);
			positions.push([Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]);
		}
	};
	ring(LL_LEDS_PER_RING, 6 + 12 * fanCount, 6, 5, "Pump");
	for (let f = 0; f < fanCount; f++) {
		ring(ledsPerFan, 6 + 12 * f, 6, 5, `Fan ${f + 1}`);
	}
	return {
		names,
		positions,
		size: [12 * (fanCount + 1), 12],
		pumpCount: LL_LEDS_PER_RING,
		fanLedCount: fanCount * ledsPerFan,
	};
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
let lastSignature = "";
let pumpMac = null;
let fansMac = null;
let ioErrors = 0;

export function LedNames() { return layout.names; }
export function LedPositions() { return layout.positions; }

export function Validate(endpoint) {
	return endpoint.interface === 0;
}

export function Initialize() {
	rebuildLayout();
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

	if (!pumpMac && !fansMac) {
		return;
	}

	const interval = 1000 / Math.max(1, parseInt(UpdateRate, 10) || 15);
	if (now - lastSend < interval) {
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
	if (!masterMac) {
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
export function onWirelessChannelChanged() {
	masterMac = null;
	probeQueue = channelsToProbe();
}

// ------------------------------------------------------------------------

function fanCount() {
	return Math.min(4, Math.max(1, parseInt(FanCount, 10) || 3));
}

function ledsPerFan() {
	return Math.min(64, Math.max(1, parseInt(LedsPerFan, 10) || 26));
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
	if (!pumpMac && !fansMac) {
		llLog("No MAC set yet. Copy them from the 'Lian Li Wireless RX (Finder)' device.");
		try {
			device.addMessage("ll_mac", "Set the Pump / Fans MAC to start lighting", "Copy them from the 'Lian Li Wireless RX (Finder)' device console.");
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

function slot(value) {
	const n = parseInt(value, 10);
	return n >= 1 && n <= 13 ? n : 0xff;
}

function sendAll(colors) {
	if (pumpMac) {
		sendDirect(pumpMac, slot(PumpRxSlot), colors.slice(0, layout.pumpCount));
	}
	if (fansMac) {
		sendDirect(fansMac, slot(FansRxSlot), colors.slice(layout.pumpCount, layout.pumpCount + layout.fanLedCount));
	}
}

let sendLogs = 0;
function sendDirect(targetMac, rxSlot, colors) {
	const upload = llBuildRgbUpload([colors], 5000, null);
	if (sendLogs < 6) {
		sendLogs++;
		llLog(`RGB -> ${llMacToString(targetMac)} ch ${deviceChannel()} rx ${rxSlot}: ${colors.length} LEDs, ${upload.compressed.length} bytes, ${upload.packetCount} packets, effect ${llHex(upload.effectIndex)}, first colour ${colors[0].join(",")}`);
	}
	for (let index = 0; index < upload.packetCount; index++) {
		const rf = llRgbPacket(upload, targetMac, masterMac, index);
		const repeats = index === 0 ? 2 : 1;
		for (let r = 0; r < repeats; r++) {
			sendRf(rf, deviceChannel(), rxSlot);
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

function hexToRgb(hex) {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
	return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}
