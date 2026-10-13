// End-to-end simulation of both plugins against a fake L-Wireless dongle.
const fs=require('fs'),vm=require('vm'),cp=require('child_process');
const T=__dirname, P=T+'/../plugin/';
function load(file,device,params){
  const src=fs.readFileSync(P+file,'utf8').replace(/^export /gm,'');
  const ctx=vm.createContext({device,console,Date,Math,...params});
  vm.runInContext(src+'\n;this.__api={Initialize,Render,Shutdown,LedNames,LedPositions,Size,Validate,ControllableParameters,'+(file.includes('RX')?'':'onAioMacChanged')+'};',ctx);
  return ctx;
}
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}else console.log('ok  ',m);};
// ---------------- TX plugin ----------------
const MASTER=[0xda,0x82,0x10,0x7a,0x4e,0xe0], AIO=[0x3c,0x11,0x22,0x33,0x44,0x55];
const writes=[];let pendingIn=[];let messages={};const logs=[];
const tx={
  bulk_transfer(ep,data,len,timeout){
    if(ep<0x80){writes.push(data.slice());
      if(data[0]===0x11){ if(data[1]===8){const r=new Array(64).fill(0);r[0]=0x11;MASTER.forEach((b,i)=>r[1+i]=b);r[7]=0;r[8]=0;r[9]=0x10;r[10]=0x00;r[11]=0;r[12]=42;pendingIn.push(r);} }
      return [];}
    return pendingIn.length?pendingIn.shift():[];
  },
  pause(){}, log(m){logs.push(String(m));},
  color(x,y){return [ (x*5)&255, (y*20)&255, (x*y)&255 ];},
  addMessage(id,t){messages[id]=t;}, removeMessage(id){delete messages[id];},
  setControllableLeds(){}, setSize(){},
};
const params={shutdownColor:'#102030',LightingMode:'Canvas',forcedColor:'#009bde',AioMac:'3c:11:22:33:44:55',RxSlot:'5',FanCount:'3',RingRotation:'0',RingReverse:false,UpdateRate:'10',WirelessChannel:'Auto'};
const ctx=load('LianLi_HydroShift_II_Wireless.js',tx,params);const api=ctx.__api;
ok(api.LedNames().length===96,'96 LEDs (pump + 3 fans)');
ok(api.Validate({interface:0})&&!api.Validate({interface:1}),'Validate claims interface 0 only');
api.Initialize();
ok(logs.some(l=>l.includes('channel 8')),'master found on channel 8: '+logs.find(l=>l.includes('Wireless master')));
writes.length=0; api.Render();
// reassemble RF frames from USB packets
function frames(ws){const out=[];let cur=null;for(const w of ws){if(w[0]!==0x10)continue;if(w[1]===0)cur={ch:w[2],rx:w[3],data:[]};cur.data.push(...w.slice(4,64));if(w[1]===3){out.push(cur);cur=null;}}return out;}
let fr=frames(writes);
ok(fr[0]&&fr[0].data[1]===0x14&&fr[0].rx===0xff&&fr[0].ch===8,'first frame is the 1 s clock heartbeat, broadcast on ch 8');
const rgb=fr.filter(f=>f.data[1]===0x20);
ok(rgb.length>=3,'RGB upload sent ('+rgb.length+' RF frames)');
ok(rgb.every(f=>f.rx===5&&f.ch===8),'RGB frames addressed to RX slot 5 on ch 8');
const h=rgb[0].data; ok(rgb[1].data.every((b,i)=>b===h[i]),'header repeated twice like the reference');
ok(AIO.every((b,i)=>h[2+i]===b)&&MASTER.every((b,i)=>h[8+i]===b),'target AIO MAC + master MAC in header');
ok(h[27]===96&&((h[25]<<8)|h[26])===1,'header: 96 LEDs, 1 frame');
const clen=(h[20]<<24)|(h[21]<<16)|(h[22]<<8)|h[23];const npk=h[19];
ok(rgb.length===npk+1,'packet count matches header ('+npk+')');
let comp=[];for(let i=1;i<npk;i++){const d=rgb[i+1].data;ok(d[18]===i,'data packet index '+i);comp.push(...d.slice(20,20+Math.min(220,clen-comp.length)));}
fs.writeFileSync(T+'/sim.bin',Buffer.from(comp));
const raw=cp.execFileSync(T+'/tuzdec',[T+'/sim.bin','288']);
const names=api.LedNames(),pos=api.LedPositions();let match=true;
for(let i=0;i<96;i++){const [x,y]=pos[i];const c=tx.color(x,y);if(raw[i*3]!==c[0]||raw[i*3+1]!==c[1]||raw[i*3+2]!==c[2])match=false;}
ok(match,'decoded firmware payload == canvas colours for all 96 LEDs (official decoder)');
ok(names[0].startsWith('Pump')&&names[24].startsWith('Fan 1'),'firmware order: pump ring first, then fans');
// no resend when nothing changed and inside refresh window
writes.length=0; api.Render(); ok(frames(writes).filter(f=>f.data[1]===0x20).length===0,'no duplicate upload when colours unchanged');
// shutdown colour
writes.length=0; api.Shutdown(false); fr=frames(writes).filter(f=>f.data[1]===0x20);
let c2=[];const h2=fr[0].data;const l2=(h2[20]<<24)|(h2[21]<<16)|(h2[22]<<8)|h2[23];for(let i=2;i<fr.length;i++)c2.push(...fr[i].data.slice(20,20+Math.min(220,l2-c2.length)));
fs.writeFileSync(T+'/sim2.bin',Buffer.from(c2));const raw2=cp.execFileSync(T+'/tuzdec',[T+'/sim2.bin','288']);
ok([...raw2].every((b,i)=>b===[0x10,0x20,0x30][i%3]),'shutdown sends the shutdown colour');
// missing MAC -> no RGB, warning message
const ctx2=load('LianLi_HydroShift_II_Wireless.js',{...tx,addMessage(id,t){messages[id]=t;}},{...params,AioMac:'00:00:00:00:00:00'});
writes.length=0;ctx2.__api.Initialize();ctx2.__api.Render();
ok(frames(writes).every(f=>f.data[1]!==0x20)&&messages.ll_mac,'without a MAC: heartbeat only + message "'+messages.ll_mac+'"');
// ---------------- RX finder ----------------
const rec=new Array(42).fill(0);AIO.forEach((b,i)=>rec[i]=b);MASTER.forEach((b,i)=>rec[6+i]=b);rec[12]=8;rec[13]=5;rec[18]=11;rec[19]=3;rec[27]=31;rec[28]=0x03;rec[29]=0xe8;rec[34]=0x0a;rec[35]=0x28;rec[41]=0x1c;
const mrec=new Array(42).fill(0);MASTER.forEach((b,i)=>mrec[i]=b);mrec[12]=8;mrec[18]=0xff;mrec[41]=0x1c;
const resp=[0x10,2,0x80,0].concat(mrec,rec);
const rxMsgs={};let rxIn=[];
const rx={bulk_transfer(ep,data){if(ep<0x80){if(data[0]===0x10)rxIn=[resp.slice(0,64),resp.slice(64)];return [];}return rxIn.length?rxIn.shift():[];},pause(){},log(){},addMessage(id,t,tip){rxMsgs[id]=t+' :: '+tip;},removeMessage(id){delete rxMsgs[id];}};
const r=load('LianLi_Wireless_RX_Finder.js',rx,{});r.__api.Initialize();
const m=Object.values(rxMsgs).join('\n');console.log('     RX message:',m);
ok(m.includes('3c:11:22:33:44:55')&&m.includes('LCD-S')&&m.includes('RX slot 5')&&m.includes('pump 2600 RPM')&&m.includes('31 °C'),'finder shows MAC, slot, pump RPM and coolant');
console.log(fail?`\n${fail} FAILED`:'\nALL PASSED');process.exit(fail?1:0);
