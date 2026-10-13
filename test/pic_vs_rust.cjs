// RF_SEND_PIC frames vs lian-li-linux opcodes.rs test vectors (picture_packets_*).
const L = require("../src/core.cjs");
let fail = 0, checked = 0;
const ok = (c, m) => { checked++; if (!c) { fail++; console.log("FAIL", m); } };
const mac = [1, 2, 3, 4, 5, 6], master = [9, 9, 9, 9, 9, 9];
const rf = L.llPicFrame(mac, master, 2, 8, 7, 93, new Array(20).fill(0xab));
ok(JSON.stringify(rf.slice(0, 19)) === JSON.stringify([0x12, 0x22, 1, 2, 3, 4, 5, 6, 9, 9, 9, 9, 9, 9, 2, 8, 0, 7, 93]), "header bytes");
ok(rf.slice(19, 39).every((b) => b === 0xab) && rf.slice(39).every((b) => b === 0) && rf.length === 240, "data then zero padding");
const usb = L.llRfToUsbPackets(rf, 12, 2);
ok(usb.every((p, i) => p[0] === 0x10 && p[1] === i && p[2] === 12 && p[3] === 2), "USB packets routed to device channel 12, rx 2");
const term = L.llPicFrame(mac, master, 2, 8, 8, 255, [0x50, 0x00]);
ok(L.llRfToUsbPackets(term, 12, 2)[0].slice(22, 25).join() === "255,80,0", "terminator carries 20480 big-endian");
let threw = false; try { L.llPicFrame(mac, master, 2, 8, 1, 1, new Array(221).fill(0)); } catch (e) { threw = true; }
ok(threw, "221-byte chunk rejected");
const jpeg = Array.from({ length: 17137 }, (_, i) => (i * 7) & 255);
const chunks = L.llPicChunks(jpeg);
ok(chunks.length === 78 + 1 && chunks[77].data.length === 17137 - 77 * 220 && chunks[78].index === 255 && chunks[78].data.join() === [17137 >> 8, 17137 & 255].join(), "17137-byte JPEG -> 77 full chunks + 197-byte tail + terminator");
for (const bad of [0, 20481]) { let t = false; try { L.llPicChunks(new Array(bad).fill(1)); } catch (e) { t = true; } ok(t, `size ${bad} rejected`); }
ok(L.llPicChunks(new Array(20480).fill(1)).length === 94 + 1, "20480 bytes accepted (94 chunks + terminator)");
const b = Array.from({ length: 220 }, (_, i) => (i * 37 + 5) & 255);
ok(JSON.stringify(L.llFromBase64(L.llToBase64(b))) === JSON.stringify(b) && L.llToBase64([1, 2]) === Buffer.from([1, 2]).toString("base64"), "base64 round trip (matches Node)");
console.log("pic checks", checked, "failures", fail);
process.exit(fail ? 1 : 0);
