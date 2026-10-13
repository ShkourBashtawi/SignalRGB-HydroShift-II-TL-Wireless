// Lian Li HydroShift II LCD-S / LCD-C (L-Wireless) — SignalRGB plugin
// Drives the AIO's pump-head ring and its fan rings over the L-Wireless TX dongle.
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
export function ConflictingProcesses() { return ["L-Connect 3.exe"]; }

/* global
shutdownColor:readonly
LightingMode:readonly
forcedColor:readonly
AioMac:readonly
RxSlot:readonly
FanCount:readonly
RingRotation:readonly
RingReverse:readonly
UpdateRate:readonly
WirelessChannel:readonly
*/
export function ControllableParameters() {
	return [
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#000000"},
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"AioMac", "group":"", "label":"AIO MAC (from the RX Finder device)", "type":"textfield", "default":"00:00:00:00:00:00"},
		{"property":"RxSlot", "group":"", "label":"RX Slot (255 = broadcast)", "type":"number", "min":"0", "max":"255", "step":"1", "default":"255"},
		{"property":"FanCount", "group":"", "label":"Fans on the AIO", "type":"combobox", "values":["1", "2", "3", "4"], "default":"3"},
		{"property":"RingRotation", "group":"", "label":"Ring Rotation (LEDs)", "type":"number", "min":"0", "max":"23", "step":"1", "default":"0"},
		{"property":"RingReverse", "group":"", "label":"Reverse Ring Direction", "type":"boolean", "default":"false"},
		{"property":"UpdateRate", "group":"", "label":"Updates per Second", "type":"combobox", "values":["2", "5", "8", "10", "15"], "default":"10"},
		{"property":"WirelessChannel", "group":"", "label":"Wireless Channel", "type":"combobox", "values":["Auto", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"], "default":"Auto"},
	];
}

//@@CORE@@

const EP_OUT = 0x01;
const EP_IN = 0x81;
const DIRECT_EFFECT_INDEX = [0, 0, 0, 1];
const HEARTBEAT_MS = 1000;
const REFRESH_MS = 2000;

let layout = llBuildLayout(3, 0, false);
let masterMac = null;
let masterChannel = 0;
let probeQueue = [];
let lastFrame = null;      // pacing state
let lastHeartbeat = 0;
let lastSend = 0;
let lastColors = "";
let aioMac = null;
let warnedNoMac = false;
let ioErrors = 0;

export function LedNames() { return layout.names; }
export function LedPositions() { return layout.positions; }

export function Validate(endpoint) {
	return endpoint.interface === 0;
}

export function Initialize() {
	rebuildLayout();
	readMacSetting();
	masterMac = null;
	probeQueue = channelsToProbe();
	device.log(`HydroShift II plugin started. Probing ${probeQueue.length} wireless channel(s).`);
	// Try the most likely channel right away; the rest are probed from Render().
	probeNextChannel(3);
}

export function Render() {
	if (!masterMac) {
		if (probeQueue.length === 0) {
			probeQueue = channelsToProbe();
		}
		probeNextChannel(1);
		return;
	}

	const now = Date.now();

	if (now - lastHeartbeat >= HEARTBEAT_MS) {
		lastHeartbeat = now;
		safeSend(() => sendRf(llBuildClockFrame(masterMac), masterChannel, 0xff));
	}

	if (!aioMac) {
		return;
	}

	const interval = 1000 / Math.max(1, parseInt(UpdateRate, 10) || 10);
	if (now - lastSend < interval) {
		return;
	}

	const colors = grabColors();
	const signature = colors.join(",");
	if (signature === lastColors && now - lastSend < REFRESH_MS) {
		return;
	}

	lastSend = now;
	lastColors = signature;
	safeSend(() => sendDirect(colors));
}

export function Shutdown(SystemSuspending) {
	if (!masterMac || !aioMac) {
		return;
	}
	const color = SystemSuspending ? "#000000" : shutdownColor;
	safeSend(() => sendDirect(grabColors(color)));
}

export function onAioMacChanged() {
	readMacSetting();
	lastColors = "";
}

export function onFanCountChanged() {
	rebuildLayout();
	lastColors = "";
}

export function onRingRotationChanged() {
	rebuildLayout();
	lastColors = "";
}

export function onRingReverseChanged() {
	rebuildLayout();
	lastColors = "";
}

export function onWirelessChannelChanged() {
	masterMac = null;
	probeQueue = channelsToProbe();
}

// ------------------------------------------------------------------------

function rebuildLayout() {
	const fans = Math.min(4, Math.max(1, parseInt(FanCount, 10) || 3));
	const rotation = Math.min(23, Math.max(0, parseInt(RingRotation, 10) || 0));
	const reverse = RingReverse === true || RingReverse === "true" || RingReverse === 1;
	layout = llBuildLayout(fans, rotation, reverse);
	try {
		device.setSize(layout.size);
	} catch (e) { /* older SignalRGB builds */ }
	try {
		device.setControllableLeds(layout.names, layout.positions);
	} catch (e) { /* older SignalRGB builds */ }
}

function readMacSetting() {
	aioMac = llParseMac(AioMac);
	try {
		device.removeMessage("ll_mac");
	} catch (e) { /* ignore */ }
	if (!aioMac) {
		if (!warnedNoMac) {
			device.log("AIO MAC is not set. Open the 'Lian Li Wireless RX (Finder)' device to read it.");
			warnedNoMac = true;
		}
		try {
			device.addMessage("ll_mac", "Set the AIO MAC to start lighting", "Copy it from the 'Lian Li Wireless RX (Finder)' device page.");
		} catch (e) { /* ignore */ }
	} else {
		warnedNoMac = false;
		device.log(`Driving AIO ${llMacToString(aioMac)}`);
	}
}

function channelsToProbe() {
	if (WirelessChannel && WirelessChannel !== "Auto") {
		const ch = parseInt(WirelessChannel, 10);
		if (ch >= 1 && ch <= 39) {
			return [ch, ch, ch];
		}
	}
	// Channel 8 is the vendor default; give it three tries like the reference daemon.
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
			lastColors = "";
			const fw = (reply[11] << 8) | reply[12];
			device.log(`Wireless master ${llMacToString(masterMac)} on channel ${ch} (firmware ${fw}).`);
			try {
				device.removeMessage("ll_master");
			} catch (e) { /* ignore */ }
		}
	}
	if (!masterMac && probeQueue.length === 0) {
		try {
			device.addMessage("ll_master", "Wireless TX did not answer", "Make sure L-Connect 3 and its service are fully closed, then restart SignalRGB.");
		} catch (e) { /* ignore */ }
	}
}

