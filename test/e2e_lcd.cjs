// End-to-end LCD simulation: TX plugin + RX Finder + sensor helper messages on a
// mock UDP bus, against a fake dongle pair and a fake AIO that acknowledges the
// theme switch by adopting the sequence number (as the firmware does).
const fs = require("fs"), vm = require("vm");
const L = require("../src/core.cjs");
const P = __dirname + "/../";
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.log("FAIL", m); } else console.log("ok  ", m); };

// ---- fake clock + UDP bus ----
let now = 1_800_000_000_000;
class FakeDate extends Date { static now() { return now; } }
const ports = {};
const queue = [];
const udp = {
	createSocket() {
		const handlers = {};
		return {
			on(ev, cb) { handlers[ev] = cb; },
			bind(port) { if (ports[port]) throw new Error("EADDRINUSE"); ports[port] = handlers; },
			write(data, address, port) { queue.push({ port, msg: { data: String(data), address: "127.0.0.1", port: 50000 } }); },
			close() { for (const p in ports) if (ports[p] === handlers) delete ports[p]; },
		};
	},
};
function deliver() { while (queue.length) { const q = queue.shift(); const h = ports[q.port]; if (h && h.message) h.message(q.msg); } }

function load(file, device, params) {
	const src = fs.readFileSync(P + file, "utf8")
		.replace(/^import udp from "@SignalRGB\/udp";$/m, "")
		.replace(/^export /gm, "");
	const ctx = vm.createContext({ device, console, Date: FakeDate, Math, JSON, udp, ...require("./param_defaults.cjs")(P + file), ...params });
	vm.runInContext(src + "\n;this.__api={Initialize,Render,Shutdown};this.__ctx=this;", ctx);
	return { api: ctx.__api, ctx };
}

