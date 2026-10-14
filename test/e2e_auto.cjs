// Auto setup + stored hardware effects, end to end: TX plugin with every
// setting left at its default, RX Finder on a mock UDP bus, a fake dongle that
// remembers the effect each device was given (as the real hardware reports it).
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
};
// A device takes a new effect once every packet of an upload arrived.
function onFrame(f) {
	const d = f.data;
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

const tx = load("LianLi_HydroShift_II_Wireless.js", txDev, {});
const rx = load("LianLi_Wireless_RX_Finder.js", rxDev, {});
ok(tx.ctx.PumpMac === "00:00:00:00:00:00" && tx.ctx.FanCount === "Auto" && tx.ctx.PumpRxSlot === "Broadcast", "every device setting left at its default");
tx.api.Initialize();
rx.api.Initialize();
function step(ms) { for (let t = 0; t < ms; t += 50) { now += 50; rx.api.Render(); deliver(); tx.api.Render(); deliver(); } }
step(3000);

ok(txLogs.some((l) => l.includes("Auto setup: pump e7:f5:f3:e5:66:e1, fans 81:0c:73:e5:66:e1 (3x UNI FAN TL Wireless, 26 LEDs each)")), "auto setup finds pump + 3 TL fans");
ok(tx.api.LedNames().length === 24 + 78, `layout rebuilt to 102 LEDs (${tx.api.LedNames().length})`);
const rgb = (mac) => frames.filter((f) => f.data[1] === 0x20 && mac.every((b, i) => f.data[2 + i] === b));
const lastP = rgb(PUMP).filter((f) => f.data[18] === 0).pop(), lastF = rgb(FANS).filter((f) => f.data[18] === 0).pop();
ok(lastP && lastP.rx === 2 && lastP.ch === 39, "pump colours go to RX slot 2 on channel 39 (from the Finder)");
ok(lastF && lastF.rx === 1 && lastF.ch === 39 && lastF.data[27] === 78, "fan colours go to RX slot 1, 78 LEDs");

// pump misses a few GetDev replies -> nothing flips
const autoLogs = txLogs.filter((l) => l.includes("Auto setup:")).length;
const blocks = rxLogs.filter((l) => l.includes("FOUND ON THIS DONGLE")).length;
hidePump = true;
const before = rgb(PUMP).length;
step(4000);
hidePump = false;
step(2000);
ok(txLogs.filter((l) => l.includes("Auto setup:")).length === autoLogs, "pump missing from a few replies: auto setup unchanged");
ok(rgb(PUMP).length > before, "pump keeps getting colours meanwhile");
ok(rxLogs.filter((l) => l.includes("FOUND ON THIS DONGLE")).length === blocks, "Finder does not reprint its block");

// hardware effect: uploaded, confirmed through the Finder's effect index
tx.ctx.LightingMode = "Hardware Effect";
tx.ctx.HwEffect = "Rainbow Wave";
step(4000);
ok(txLogs.some((l) => l.includes("Hardware effect Rainbow Wave -> pump")) && txLogs.some((l) => l.includes("Hardware effect Rainbow Wave -> fans")), "Rainbow Wave uploaded to pump and fans");
ok(txLogs.filter((l) => l.includes("is playing on the")).length === 2, "both confirmed by the RX Finder");
const n = frames.length;
step(5000);
ok(frames.filter((f, i) => i >= n && f.data[1] === 0x20).length === 0, "no colour traffic while the stored effect plays");

// a lost upload is repeated
dropUploads.fans = 1;
tx.ctx.HwEffect = "Breathing";
step(12000);
ok(txLogs.some((l) => l.includes("fans has not confirmed the hardware effect yet")), "missing confirmation -> sent again");
ok(txLogs.filter((l) => l.includes("is playing on the fans")).length === 2, "fans confirm after the resend");

// device stops playing it (power cycle) -> uploaded again
fx.pump = [1, 2, 3, 4];
step(10000);
ok(txLogs.some((l) => l.includes("pump is no longer playing the hardware effect")), "pump lost the effect -> re-uploaded");
ok(L.llHex(fx.pump) !== "01 02 03 04", "pump playing it again");

// Canvas Loop: records 4 s of the canvas, then stores it
tx.ctx.HwEffect = "Canvas Loop";
step(6000);
ok(txLogs.some((l) => l.includes("Recording 4 seconds")) && txLogs.some((l) => l.includes("Hardware effect Canvas Loop -> fans")), "Canvas Loop recorded and stored");

// SignalRGB closes with "When SignalRGB Closes" = Hardware Effect
tx.ctx.OnExit = "Hardware Effect";
tx.api.Shutdown(false);
ok(txLogs.some((l) => l.includes("SignalRGB is closing")), "exit keeps the stored effect running");

// every built-in effect decodes with the official tinyuz decoder to frames x LEDs x RGB
const cp = require("child_process"), os = require("os"), path = require("path");
const lay = L.llBuildLayout(3, 26, 0, false);
const tmp = path.join(os.tmpdir(), "ll_fx.bin");
for (const name of L.LL_HW_EFFECTS.filter((x) => x !== "Canvas Loop")) {
	const u = L.llEffectUpload(name, lay.meta.slice(24), 5, [0, 155, 222]);
	fs.writeFileSync(tmp, Buffer.from(u.upload.compressed));
	const out = cp.execFileSync(__dirname + "/tools/tuzdec", [tmp, String(u.frames * 78 * 3)]);
	ok(out.length === u.frames * 78 * 3 && u.upload.frameCount === u.frames, `${name}: ${u.frames} frames, ${u.upload.compressed.length} bytes, decodes to ${out.length} bytes`);
}

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