function queryMaster(channel) {
	try {
		flushIn();
		usbWrite(llGetMacPacket(channel));
		const r = usbRead(64, 500);
		return llValidMasterResponse(r) ? r : null;
	} catch (e) {
		device.log(`Master query on channel ${channel} failed: ${e}`);
		return null;
	}
}

function grabColors(override) {
	const colors = [];
	for (let i = 0; i < layout.positions.length; i++) {
		const [x, y] = layout.positions[i];
		let c;
		if (override) {
			c = hexToRgb(override);
		} else if (LightingMode === "Forced") {
			c = hexToRgb(forcedColor);
		} else {
			c = device.color(x, y);
		}
		colors.push([c[0] & 0xff, c[1] & 0xff, c[2] & 0xff]);
	}
	return colors;
}

function sendDirect(colors) {
	const upload = llBuildRgbUpload([colors], 5000, DIRECT_EFFECT_INDEX);
	const rx = Math.min(255, Math.max(0, parseInt(RxSlot, 10)));
	const target = isNaN(rx) ? 0xff : rx;

	for (let index = 0; index < upload.packetCount; index++) {
		const rf = llRgbPacket(upload, aioMac, masterMac, index);
		const repeats = index === 0 ? 2 : 1;
		for (let r = 0; r < repeats; r++) {
			sendRf(rf, masterChannel, target);
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
	const packets = llRfToUsbPackets(rf, channel, rxTarget);
	for (const p of packets) {
		usbWrite(p);
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
			device.log(`USB send failed (${ioErrors}): ${e}`);
		}
		if (ioErrors >= 20) {
			// Force a fresh master probe; the dongle may have been re-plugged.
			masterMac = null;
			probeQueue = channelsToProbe();
			ioErrors = 0;
		}
	}
}

function usbWrite(packet) {
	device.bulk_transfer(EP_OUT, packet, packet.length, 100);
}

function usbRead(length, timeoutMs) {
	const r = device.bulk_transfer(EP_IN, [], length, timeoutMs);
	return Array.isArray(r) ? r : [];
}

function flushIn() {
	for (let i = 0; i < 16; i++) {
		const r = usbRead(64, 5);
		if (!r.length) {
			return;
		}
	}
}

function hexToRgb(hex) {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
	return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}
