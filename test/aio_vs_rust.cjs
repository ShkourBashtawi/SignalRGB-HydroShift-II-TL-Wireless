// LCD / pump protocol checks against values dumped from lian-li-linux (Rust).
const fs = require("fs");
const L = require("../src/core.cjs");
const hex = (a) => Buffer.from(a).toString("hex");
let fail = 0, checked = 0;
const ok = (cond, msg) => { checked++; if (!cond) { fail++; console.log("FAIL", msg); } };

const lines = fs.readFileSync(__dirname + "/reference/aio_reference.txt", "utf8").trim().split("\n");
const master = [0xe6, 0xd8, 0x71, 0xe5, 0x66, 0xe4];
const pump = [0xe7, 0xf5, 0xf3, 0xe5, 0x66, 0xe1];
for (const line of lines) {
	const [tag, a, b, c] = line.split(" ");
	if (tag === "SQ") ok(L.llSquarePumpTimer(+a) === +b, `square ${a}: ${L.llSquarePumpTimer(+a)} != ${b}`);
	if (tag === "CI") ok(L.llCirclePumpTimer(+a) === +b, `circle ${a}: ${L.llCirclePumpTimer(+a)} != ${b}`);
	if (tag === "THEME") ok(hex(L.llThemeSwitchFrame(pump, master, 2, 8, +a, +b)) === c, `theme slot ${a} seq ${b}`);
	if (tag === "SEQ") ok(L.llNextSequence(+a < 0 ? null : +a, +b) === +c, `seq ${a} ${b}`);
}

// aio_param layout (daemon build_aio_param) and RF_AIO_PARAMS frame (set_aio_params).
const p = L.llBuildAioParam({
	cpuTemp: 51.6, cpuLoad: 120, gpuTemp: null, gpuLoad: 7,
	loopInterval: 3, labelColor: [1, 2, 3], valueColor: [255, 0, 0], unitColor: [9, 8, 7],
	brightness: 80, theme: 4, pumpRpm: 3200, pumpShape: "square", rotation: 2,
});
const want = new Array(32).fill(0);
Object.assign(want, { 0: 51, 1: 99, 2: 0, 3: 7, 6: 3, 7: 1, 8: 1, 9: 1, 10: 0, 11: 1,
	13: 255, 14: 1, 15: 2, 16: 3, 17: 255, 18: 255, 19: 0, 20: 0, 21: 255, 22: 9, 23: 8, 24: 7,
	25: 80, 26: 1, 27: 4, 28: 0, 29: 0, 30: 2 });
ok(hex(p) === hex(want), `aio_param layout\n got ${hex(p)}\nwant ${hex(want)}`);
const p2 = L.llBuildAioParam({ pumpRpm: 2100, pumpShape: "square", theme: 99, brightness: 150, rotation: 7 });
ok(p2[28] === (1100 >> 8) && p2[29] === (1100 & 255), "pump timer big-endian");
ok(p2[27] === 12 && p2[25] === 100 && p2[30] === 3, "clamps theme/brightness/rotation");
ok(p2[8] + p2[9] + p2[10] + p2[11] === 0, "no sensors -> all disabled");
const f = L.llAioParamsFrame(pump, master, 2, 8, 1, p);
ok(f.length === 240 && f[0] === 0x12 && f[1] === 0x21 && f[14] === 2 && f[15] === 8 && f[16] === 1 && f[17] === 0, "params header");
ok(hex(f.slice(2, 14)) === hex(pump.concat(master)), "params macs");
ok(hex(f.slice(18, 50)) === hex(p) && f.slice(50).every((b) => b === 0), "params body");

// slot index (controller next_slot_index)
const rec = (mac, m, type) => ({ mac, masterMac: m, isMaster: type === 0xff });
const other = [1, 1, 1, 1, 1, 1];
const fans = [0x81, 0x0c, 0x73, 0xe5, 0x66, 0xe1];
const list = [rec(master, master, 0xff), rec(pump, master, 11), rec([5, 5, 5, 5, 5, 5], other, 0), rec(fans, master, 0)];
ok(L.llSlotIndex(list, pump, master) === 1, "pump slot 1");
ok(L.llSlotIndex(list, fans, master) === 2, "fans slot 2 (foreign device skipped)");

// sensor message parsing
const s = L.llParseSensorMessage('{"cpu_temp":48.5,"cpu_load":12,"gpu_temp":null,"gpu_load":-1,"source":"LHM"}');
ok(s && s.cpuTemp === 48.5 && s.cpuLoad === 12 && s.gpuTemp === null && s.gpuLoad === null && s.source === "LHM", "sensor json");
ok(L.llParseSensorMessage("garbage") === null, "bad json");

console.log("aio checks", checked, "failures", fail);
process.exit(fail ? 1 : 0);
