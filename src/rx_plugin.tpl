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

//@@CORE@@

const POLL_MS = 5000;
const SUMMARY_MS = 60000;

let lastPoll = 0;
let lastSummaryAt = 0;
let lastSummary = "";
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
		addMessage("ll_none", "RX dongle gave no valid reply", "See the device console.");
		return;
	}

	const devices = records.filter((r) => !r.isMaster);
	const master = records.find((r) => r.isMaster);
	const lines = devices.map(describe);
	const strip = (t) => t.replace(/\d+(\/\d+)* rpm|\d+ °C/g, "");
	const summary = lines.map((l) => l.text).join("\n");
	if (strip(summary) !== strip(lastSummary) || Date.now() - lastSummaryAt >= SUMMARY_MS) {
		lastSummaryAt = Date.now();
		if (!devices.length) {
			llLog("No wireless devices reported yet.");
		} else {
			llLog(`Found ${devices.length} wireless device(s)${master ? ` — TX master ${llMacToString(master.mac)} on channel ${master.channel}` : ""}:`);
			for (const l of lines) {
				llLog(`  ${l.text}`);
			}
		}
	}
	lastSummary = summary;

	if (!devices.length) {
		addMessage("ll_none", "No wireless devices found yet", "Check the devices are powered and bound to this dongle.");
		return;
	}
	lines.forEach((l, i) => addMessage(`ll_dev_${i}`, l.title, l.text));
}

function describe(d) {
	const mac = llMacToString(d.mac);
	const isAio = d.deviceType === 10 || d.deviceType === 11;
	if (isAio) {
		return {
			title: `${llDeviceTypeName(d.deviceType)} — Pump MAC ${mac}`,
			text: `[PUMP] ${llDeviceTypeName(d.deviceType)}  MAC ${mac}  RX slot ${d.rxType}  channel ${d.channel}  effect ${llHex(d.effectIndex)}  pump ${d.fanRpm[3]} rpm  coolant ${d.coolantC} °C${d.mbRgbSync ? "  (MB RGB sync ON — turn it off)" : ""}`,
		};
	}
	const family = llFanFamily(d.fanTypes.find((b) => b !== 0) || 0);
	const name = d.deviceType === 0 ? (family ? family.name : "Wireless fans") : llDeviceTypeName(d.deviceType);
	const leds = family ? `${family.leds} LEDs/fan` : "unknown LED count";
	return {
		title: `${name} x${d.fanCount} — Fans MAC ${mac}`,
		text: `[FANS] ${name} x${d.fanCount} (${leds})  MAC ${mac}  RX slot ${d.rxType}  channel ${d.channel}  effect ${llHex(d.effectIndex)}  ${d.fanRpm.slice(0, d.fanCount).join("/")} rpm`,
	};
}

function getDev() {
	llFlushIn();
	const cmd = new Array(64).fill(0);
	cmd[0] = LL_USB_CMD_SEND_RF;
	cmd[1] = 1; // one page = up to 10 devices
	llBulkWrite(cmd);

	let resp = [];
	for (let i = 0; i < 40; i++) {
		const chunk = llBulkRead(i === 0 ? 300 : 30);
		if (!chunk.length) {
			break;
		}
		resp = resp.concat(chunk);
		if (resp.length >= 4 && resp[0] === LL_USB_CMD_SEND_RF) {
			const need = 4 + Math.min(resp[1], 10) * 42;
			if (resp.length >= need) {
				break;
			}
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
