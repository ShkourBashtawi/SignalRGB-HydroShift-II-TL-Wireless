// End-to-end Fan & Pump Control simulation: SignalRGB fan-control API mock,
// TX plugin + RX Finder on a mock UDP bus, fake fans that adopt the PWM they get.
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
const FANS = [0x81, 0x0c, 0x73, 0xe5, 0x66, 0xe1];
const fans = { pwm: real.slice(46 + 36, 46 + 40), frames: [], ch: real[46 + 12], lost: 0 };
const api = { disabled: false, levels: {}, controls: new Set(), removed: [], rpm: {}, temps: {}, sensors: new Set() };

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
	fanControlDisabled() { return api.disabled; },
	createFanControl(n) { api.controls.add(n); }, removeFanControl(n) { api.controls.delete(n); api.removed.push(n); },
	getNormalizedFanlevel(n) { return api.levels[n]; }, setRPM(n, r) { api.rpm[n] = r; },
	createTemperatureSensor(n) { api.sensors.add(n); }, removeTemperatureSensor(n) { api.sensors.delete(n); }, SetTemperature(n, t) { api.temps[n] = t; },
};
function onFrame(f) {
	const d = f.data;
	if (FANS.every((b, i) => d[2 + i] === b) && f.ch !== fans.ch) { fans.lost++; return; } // not listening on that channel
	if (d[0] === 0x12 && d[1] === 0x10 && FANS.every((b, i) => d[2 + i] === b)) { fans.frames.push(f); fans.pwm = d.slice(17, 21); fans.ch = d[15]; return; }
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
				r[46 + 12] = fans.ch;
				for (let i = 0; i < 4; i++) { r[46 + 36 + i] = fans.pwm[i]; const rpm = i < 3 ? fans.pwm[i] * 10 : 0; r[46 + 28 + 2 * i] = (rpm >> 8) & 0x0f; r[46 + 29 + 2 * i] = rpm & 0xff; }
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
	ScreenMode: "Off (don't touch)", ScreenTheme: "1", ScreenBrightness: "80", ScreenRotation: "0°", ScreenCycle: "3",
	ScreenLabelColor: "#ffffff", ScreenValueColor: "#ffffff", ScreenUnitColor: "#ffffff",
	PumpSpeed: "3200 rpm (max)", PumpHead: "LCD-S (square)", FanControl: "SignalRGB Fan Control",
};
const tx = load("LianLi_HydroShift_II_Wireless.js", txDev, params);
const rx = load("LianLi_Wireless_RX_Finder.js", rxDev, {});
tx.api.Initialize();
rx.api.Initialize();
function step(ms) {
	for (let t = 0; t < ms; t += 50) { now += 50; rx.api.Render(); deliver(); tx.api.Render(); deliver(); }
}
const orig = fans.pwm.slice();
ok(orig.join() === "186,186,186,186", `fans start at the L-Connect duty (${orig.join("/")})`);

api.levels = { Pump: 0.5, "Fan 1": 0.6, "Fan 2": 0.02, "Fan 3": 0 };
step(5000);
ok(["Pump", "Fan 1", "Fan 2", "Fan 3"].every((n) => api.controls.has(n)) && api.sensors.has("Coolant"), "Pump + Fan 1-3 + Coolant created (fan count from the Finder)");
const pf = fans.frames[fans.frames.length - 1];
ok(pf && pf.ch === 8 && pf.rx === 1 && fans.ch === 8, "first PWM moves the fans to the master channel (8), later frames follow them there");
ok(fans.lost <= 4, `at most a few frames lost while the Finder catches up (${fans.lost})`);
const rgbFans = frames.filter((f) => f.data[1] === 0x20 && FANS.every((b, i) => f.data[2 + i] === b));
ok(rgbFans.length && rgbFans[rgbFans.length - 1].ch === 8, "colour frames follow the fans to channel 8");
ok(pf && pf.data[14] === 1 && pf.data[15] === 8 && pf.data[16] === 2, "fan PWM header: rx 1, master channel 8, slot index 2");
ok(fans.pwm.join() === "153,28,0,0", `levels 0.6 / 0.02 / 0 -> PWM 153 / 28 (TL floor 11%) / 0, slot 4 off (${fans.pwm.join("/")})`);
ok(fans.frames.length >= 8 && fans.frames.length <= 12, `PWM keep-alive once a second, sent twice (${fans.frames.length} in 5 s)`);
const p = aio.params[aio.params.length - 1].data.slice(18, 50);
ok(((p[28] << 8) | p[29]) === 800, `pump level 0.5 -> 2400 rpm -> timer 800 (${(p[28] << 8) | p[29]})`);
ok(!frames.some((f) => f.data[1] === 0x19), "LCD Screen Off: no theme switch sent");
ok(p[8] + p[9] + p[10] + p[11] === 0, "LCD Screen Off: params carry no sensor values");
ok(api.rpm["Fan 1"] === 1530 && api.rpm["Fan 2"] === 280 && api.rpm.Pump === aio.rpm, `RPM published to Fan Control (fan1 ${api.rpm["Fan 1"]}, pump ${api.rpm.Pump})`);
ok(api.temps.Coolant === 35, "coolant temperature published");

