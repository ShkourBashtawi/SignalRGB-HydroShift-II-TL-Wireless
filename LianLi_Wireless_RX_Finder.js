// Lian Li L-Wireless RX — Finder (SignalRGB plugin)
// Reads the wireless device list from the RX dongle and prints, for each device,
// the MAC / RX slot / channel the HydroShift II plugin needs, plus live pump RPM,
// fan RPM and coolant temperature. It has no LEDs.
//
// Community plugin, not affiliated with Lian Li or WhirlwindFX.
// Protocol ported from sgtaziz/lian-li-linux (MIT). License: MIT

export function Name() { return "Lian Li Wireless RX (Finder)"; }
export function VendorId() { return 0x0416; }
export function ProductId() { return 0x8041; }
export function Publisher() { return "ShkourArrio"; }
export function Documentation() { return ""; }
export function Type() { return "rawusb"; }
export function Size() { return [1, 1]; }
export function DefaultPosition() { return [0, 0]; }
export function DefaultScale() { return 1.0; }
export function ImageUrl() { return ""; }
export function ConflictingProcesses() { return ["L-Connect 3.exe", "L-Connect-Service.exe"]; }
export function ControllableParameters() { return []; }
export function LedNames() { return []; }
export function LedPositions() { return []; }

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


const POLL_MS = 5000;
const STATUS_MS = 60000;

let lastPoll = 0;
let lastStatusAt = 0;
let lastBlock = "";
let lastMasterChannel = 0;
let warnedNoReply = false;
let shownIds = [];

export function Validate(endpoint) {
	return endpoint.interface === 0;
}

export function Initialize() {
	llLog("RX Finder started.");
	poll();
}

export function Render() {
	if (Date.now() - lastPoll >= POLL_MS) {
		poll();
	}
}

export function Shutdown() {
	clearMessages();
}

function poll() {
	lastPoll = Date.now();
	let records;
	try {
		records = getDev();
	} catch (e) {
		llLog(`GetDev failed: ${e}`);
		return;
	}
	clearMessages();
	if (!records) {
		if (!warnedNoReply) {
			warnedNoReply = true;
			llLog("The RX dongle did not answer. Is L-Connect 3 / L-Connect-Service still running?");
		}
		addMessage("ll_none", "RX dongle gave no valid reply", "Close L-Connect 3 and L-Connect-Service.");
		return;
	}
	warnedNoReply = false;

	const master = records.find((r) => r.isMaster);
	const devices = records.filter((r) => !r.isMaster);
	const pumps = devices.filter((d) => d.deviceType === 10 || d.deviceType === 11);
	const fans = devices.filter((d) => d.deviceType === 0);

	const block = settingsBlock(pumps, fans, devices);
	if (block !== lastBlock) {
		lastBlock = block;
		for (const line of block.split("\n")) {
			llLog(line);
		}
	}

	if (Date.now() - lastStatusAt >= STATUS_MS) {
		lastStatusAt = Date.now();
		for (const p of pumps) {
			llLog(`Status  pump ${p.fanRpm[3]} rpm, coolant ${p.coolantC} °C`);
		}
		for (const f of fans) {
			llLog(`Status  fans ${f.fanRpm.slice(0, f.fanCount).join(" / ")} rpm`);
		}
	}

	if (!devices.length) {
		addMessage("ll_none", "No wireless devices found yet", "Check the devices are powered and bound to this dongle.");
		return;
	}
	devices.forEach((d, i) => addMessage(`ll_dev_${i}`, `${nameOf(d)} — MAC ${llMacToString(d.mac)}`, `RX slot ${d.rxType}, channel ${d.channel}`));
	if (master) {
		lastMasterChannel = master.channel;
	}
}

function nameOf(d) {
	if (d.deviceType === 10 || d.deviceType === 11) {
		return llDeviceTypeName(d.deviceType);
	}
	const family = llFanFamily(d.fanTypes.find((b) => b !== 0) || 0);
	if (d.deviceType === 0) {
		return `${family ? family.name : "Wireless fans"} x${d.fanCount}`;
	}
	return llDeviceTypeName(d.deviceType);
}

function row(label, value) {
	return `  ${(label + " ").padEnd(20, ".")} ${value}`;
}

function settingsBlock(pumps, fans, devices) {
	const lines = [];
	lines.push("==================================================");
	lines.push(" COPY THESE INTO: Lian Li HydroShift II (Wireless)");
	lines.push("==================================================");
	if (!devices.length) {
		lines.push("  No wireless devices found yet.");
		lines.push("  Make sure they are powered and bound to this dongle in L-Connect 3.");
		lines.push("==================================================");
		return lines.join("\n");
	}
	const p = pumps[0];
	const f = fans[0];
	const family = f ? llFanFamily(f.fanTypes.find((b) => b !== 0) || 0) : null;
	lines.push(row("Pump MAC", p ? llMacToString(p.mac) : "00:00:00:00:00:00   (no pump found)"));
	lines.push(row("Pump RX Slot", p ? String(p.rxType) : "Broadcast"));
	lines.push(row("Fans MAC", f ? llMacToString(f.mac) : "00:00:00:00:00:00   (no fans found)"));
	lines.push(row("Fans RX Slot", f ? String(f.rxType) : "Broadcast"));
	lines.push(row("Fan Count", f ? String(f.fanCount) : "-"));
	lines.push(row("LEDs per Fan", family ? String(family.leds) : "26"));
	lines.push(row("Device Channel", String((p || f).channel)));
	lines.push(row("TX Master Channel", "Auto"));
	lines.push("--------------------------------------------------");
	for (const d of devices) {
		lines.push(`  Found: ${nameOf(d)}  (MAC ${llMacToString(d.mac)})`);
	}
	if (pumps.length > 1 || fans.length > 1) {
		lines.push("  Note: more than one pump or fan group found; the values above use the first of each.");
	}
	if (p && p.mbRgbSync) {
		lines.push("  WARNING: Motherboard RGB Sync is ON for the pump. Turn it off in L-Connect 3.");
	}
	lines.push("==================================================");
	return lines.join("\n");
}

function getDev() {
	const cmd = new Array(64).fill(0);
	cmd[0] = LL_USB_CMD_SEND_RF;
	cmd[1] = 1; // one page = up to 10 devices
	llBulkWrite(cmd);

	let resp = [];
	for (let i = 0; i < 40; i++) {
		const chunk = llBulkRead(i === 0 ? 300 : 50);
		if (!chunk.length) {
			break;
		}
		if (!resp.length && chunk[0] !== LL_USB_CMD_SEND_RF) {
			continue; // stale packet from an earlier request
		}
		resp = resp.concat(chunk);
		const need = 4 + Math.min(resp[1], 10) * 42;
		if (resp.length >= need) {
			break;
		}
	}
	return llParseGetDev(resp);
}

function addMessage(id, text, tip) {
	try {
		device.addMessage(id, text, tip);
		shownIds.push(id);
	} catch (e) { /* older SignalRGB builds */ }
}

function clearMessages() {
	for (const id of shownIds) {
		try {
			device.removeMessage(id);
		} catch (e) { /* ignore */ }
	}
	shownIds = [];
}
