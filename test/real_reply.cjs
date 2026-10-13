// Parse the exact GetDev reply captured from the user's RX dongle (2026-10-13 16:37).
const L=require('../src/core.cjs');
const hex=`10 03 32 00 e7 f5 f3 e5 66 e1 e6 d8 71 e5 66 e4 27 02 04 f9 f5 12 0b 00 03 58 be 05 00 00 00 23 00 00 00 00 00 00 0c 6c ff ff ff ff 0f 1c 81 0c 73 e5 66 e1 e6 d8 71 e5 66 e4 27 01 04 f9 f9 4d
00 03 03 58 be 06 1c 1c 1c 00 07 62 07 61 07 5f 00 00 ba ba ba ba 02 1c e6 d8 71 e5 66 e4 00 00 00 00 00 00 08 ff ff ff bf 4a ff 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 1c 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00`;
const r=hex.split(/\s+/).map(h=>parseInt(h,16));
const recs=L.llParseGetDev(r);
let fail=0;const ok=(c,m)=>{console.log(c?'ok  ':'FAIL',m);if(!c)fail++;};
const pump=recs.find(x=>x.deviceType===11), fans=recs.find(x=>x.deviceType===0), master=recs.find(x=>x.isMaster);
ok(recs.length===3,'3 records (pump, fans, master)');
ok(pump&&L.llMacToString(pump.mac)==='e7:f5:f3:e5:66:e1'&&pump.rxType===2&&pump.channel===39,'pump e7:f5:f3:e5:66:e1 rx2 ch39');
ok(pump.fanCount===0&&pump.fanRpm[3]===3180&&pump.coolantC===35,'pump: 0 fans, 3180 rpm, 35 C');
ok(fans&&L.llMacToString(fans.mac)==='81:0c:73:e5:66:e1'&&fans.rxType===1&&fans.fanCount===3,'fans 81:0c:73:e5:66:e1 rx1 x3');
ok(L.llFanFamily(fans.fanTypes[0]).name==='UNI FAN TL Wireless'&&L.llFanFamily(fans.fanTypes[0]).leds===26,'fan type 0x1c = TL Wireless, 26 LEDs');
ok(fans.fanRpm.slice(0,3).join('/')==='1890/1889/1887','fan rpm 1890/1889/1887');
ok(master&&L.llMacToString(master.mac)==='e6:d8:71:e5:66:e4'&&master.channel===8,'master e6:d8:71:e5:66:e4 on ch 8 (devices on 39)');
const lay=L.llBuildLayout(3,26,0,false);ok(lay.names.length===24+78&&lay.pumpCount===24&&lay.fanLedCount===78,'layout 24 pump + 78 fan LEDs');
process.exit(fail?1:0);
