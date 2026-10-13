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
		{"property":"PumpMac", "group":"", "label":"Pump MAC", "type":"textfield", "default":"00:00:00:00:00:00"},
		{"property":"PumpRxSlot", "group":"", "label":"Pump RX Slot", "type":"combobox", "values":["Broadcast", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], "default":"Broadcast"},
		{"property":"FansMac", "group":"", "label":"Fans MAC", "type":"textfield", "default":"00:00:00:00:00:00"},
		{"property":"FansRxSlot", "group":"", "label":"Fans RX Slot", "type":"combobox", "values":["Broadcast", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], "default":"Broadcast"},
		{"property":"FanCount", "group":"", "label":"Fan Count", "type":"combobox", "values":["1", "2", "3", "4"], "default":"3"},
		{"property":"LedsPerFan", "group":"", "label":"LEDs per Fan", "type":"combobox", "values":["26", "24", "40", "44", "52", "9"], "default":"26"},
		{"property":"DeviceChannel", "group":"", "label":"Device Channel", "type":"combobox", "values":["Same as TX", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"], "default":"Same as TX"},
		{"property":"WirelessChannel", "group":"", "label":"TX Master Channel", "type":"combobox", "values":["Auto", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"], "default":"Auto"},
		{"property":"UpdateRate", "group":"", "label":"Updates per Second", "type":"combobox", "values":["5", "10", "15", "18"], "default":"15"},
		{"property":"RingRotation", "group":"", "label":"Ring Rotation", "type":"number", "min":"0", "max":"23", "step":"1", "default":"0"},
		{"property":"RingReverse", "group":"", "label":"Reverse Ring Direction", "type":"boolean", "default":"false"},
	];
}

//@@CORE@@

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
