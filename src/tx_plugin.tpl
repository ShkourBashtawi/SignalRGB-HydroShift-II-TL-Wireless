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
export function ImageUrl() { return "@@IMAGE:hydroshift_ii_tl_wireless.png@@"; }
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
ScreenValue1:readonly
ScreenValue2:readonly
ScreenValue3:readonly
ScreenValue4:readonly
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
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced", "Hardware Effect"], "default":"Canvas"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"HwEffect", "group":"lighting", "label":"Hardware Effect", "description":"Stored on the pump and fans and played by them at 20 frames per second. Used by Lighting Mode 'Hardware Effect' and by 'When SignalRGB Closes'. Canvas Loop records 4 seconds of the current SignalRGB effect.", "type":"combobox", "values":["Rainbow Wave", "Rainbow Spin", "Color Cycle", "Breathing", "Spinner", "Static", "Canvas Loop"], "default":"Rainbow Wave"},
		{"property":"HwSpeed", "group":"lighting", "label":"Effect Speed", "type":"number", "min":"1", "max":"10", "step":"1", "default":"5"},
		{"property":"HwColor", "group":"lighting", "label":"Effect Color", "description":"For Breathing, Spinner and Static.", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"OnExit", "group":"lighting", "label":"When SignalRGB Closes", "description":"Hardware Effect leaves the stored effect running on the devices after SignalRGB exits.", "type":"combobox", "values":["Shutdown Color", "Hardware Effect"], "default":"Shutdown Color"},
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#000000"},
		{"property":"RingRotation", "group":"lighting", "label":"Ring Rotation", "type":"number", "min":"0", "max":"23", "step":"1", "default":"0"},
		{"property":"RingReverse", "group":"lighting", "label":"Reverse Ring Direction", "type":"boolean", "default":"false"},
		{"property":"ScreenMode", "group":"", "label":"LCD · Screen", "type":"combobox", "values":["Off (don't touch)", "CPU/GPU Sensors"], "default":"Off (don't touch)"},
		{"property":"ScreenTheme", "group":"", "label":"LCD · Theme", "type":"combobox", "values":["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], "default":"1"},
		{"property":"ScreenValue1", "group":"", "label":"LCD · Value 1 (CPU temp spot)", "description":"What the theme draws in this spot. The text label next to it comes from the theme and does not change. Pump Speed is a percentage of the pump's maximum (the screen only shows 0-99).", "type":"combobox", "values":["CPU Temperature", "CPU Load", "GPU Temperature", "GPU Load", "Coolant Temperature", "Pump Speed (%)", "Off"], "default":"CPU Temperature"},
		{"property":"ScreenValue2", "group":"", "label":"LCD · Value 2 (CPU load spot)", "description":"What the theme draws in this spot. The text label next to it comes from the theme and does not change. Pump Speed is a percentage of the pump's maximum (the screen only shows 0-99).", "type":"combobox", "values":["CPU Temperature", "CPU Load", "GPU Temperature", "GPU Load", "Coolant Temperature", "Pump Speed (%)", "Off"], "default":"CPU Load"},
		{"property":"ScreenValue3", "group":"", "label":"LCD · Value 3 (GPU temp spot)", "description":"What the theme draws in this spot. The text label next to it comes from the theme and does not change. Pump Speed is a percentage of the pump's maximum (the screen only shows 0-99).", "type":"combobox", "values":["CPU Temperature", "CPU Load", "GPU Temperature", "GPU Load", "Coolant Temperature", "Pump Speed (%)", "Off"], "default":"GPU Temperature"},
		{"property":"ScreenValue4", "group":"", "label":"LCD · Value 4 (GPU load spot)", "description":"What the theme draws in this spot. The text label next to it comes from the theme and does not change. Pump Speed is a percentage of the pump's maximum (the screen only shows 0-99).", "type":"combobox", "values":["CPU Temperature", "CPU Load", "GPU Temperature", "GPU Load", "Coolant Temperature", "Pump Speed (%)", "Off"], "default":"GPU Load"},
		{"property":"ScreenBrightness", "group":"", "label":"LCD · Brightness", "type":"number", "min":"0", "max":"100", "step":"5", "default":"80"},
		{"property":"ScreenRotation", "group":"", "label":"LCD · Rotation", "type":"combobox", "values":["0°", "90°", "180°", "270°"], "default":"0°"},
		{"property":"ScreenCycle", "group":"", "label":"LCD · Page Time (s)", "type":"number", "min":"1", "max":"30", "step":"1", "default":"3"},
		{"property":"ScreenLabelColor", "group":"", "label":"LCD · Label Color", "min":"0", "max":"360", "type":"color", "default":"#ffffff"},
		{"property":"ScreenValueColor", "group":"", "label":"LCD · Value Color", "min":"0", "max":"360", "type":"color", "default":"#ffffff"},
		{"property":"ScreenUnitColor", "group":"", "label":"LCD · Unit Color", "min":"0", "max":"360", "type":"color", "default":"#ffffff"},
		{"property":"FanControl", "group":"", "label":"Fans & Pump · Control", "description":"SignalRGB Fan Control drives the pump and every fan from curves on SignalRGB's Fan Control page. Off leaves the speeds the devices already have.", "type":"combobox", "values":["Off (keep current speeds)", "SignalRGB Fan Control"], "default":"Off (keep current speeds)"},
		{"property":"FanStop", "group":"", "label":"Fans & Pump · Fans at 0%", "description":"What a 0% point on a SignalRGB fan curve does. Minimum speed keeps the fans turning (safer: a fresh or empty curve reads 0%).", "type":"combobox", "values":["Minimum speed", "Stop the fans"], "default":"Minimum speed"},
		{"property":"PumpSpeed", "group":"", "label":"Fans & Pump · Pump Speed (with LCD on)", "type":"combobox", "values":["3200 rpm (max)", "3000 rpm", "2800 rpm", "2600 rpm", "2400 rpm", "2200 rpm", "2000 rpm", "1800 rpm", "1600 rpm"], "default":"3200 rpm (max)"},
		{"property":"PumpHead", "group":"", "label":"Fans & Pump · Pump Head", "type":"combobox", "values":["LCD-S (square)", "LCD-C (round)"], "default":"LCD-S (square)"},
		{"property":"PumpMac", "group":"", "label":"Advanced · Pump MAC", "description":"Leave 00:00:00:00:00:00 to use the pump the RX Finder sees (automatic).", "type":"textfield", "default":"00:00:00:00:00:00"},
		{"property":"PumpRxSlot", "group":"", "label":"Advanced · Pump RX Slot", "description":"Broadcast = take it from the RX Finder (automatic).", "type":"combobox", "values":["Broadcast", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], "default":"Broadcast"},
		{"property":"FansMac", "group":"", "label":"Advanced · Fans MAC", "description":"Leave 00:00:00:00:00:00 to use the fan group the RX Finder sees (automatic).", "type":"textfield", "default":"00:00:00:00:00:00"},
		{"property":"FansRxSlot", "group":"", "label":"Advanced · Fans RX Slot", "description":"Broadcast = take it from the RX Finder (automatic).", "type":"combobox", "values":["Broadcast", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"], "default":"Broadcast"},
		{"property":"FanCount", "group":"", "label":"Advanced · Fan Count", "type":"combobox", "values":["Auto", "1", "2", "3", "4"], "default":"Auto"},
		{"property":"LedsPerFan", "group":"", "label":"Advanced · LEDs per Fan", "type":"combobox", "values":["Auto", "26", "24", "40", "44", "52", "9"], "default":"Auto"},
		{"property":"DeviceChannel", "group":"", "label":"Advanced · Device Channel", "type":"combobox", "values":["Same as TX", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"], "default":"Same as TX"},
		{"property":"WirelessChannel", "group":"", "label":"Advanced · TX Master Channel", "type":"combobox", "values":["Auto", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39"], "default":"Auto"},
		{"property":"UpdateRate", "group":"", "label":"Advanced · Updates per Second", "type":"combobox", "values":["5", "10", "15", "18"], "default":"15"},
	];
}

import udp from "@SignalRGB/udp";

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

// The four value spots of the sensor theme (CPU temp, CPU load, GPU temp, GPU
// load). Like lian-li-linux, any source can go in any spot; "Off" or a value we
// can't read is sent with its enable flag cleared so the theme leaves it out.
function screenValue(setting, fresh, rec) {
	switch (setting) {
	case "CPU Temperature": return fresh.cpuTemp;
	case "CPU Load": return fresh.cpuLoad;
	case "GPU Temperature": return fresh.gpuTemp;
	case "GPU Load": return fresh.gpuLoad;
	case "Coolant Temperature": return rec && rec.coolant > 0 ? rec.coolant : null;
	case "Pump Speed (%)": return rec ? pumpPercent(rec.pumpRpm) : null;
	default: return null;
	}
}

function pumpPercent(rpm) {
	if (typeof rpm !== "number" || rpm <= 0) {
		return null;
	}
	const max = PumpHead === "LCD-C (round)" ? 2500 : 3200;
	return Math.min(Math.round(rpm * 100 / max), 99);
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
	const live = screenEnabled() ? rec : null; // coolant + pump only while the screen is on
	const param = llBuildAioParam({
		cpuTemp: screenValue(ScreenValue1, fresh, live),
		cpuLoad: screenValue(ScreenValue2, fresh, live),
		gpuTemp: screenValue(ScreenValue3, fresh, live),
		gpuLoad: screenValue(ScreenValue4, fresh, live),
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
			llLog(`WARNING: pump reports ${rec.pumpRpm} rpm. Set LCD · Screen to Off and reopen L-Connect 3.`);
			try {
				device.addMessage("ll_pump", `Pump RPM low (${rec.pumpRpm})`, "Set LCD · Screen to Off and reopen L-Connect 3 to restore the pump speed.");
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