// level missing -> pump and fans keep their last speed
api.levels = { "Fan 1": undefined };
step(2000);
const p2 = aio.params[aio.params.length - 1].data.slice(18, 50);
ok(((p2[28] << 8) | p2[29]) === 800, `no pump level -> pump keeps 2400 rpm (timer ${(p2[28] << 8) | p2[29]})`);

// a slightly negative level is the curve interpolator, not "stop": hold
api.levels = { Pump: 0.5, "Fan 1": -0.01, "Fan 2": 0.02, "Fan 3": 0 };
step(2000);
ok(fans.pwm[0] === 153, `negative level on Fan 1 -> keeps 153 (${fans.pwm[0]})`);

// PWM 6 means "follow the motherboard" to the fans: never send it
const sm = L.llSmoothPwm([], [6, 6, 5, 7]);
ok(sm.out.join() === "7,7,5,7", `PWM 6 is never sent (${sm.out.join("/")})`);
let hist = [];
for (let i = 0; i < 10; i++) hist = L.llSmoothPwm(hist, [200, 0, 0, 0]).history;
const avg = L.llSmoothPwm(hist, [150, 0, 0, 0]);
ok(avg.out[0] === 195, `small changes are averaged over 10 samples (${avg.out[0]})`);
ok(L.llSmoothPwm(hist, [40, 0, 0, 0]).out[0] === 40, "a big jump resets the average");
ok(fans.pwm.join() === "153,28,0,0", "no fan levels -> fans keep their current duty");

// turn off -> controls removed, fans and pump handed back
tx.ctx.FanControl = "Off (keep current speeds)";
tx.ctx.onFanControlChanged();
const nParams = aio.params.length;
step(5000);
ok(api.controls.size === 0 && api.removed.includes("Pump") && !api.sensors.has("Coolant"), "controls and sensor removed");
ok(fans.pwm.join() === "186,186,186,0", `fans handed back at their original duty (${fans.pwm.join("/")})`);
ok(fans.ch === 39, `fans handed back on their configured channel 39 (${fans.ch})`);
const lostBefore = fans.lost; step(3000);
ok(fans.lost === lostBefore, "colour frames reach the fans on channel 39 again");
const after = fans.frames.length;
step(3000);
ok(fans.frames.length === after, "no more PWM traffic after hand-back");
ok(aio.params.length - nParams === 2 && ((aio.params[aio.params.length - 1].data[46] << 8) | aio.params[aio.params.length - 1].data[47]) === 0, "pump handed back to Pump Speed (3200 rpm), then params stop");

// SignalRGB fan control disabled -> nothing is touched
api.disabled = true;
tx.ctx.FanControl = "SignalRGB Fan Control";
const f0 = fans.frames.length, a0 = aio.params.length;
step(3000);
ok(fans.frames.length === f0 && api.controls.size === 0, "fan control disabled in SignalRGB -> no PWM, no controls");
ok(txLogs.some((l) => l.includes("Fan Control is disabled in SignalRGB")), "explains why in the log");
// Fan Control switched off in SignalRGB while driving -> stop and hand back
api.disabled = false;
api.levels = { Pump: 0.5, "Fan 1": 0.6, "Fan 2": 0.6, "Fan 3": 0.6 };
step(6000);
ok(api.controls.has("Fan 1") && fans.pwm[0] === 153, `re-enabled -> driving again (${fans.pwm.join("/")})`);
api.disabled = true;
api.levels = { Pump: 0, "Fan 1": 0, "Fan 2": 0, "Fan 3": 0 }; // what SignalRGB reports once disabled
step(5000);
ok(api.controls.size === 0, "disabled at runtime -> controls removed");
ok(fans.pwm.join() === "186,186,186,0", `disabled at runtime -> fans handed back, not stopped (${fans.pwm.join("/")})`);
console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
