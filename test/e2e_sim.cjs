// End-to-end simulation of both plugins against a fake L-Wireless dongle,
// using the user's real device IDs (pump + TL fans on channel 39, master on 8).
const fs=require('fs'),vm=require('vm'),cp=require('child_process');
const T=__dirname,P=T+'/../';
function load(file,device,params){const src=fs.readFileSync(P+file,'utf8').replace(/^import udp from "@SignalRGB\/udp";$/m,"const udp={createSocket(){return {on(){},bind(){},write(){},close(){}};}};").replace(/^export /gm,'');const ctx=vm.createContext({device,console,Date,Math,JSON,...params});vm.runInContext(src+'\n;this.__api={Initialize,Render,Shutdown,LedNames,LedPositions,Validate};',ctx);return ctx.__api;}
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}else console.log('ok  ',m);};
const MASTER=[0xe6,0xd8,0x71,0xe5,0x66,0xe4],PUMP=[0xe7,0xf5,0xf3,0xe5,0x66,0xe1],FANS=[0x81,0x0c,0x73,0xe5,0x66,0xe1];
const writes=[];let pendingIn=[];const logs=[];const msgs={};
const pkt=a=>({length:a.length,data:a});
const tx={bulk_transfer(ep,data,len){if(ep<0x80){writes.push(data.slice());if(data[0]===0x11&&data[1]===8){const r=new Array(64).fill(0);r[0]=0x11;MASTER.forEach((b,i)=>r[1+i]=b);r[9]=0x10;r[12]=42;pendingIn.push(r);}return {length:64};}
  if(!data||data.length<len) return {length:-1};return pendingIn.length?pkt(pendingIn.shift()):{length:-1};},
  pause(){},log(m){logs.push(String(m));},color(x,y){return [(x*5)&255,(y*20)&255,(x*y)&255];},
  addMessage(id,t){msgs[id]=t;},removeMessage(id){delete msgs[id];},setControllableLeds(){},setSize(){}};
const params={shutdownColor:'#102030',LightingMode:'Canvas',forcedColor:'#009bde',PumpMac:'e7:f5:f3:e5:66:e1',PumpRxSlot:'2',FansMac:'81:0c:73:e5:66:e1',FansRxSlot:'1',FanCount:'3',LedsPerFan:'26',RingRotation:'0',RingReverse:false,UpdateRate:'10',WirelessChannel:'Auto',DeviceChannel:'39',ScreenMode:'Off (don\'t touch)'};
const api=load('LianLi_HydroShift_II_Wireless.js',tx,params);
ok(api.LedNames().length===102,'102 LEDs (24 pump + 3x26 TL)');
api.Initialize();
ok(logs.some(l=>l.includes('master e6:d8:71:e5:66:e4 on channel 8')),'TX master found on channel 8');
writes.length=0;api.Render();
function frames(ws){const out=[];let cur=null;for(const w of ws){if(w[0]!==0x10)continue;if(w[1]===0)cur={ch:w[2],rx:w[3],data:[]};cur.data.push(...w.slice(4,64));if(w[1]===3){out.push(cur);cur=null;}}return out;}
const fr=frames(writes);
ok(fr[0].data[1]===0x14&&fr[0].ch===8&&fr[0].rx===0xff,'heartbeat broadcast on master channel 8');
function uploadsFor(mac){const f=fr.filter(x=>x.data[1]===0x20&&mac.every((b,i)=>x.data[2+i]===b));return f;}
function decode(f,n){const h=f[0].data;const len=(h[20]<<24)|(h[21]<<16)|(h[22]<<8)|h[23];let c=[];for(const d of f.filter(x=>x.data[18]>0))c.push(...d.data.slice(20,20+Math.min(220,len-c.length)));fs.writeFileSync(T+'/sim.bin',Buffer.from(c));return [...cp.execFileSync(T+'/tools/tuzdec',[T+'/sim.bin',String(n*3)])];}
const pos=api.LedPositions();
const pu=uploadsFor(PUMP),fa=uploadsFor(FANS);
ok(pu.length>=3&&pu.every(f=>f.ch===39&&f.rx===2),'pump frames on ch 39, rx slot 2');
ok(pu[0].data[27]===24,'pump header: 24 LEDs');
ok(fa.length>=3&&fa.every(f=>f.ch===39&&f.rx===1),'fan frames on ch 39, rx slot 1');
ok(fa[0].data[27]===78,'fan header: 78 LEDs');
const pr=decode(pu,24),fr2=decode(fa,78);let m=true;
for(let i=0;i<24;i++){const c=tx.color(...pos[i]);if(pr[i*3]!==c[0]||pr[i*3+1]!==c[1]||pr[i*3+2]!==c[2])m=false;}
for(let i=0;i<78;i++){const c=tx.color(...pos[24+i]);if(fr2[i*3]!==c[0]||fr2[i*3+1]!==c[1]||fr2[i*3+2]!==c[2])m=false;}
ok(m,'official decoder: pump + fan payloads equal canvas colours (102 LEDs)');
// RX finder on the real captured reply
const real=fs.readFileSync(T+'/real_reply.cjs','utf8').match(/`([^`]+)`/)[1].split(/\s+/).map(h=>parseInt(h,16));
let rxIn=[];const rxMsgs={},rxLogs=[];
const rx={bulk_transfer(ep,data,len){if(ep<0x80){if(data[0]===0x10)rxIn=[real.slice(0,64),real.slice(64,128),real.slice(128,192)];return {length:64};}return rxIn.length?pkt(rxIn.shift()):{length:-1};},pause(){},log(m){rxLogs.push(String(m));},addMessage(id,t,tip){rxMsgs[id]=t+' :: '+tip;},removeMessage(id){delete rxMsgs[id];}};
load('LianLi_Wireless_RX_Finder.js',rx,{}).Initialize();
console.log(rxLogs.map(l=>'     '+l).join('\n'));
const J=rxLogs.join('\n');ok(J.includes('Pump MAC ........... e7:f5:f3:e5:66:e1')&&J.includes('Pump RX Slot ....... 2'),'finder: pump values');
ok(J.includes('Fans MAC ........... 81:0c:73:e5:66:e1')&&J.includes('Fans RX Slot ....... 1')&&J.includes('Fan Count .......... 3')&&J.includes('LEDs per Fan ....... 26')&&J.includes('Device Channel ..... 39'),'finder: fan values + channel');
console.log(fail?`\n${fail} FAILED`:'\nALL PASSED');process.exit(fail?1:0);
