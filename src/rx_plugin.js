// Lian Li L-Wireless RX — Finder (SignalRGB plugin)
// Reads the wireless device list from the RX dongle and shows each device's MAC,
// RX slot and channel, plus live pump/fan RPM and coolant temperature.
// It has no LEDs; it exists so the HydroShift II plugin knows which device to drive.
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
export function ConflictingProcesses() { return ["L-Connect 3.exe"]; }
export function ControllableParameters() { return []; }
export function LedNames() { return []; }
export function LedPositions() { return []; }

//@@CORE@@

const EP_OUT = 0x01;
const EP_IN = 0x81;
const POLL_MS = 3000;

let lastPoll = 0;
let shownIds = [];
let lastSummary = "";

export function Validate(endpoint) {
	return endpoint.interface === 0;
}

export function Initialize() {
	device.log("RX Finder started.");
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
		device.log(`GetDev failed: ${e}`);
		return;
	}
	if (!records) {
		return;
	}

	const devices = records.filter((r) => !r.isMaster);
	const summary = devices.map(describe).join(" | ");
	if (summary !== lastSummary) {
		device.log(devices.length ? `Wireless devices: ${summary}` : "No wireless devices reported yet.");
		lastSummary = summary;
	}

	clearMessages();
	if (!devices.length) {
		addMessage("ll_none", "No wireless devices found yet", "Check the AIO is powered and bound in L-Connect 3, then close L-Connect 3.");
		return;
	}
	devices.forEach((d, i) => {
		const isAio = d.deviceType === 10 || d.deviceType === 11;
		const title = isAio
			? `${llDeviceTypeName(d.deviceType)} — MAC ${llMacToString(d.mac)}`
			: `${llDeviceTypeName(d.deviceType)} — MAC ${llMacToString(d.mac)}`;
		let tip = `RX slot ${d.rxType}, channel ${d.channel}, ${d.fanCount} fan(s). Fans RPM: ${d.fanRpm.slice(0, 3).join(" / ")}`;
		if (isAio) {
			tip += `, pump ${d.fanRpm[3]} RPM, coolant ${d.coolantC || "?"} °C`;
			if (d.mbRgbSync) {
				tip += ". Motherboard RGB sync is ON — turn it off in L-Connect 3 first.";
			}
		}
		addMessage(`ll_dev_${i}`, title, tip);
	});
}

function describe(d) {
	let s = `${llDeviceTypeName(d.deviceType)} ${llMacToString(d.mac)} rx=${d.rxType} ch=${d.channel} fans=${d.fanCount}`;
	if (d.deviceType === 10 || d.deviceType === 11) {
		s += ` pump=${d.fanRpm[3]}rpm coolant=${d.coolantC}C mbSync=${d.mbRgbSync}`;
	}
	return s;
}

function getDev() {
	flushIn();
	const cmd = new Array(64).fill(0);
	cmd[0] = LL_USB_CMD_SEND_RF;
	cmd[1] = 1; // one page = up to 10 devices
	device.bulk_transfer(EP_OUT, cmd, 64, 100);

	let resp = [];
	let first = true;
	while (resp.length < 512) {
		const chunk = device.bulk_transfer(EP_IN, [], 512, first ? 100 : 10);
		first = false;
		if (!Array.isArray(chunk) || chunk.length === 0) {
			break;
		}
		resp = resp.concat(chunk);
	}
	return llParseGetDev(resp);
}

function flushIn() {
	for (let i = 0; i < 16; i++) {
		const r = device.bulk_transfer(EP_IN, [], 512, 5);
		if (!Array.isArray(r) || r.length === 0) {
			return;
		}
	}
}

function addMessage(id, text, tip) {
	try {
		device.addMessage(id, text, tip);
		shownIds.push(id);
	} catch (e) {
		device.log(`${text} (${tip})`);
	}
}

function clearMessages() {
	for (const id of shownIds) {
		try {
			device.removeMessage(id);
		} catch (e) { /* ignore */ }
	}
	shownIds = [];
}
