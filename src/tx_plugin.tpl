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
ScreenBrightness:readonly
ScreenRotation:readonly
ScreenCycle:readonly
ScreenLabelColor:readonly
ScreenValueColor:readonly
ScreenUnitColor:readonly
PumpSpeed:readonly
PumpHead:readonly
FanControl:readonly
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
		llLog(`RGB -> ${llMacToString(targetMac)} ch ${channelFor(targetMac)} rx ${rxSlot}: ${colors.length} LEDs, ${upload.compressed.length} bytes, ${upload.packetCount} packets, effect ${llHex(upload.effectIndex)}, first colour ${colors[0].join(",")}`);
	}
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
	if (!finder || !pumpMac || Date.now() - finderAt > FINDER_STALE_MS) {
		return null;
	}
	const mac = llMacToString(pumpMac);
	return finder.devices.find((d) => d.mac === mac) || null;
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
let fan = freshFanState();

function freshFanState() {
	return { active: false, created: [], lastTick: 0, pumpRpm: 3200, pumpRestore: 0, originalChannel: 0, handBackChannel: 0, waitSince: 0, lastPwm: [0, 0, 0, 0], original: null, restoreLeft: 0, pwmLogged: 0, disabledLogged: false };
}

function fanControlOn() {
	return typeof FanControl !== "undefined" && FanControl === "SignalRGB Fan Control";
}

function fansRecord() {
	if (!finder || !fansMac || Date.now() - finderAt > FINDER_STALE_MS) {
		return null;
	}
	const mac = llMacToString(fansMac);
	return finder.devices.find((d) => d.mac === mac) || null;
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

function startFanControl(rec) {
	if (safeCall(() => device.fanControlDisabled())) {
		if (!fan.disabledLogged) {
			fan.disabledLogged = true;
			llLog("Fan & Pump Control is on, but Fan Control is disabled in SignalRGB. Speeds are left alone.");
		}
		return false;
	}
	const names = [];
	if (pumpMac) names.push("Pump");
	if (fansMac) names.push(...fanNames(rec));
	for (const n of names) {
		safeCall(() => device.createFanControl(n));
	}
	safeCall(() => device.createTemperatureSensor("Coolant"));
	fan.created = names;
	fan.active = true;
	fan.pumpRestore = 0;
	fan.original = rec && rec.pwm ? rec.pwm.slice() : null;
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

function levelOf(name) {
	const v = safeCall(() => device.getNormalizedFanlevel(name));
	return typeof v === "number" && isFinite(v) ? Math.min(Math.max(v, 0), 1) : null;
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
		if (fan.restoreLeft === 0) {
			llLog(`Fans handed back at PWM ${sent.join("/")}${fan.handBackChannel ? `, channel ${fan.handBackChannel}` : ""}.`);
		}
	}
	if (!fanControlOn()) {
		return;
	}
	const rec = fansRecord();
	if (!fan.active) {
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

	// Pump: level -> RPM -> timer (sent by screenTick with the aio params).
	if (pumpMac) {
		const level = levelOf("Pump");
		fan.pumpRpm = llPumpRpmFromLevel(level === null ? 1 : level, PumpHead === "LCD-C (round)" ? "circle" : "square");
	}

	// Fans: one duty per slot. A missing level keeps the duty the fan had.
	if (fansMac) {
		const names = fan.created.filter((n) => n.startsWith("Fan "));
		const pwm = [0, 0, 0, 0];
		names.forEach((n, i) => {
			const level = levelOf(n);
			const fallback = rec && rec.pwm ? rec.pwm[i] : 255;
			pwm[i] = level === null ? fallback : Math.round(level * 255);
		});
		fan.lastPwm = sendFanPwm(pwm);
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
