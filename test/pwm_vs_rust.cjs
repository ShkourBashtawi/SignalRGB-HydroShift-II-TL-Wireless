// Fan PWM packets vs lian-li-linux (prepare_pwm + build_pwm_packet), dumped from Rust.
const fs = require("fs");
const L = require("../src/core.cjs");
const hex = (a) => Buffer.from(a).toString("hex");
let fail = 0, checked = 0;
const master = [0xe6, 0xd8, 0x71, 0xe5, 0x66, 0xe4];
const mac = [0x81, 0x0c, 0x73, 0xe5, 0x66, 0xe1];
for (const line of fs.readFileSync(__dirname + "/reference/pwm_reference.txt", "utf8").trim().split("\n")) {
	const [, dt, fc, ft, pwmHex, want] = line.split(" ");
	const rec = [...new Array(42).fill(0)];
	mac.forEach((b, i) => rec[i] = b); master.forEach((b, i) => rec[6 + i] = b);
	rec[12] = 39; rec[13] = 1; rec[18] = +dt; rec[19] = +fc; rec[24] = +ft; rec[41] = 0x1c;
	const r = L.llParseDeviceRecord(rec);
	const pwm = L.llPreparePwm([...Buffer.from(pwmHex, "hex")], r);
	const got = hex(L.llPwmFrame(r.mac, master, r.rxType, 8, 2, pwm));
	checked++;
	if (got !== want) { fail++; console.log("MISMATCH", line.slice(0, 40), "\n got", got.slice(0, 44), "\nwant", want.slice(0, 44)); }
}
const ok = (c, m) => { checked++; if (!c) { fail++; console.log("FAIL", m); } };
ok(L.llPumpRpmFromLevel(0, "square") === 1600 && L.llPumpRpmFromLevel(1, "square") === 3200 && L.llPumpRpmFromLevel(0.5, "circle") === 2050, "pump level mapping");
ok(L.llPumpRpmFromLevel(undefined, "square") === 3200, "missing level -> max (safe)");
console.log("pwm checks", checked, "failures", fail);
process.exit(fail ? 1 : 0);
