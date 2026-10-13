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