const MASTER = [0xe6, 0xd8, 0x71, 0xe5, 0x66, 0xe4], PUMP = [0xe7, 0xf5, 0xf3, 0xe5, 0x66, 0xe1];
const real = fs.readFileSync(__dirname + "/real_reply.cjs", "utf8").match(/`([^`]+)`/)[1].split(/\s+/).map((h) => parseInt(h, 16));
const aio = { seq: real[4 + 40], rpm: 3180, theme: false, params: [] };

// ---- fake TX dongle: decode RF frames, let the fake AIO react ----
const pkt = (a) => ({ length: a.length, data: a });
let txIn = [], cur = null;
const frames = [];
const txLogs = [], txMsgs = {};
const txDev = {
	bulk_transfer(ep, data, len) {
		if (ep < 0x80) {
			if (data[0] === 0x11 && data[1] === 8) {
				const r = new Array(64).fill(0); r[0] = 0x11; MASTER.forEach((b, i) => r[1 + i] = b); r[9] = 0x10; r[12] = 42; txIn.push(r);
			}
			if (data[0] === 0x10) {
				if (data[1] === 0) cur = { ch: data[2], rx: data[3], data: [] };
				cur.data.push(...data.slice(4, 64));
				if (data[1] === 3) { frames.push(cur); onFrame(cur); cur = null; }
			}
			return { length: 64 };
		}
		return txIn.length ? pkt(txIn.shift()) : { length: -1 };
	},
	pause() {}, log(m) { txLogs.push(String(m)); }, color() { return [10, 20, 30]; },
	addMessage(id, t) { txMsgs[id] = t; }, removeMessage(id) { delete txMsgs[id]; }, setControllableLeds() {}, setSize() {},
};
function onFrame(f) {
	const d = f.data;
	if (d[0] !== 0x12 || !PUMP.every((b, i) => d[2 + i] === b)) return;
	if (d[1] === 0x19) { aio.seq = d[17]; aio.theme = true; aio.themeFrame = f; }
	if (d[1] === 0x21) { aio.params.push(f); const t = (d[18 + 28] << 8) | d[18 + 29]; aio.rpm = t >= 1500 ? 0 : t <= 50 ? 3180 : 3180 - t; } // pretend a slow timer stalls the pump
}

// ---- fake RX dongle: serve the real reply with the AIO's live seq + rpm ----
let rxIn = [];
const rxLogs = [];
const rxDev = {
	bulk_transfer(ep, data) {
		if (ep < 0x80) {
			if (data[0] === 0x10) {
				const r = real.slice();
				r[4 + 40] = aio.seq;
				r[4 + 34] = (aio.rpm >> 8) & 0x0f; r[4 + 35] = aio.rpm & 0xff;
				rxIn = [r.slice(0, 64), r.slice(64, 128), r.slice(128, 192)];
			}
			return { length: 64 };
		}
		return rxIn.length ? pkt(rxIn.shift()) : { length: -1 };
	},
	pause() {}, log(m) { rxLogs.push(String(m)); }, addMessage() {}, removeMessage() {},
};

const params = {
	shutdownColor: "#000000", LightingMode: "Canvas", forcedColor: "#009bde",
	PumpMac: "e7:f5:f3:e5:66:e1", PumpRxSlot: "2", FansMac: "81:0c:73:e5:66:e1", FansRxSlot: "1",
	FanCount: "3", LedsPerFan: "26", RingRotation: "0", RingReverse: false, UpdateRate: "15",
	WirelessChannel: "Auto", DeviceChannel: "39",
	ScreenMode: "CPU/GPU Sensors", ScreenTheme: "3", ScreenBrightness: "70", ScreenRotation: "90°", ScreenCycle: "4",
	ScreenLabelColor: "#ffffff", ScreenValueColor: "#ff0000", ScreenUnitColor: "#00ff00",
	PumpSpeed: "3200 rpm (max)", PumpHead: "LCD-S (square)",
};
const tx = load("LianLi_HydroShift_II_Wireless.js", txDev, params);
const rx = load("LianLi_Wireless_RX_Finder.js", rxDev, {});
tx.api.Initialize();
rx.api.Initialize();
ok(ports[51870], "TX plugin bound UDP 51870");

const helper = udp.createSocket();
function step(ms, sensor) {
	for (let t = 0; t < ms; t += 50) {
		now += 50;
		if (sensor && t % 1000 === 0) helper.write(JSON.stringify(sensor), "127.0.0.1", 51870);
		rx.api.Render(); deliver(); tx.api.Render(); deliver();
	}
}
const reading = { cpu_temp: 47.9, cpu_load: 23.4, gpu_temp: 41, gpu_load: 6, source: "test" };
step(6000, reading);

ok(aio.theme, "theme switch frame reached the AIO");
const th = aio.themeFrame;
ok(th && th.ch === 39 && th.rx === 2, "theme switch on device channel 39, rx slot 2");
ok(th && th.data[14] === 2 && th.data[15] === 8 && th.data[16] === 1, "theme frame: rx 2, master channel 8, slot index 1");
ok(th && th.data[17] === real[44] + 1, `theme sequence = device seq + 1 (${real[44] + 1})`);
ok(txLogs.some((l) => l.includes("LCD switched to the sensor theme")), "TX saw the acknowledgement through the Finder");
const nSwitch = frames.filter((f) => f.data[1] === 0x19).length;
ok(nSwitch === 1, `theme switch sent once after the ack (${nSwitch})`);
ok(aio.params.length >= 5 && aio.params.length <= 7, `params once a second (${aio.params.length} in 6 s)`);
const last = aio.params[aio.params.length - 1].data.slice(18, 50);
const want = L.llBuildAioParam({ cpuTemp: 47.9, cpuLoad: 23.4, gpuTemp: 41, gpuLoad: 6, loopInterval: 4, labelColor: [255, 255, 255],
	valueColor: [255, 0, 0], unitColor: [0, 255, 0], brightness: 70, theme: 2, pumpRpm: 3200, pumpShape: "square", rotation: 1 });
ok(JSON.stringify(last) === JSON.stringify(want), "params carry helper values + LCD settings");
ok(last[0] === 47 && last[1] === 23 && last[2] === 41 && last[3] === 6 && last[8] && last[9] && last[10] && last[11], "CPU 47°C 23% GPU 41°C 6%, all enabled");
ok(last[28] === 0 && last[29] === 0, "pump timer 0 = 3200 rpm (unchanged)");
ok(!txMsgs.ll_pump, "no pump warning");

// helper stops -> values disabled after 5 s
step(7000, null);
const stale = aio.params[aio.params.length - 1].data.slice(18, 50);
ok(stale[8] === 0 && stale[9] === 0 && stale[10] === 0 && stale[11] === 0, "stale helper -> sensors marked unavailable");

// pump watchdog
params.PumpSpeed = "1600 rpm";
tx.ctx.PumpSpeed = "1600 rpm";
step(8000, reading);
ok(aio.rpm === 0, `fake pump stalled (${aio.rpm} rpm)`);
ok(txMsgs.ll_pump, "pump RPM warning shown");
ok(txLogs.some((l) => l.includes("WARNING: pump reports 0 rpm")), "pump warning logged");
tx.ctx.PumpSpeed = "3200 rpm (max)";
step(4000, reading);
ok(aio.rpm === 3180 && !txMsgs.ll_pump, "pump back to 3180 rpm, warning cleared");

// Pick what each LCD spot shows: any source in any spot, Off clears the enable flag
tx.ctx.ScreenValue1 = "Coolant Temperature";
tx.ctx.ScreenValue2 = "Pump Speed (%)";
tx.ctx.ScreenValue3 = "Off";
tx.ctx.ScreenValue4 = "CPU Temperature";
step(2000, reading);
const picked = aio.params[aio.params.length - 1].data.slice(18, 50);
ok(picked[0] === real[4 + 27] && picked[8] === 1, `spot 1 = coolant ${real[4 + 27]} °C (${picked[0]})`);
ok(picked[1] === Math.round(3180 * 100 / 3200) && picked[9] === 1, `spot 2 = pump % (${picked[1]})`);
ok(picked[2] === 0 && picked[10] === 0, "spot 3 off");
ok(picked[3] === 47 && picked[11] === 1, "spot 4 = CPU temperature");
tx.ctx.ScreenValue1 = "CPU Temperature";
tx.ctx.ScreenValue2 = "CPU Load";
tx.ctx.ScreenValue3 = "GPU Temperature";
tx.ctx.ScreenValue4 = "GPU Load";
step(2000, reading);
const all = aio.params[aio.params.length - 1].data.slice(18, 50);
ok(all[0] === 47 && all[1] === 23 && all[2] === 41 && all[3] === 6 && all[8] && all[9] && all[10] && all[11], "defaults back");

// Screen off -> no more LCD traffic
tx.ctx.ScreenMode = "Off (don't touch)";
tx.ctx.onScreenModeChanged && tx.ctx.onScreenModeChanged();
const before = aio.params.length;
step(3000, reading);
ok(aio.params.length === before, "LCD Off: nothing sent to the screen");

// LED lighting still flows next to the LCD traffic
ok(frames.some((f) => f.data[1] === 0x20), "RGB frames still sent");
tx.api.Shutdown(false);
ok(!ports[51870], "UDP port released on shutdown");
console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
