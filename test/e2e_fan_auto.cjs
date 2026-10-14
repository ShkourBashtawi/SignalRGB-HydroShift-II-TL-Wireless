// Regression: Fan & Pump Control on at start-up with auto setup (no MACs set).
// Seen on real hardware: control started before auto setup found the fans, no
// "Fan N" entries were created and the fans were sent PWM 0 and stopped.
const fs = require("fs"), vm = require("vm");
const L = require("../src/core.cjs");
const P = __dirname + "/../";
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.log("FAIL", m); } else console.log("ok  ", m); };

let now = 1_800_000_000_000;
class FakeDate extends Date { static now() { return now; } }
const ports = {}, queue = [];
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
	const src = fs.readFileSync(P + file, "utf8").replace(/^import udp from "@SignalRGB\/udp";$/m, "").replace(/^export /gm, "");
	const ctx = vm.createContext({ device, console, Date: FakeDate, Math, JSON, udp, ...require("./param_defaults.cjs")(P + file), ...params });
	vm.runInContext(src + "\n;this.__api={Initialize,Render,Shutdown,LedNames};this.__ctx=this;", ctx);
	return { api: ctx.__api, ctx };
}

const MASTER = [0xe6, 0xd8, 0x71, 0xe5, 0x66, 0xe4], PUMP = [0xe7, 0xf5, 0xf3, 0xe5, 0x66, 0xe1], FANS = [0x81, 0x0c, 0x73, 0xe5, 0x66, 0xe1];
const real = fs.readFileSync(__dirname + "/real_reply.cjs", "utf8").match(/`([^`]+)`/)[1].split(/\s+/).map((h) => parseInt(h, 16));
const fx = { pump: real.slice(4 + 20, 4 + 24), fans: real.slice(46 + 20, 46 + 24) };
const dropUploads = { pump: 0, fans: 0 };
let hidePump = false;

const frames = [], txLogs = [];
let txIn = [], cur = null, part = null;
const txDev = {
	bulk_transfer(ep, data) {
		if (ep < 0x80) {
			if (data[0] === 0x11 && data[1] === 8) { const r = new Array(64).fill(0); r[0] = 0x11; MASTER.forEach((b, i) => r[1 + i] = b); r[9] = 0x10; r[12] = 42; txIn.push(r); }
			if (data[0] === 0x10) {
				if (data[1] === 0) cur = { ch: data[2], rx: data[3], data: [] };
				cur.data.push(...data.slice(4, 64));
				if (data[1] === 3) { frames.push(cur); onFrame(cur); cur = null; }
			}
			return { length: 64 };
		}
		return txIn.length ? { length: 64, data: txIn.shift() } : { length: -1 };
	},
	pause() {}, log(m) { txLogs.push(String(m)); }, color(x, y) { return [(x * 7) & 255, (y * 11) & 255, 128]; },
	addMessage() {}, removeMessage() {}, setControllableLeds() {}, setSize() {}, fanControlDisabled() { return false; },
	createFanControl(n) { api.controls.add(n); }, removeFanControl(n) { api.controls.delete(n); },
	getNormalizedFanlevel(n) { return api.levels[n]; }, setRPM() {}, createTemperatureSensor() {}, removeTemperatureSensor() {}, SetTemperature() {},
};
const api = { controls: new Set(), levels: {} };
const pwmSent = [];
// A device takes a new effect once every packet of an upload arrived.
function onFrame(f) {
	const d = f.data;
	if (d[0] === 0x12 && d[1] === 0x10 && FANS.every((b, i) => d[2 + i] === b)) { pwmSent.push(d.slice(17, 21)); return; }
	if (d[0] !== 0x12 || d[1] !== 0x20) return;
	const who = PUMP.every((b, i) => d[2 + i] === b) ? "pump" : FANS.every((b, i) => d[2 + i] === b) ? "fans" : null;
	if (!who) return;
	const idx = d[18], count = d[19];
	if (idx === 0) { if (!part || part.who !== who || L.llHex(part.fx) !== L.llHex(d.slice(14, 18))) part = { who, fx: d.slice(14, 18), got: new Set() }; return; }
	if (!part || part.who !== who) return;
	part.got.add(idx);
	if (part.got.size === count - 1) {
		if (dropUploads[who] > 0) dropUploads[who]--; else fx[who] = part.fx;
		part = null;
	}
}

let rxIn = [];
const rxLogs = [];
const rxDev = {
	bulk_transfer(ep, data) {
		if (ep < 0x80) {
			if (data[0] === 0x10) {
				let r = real.slice();
				for (let i = 0; i < 4; i++) { r[4 + 20 + i] = fx.pump[i]; r[46 + 20 + i] = fx.fans[i]; }
				if (hidePump) { r = [r[0], r[1] - 1, r[2], r[3], ...r.slice(46, 130)]; while (r.length < 192) r.push(0); }
				rxIn = [r.slice(0, 64), r.slice(64, 128), r.slice(128, 192)];
			}
			return { length: 64 };
		}
		return rxIn.length ? { length: 64, data: rxIn.shift() } : { length: -1 };
	},
	pause() {}, log(m) { rxLogs.push(String(m)); }, addMessage() {}, removeMessage() {},
};

const tx = load("LianLi_HydroShift_II_Wireless.js", txDev, { FanControl: "SignalRGB Fan Control" });
const rx = load("LianLi_Wireless_RX_Finder.js", rxDev, {});
// SignalRGB reports 0 for every control until a curve is applied.
// As on real hardware, the TX plugin starts first; the Finder's device list
// only arrives a second or two later.
tx.api.Initialize();
let rxOn = false;
function step(ms) { for (let t = 0; t < ms; t += 50) { now += 50; if (rxOn) rx.api.Render(); deliver(); tx.api.Render(); deliver(); } }
step(2000);
rx.api.Initialize();
rxOn = true;
step(6000);
ok(["Pump", "Fan 1", "Fan 2", "Fan 3"].every((n) => api.controls.has(n)), `Pump + Fan 1-3 created once auto setup found them (${[...api.controls].join(", ")})`);
ok(pwmSent.length > 0 && pwmSent.every((p) => p.slice(0, 3).every((v) => v > 0)), `fans never sent PWM 0 (${pwmSent.map((p) => p.join("/")).slice(-3).join(" | ")})`);
api.levels = { Pump: 0.5, "Fan 1": 0.5, "Fan 2": 0.5, "Fan 3": 0.5 };
step(15000);
const last = pwmSent[pwmSent.length - 1];
ok(last.slice(0, 3).join() === "128,128,128", `curve 50% -> PWM 128 (${last.join("/")})`);
console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
