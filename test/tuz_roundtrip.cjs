const fs=require('fs'),cp=require('child_process'),path=require('path');
const {tuzCompress}=require('../src/core.cjs');
const T=__dirname; let seed=12345; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const cases=[];
const solid=(n,c)=>{const a=[];for(let i=0;i<n;i++)a.push(...c);return a;};
cases.push(['solid 96', solid(96,[255,0,0])]);
cases.push(['black 96', solid(96,[0,0,0])]);
cases.push(['single byte',[7]]);
cases.push(['two bytes',[7,7]]);
for(let k=0;k<40;k++){const n=1+Math.floor(rnd()*900);const a=[];for(let i=0;i<n;i++)a.push(Math.floor(rnd()*256));cases.push(['random '+n,a]);}
for(let k=0;k<40;k++){const leds=96;const a=[];const h=rnd()*360;for(let i=0;i<leds;i++){const t=(h+i*7.5)%360;a.push(Math.round(127+127*Math.sin(t)),Math.round(127+127*Math.sin(t+2)),Math.round(127+127*Math.sin(t+4)));}cases.push(['rainbow '+k,a]);}
// multi-frame animation (60 frames x 96 leds) - exercises long distances
{const a=[];for(let f=0;f<60;f++)for(let i=0;i<96;i++){const t=(f*6+i*15)%360/57.3;a.push(Math.round(127+127*Math.sin(t))&255,Math.round(127+127*Math.sin(t+2))&255,Math.round(127+127*Math.sin(t+4))&255);}cases.push(['anim 60x96',a]);}
// low-entropy random palette over large input -> far matches > 2687
{const pal=[[1,2,3],[200,10,40],[5,5,5],[9,99,199]];const a=[];for(let i=0;i<6000;i++){a.push(...pal[Math.floor(rnd()*4)]);}cases.push(['palette 18000',a]);}
let fail=0,ourTot=0,refTot=0;
for(const [name,data] of cases){
  const c=tuzCompress(data);
  fs.writeFileSync(T+'/c.bin',Buffer.from(c)); fs.writeFileSync(T+'/d.bin',Buffer.from(data));
  for(const dec of ['tuzdec','tuzdec_nolit']){
    let out;try{out=cp.execFileSync(T+'/tools/'+dec,[T+'/c.bin',String(data.length)]);}catch(e){console.log('FAIL decode',dec,name,e.stderr+'');fail++;continue;}
    if(Buffer.compare(out,Buffer.from(data))!==0){console.log('FAIL mismatch',dec,name);fail++;}
  }
  const ref=cp.execFileSync(T+'/tools/tuzenc',[T+'/d.bin']);ourTot+=c.length;refTot+=ref.length;
  if(name.startsWith('solid')||name.startsWith('anim')||name.startsWith('palette')||name==='rainbow 0') console.log(name.padEnd(16),'raw',data.length,'ours',c.length,'official',ref.length);
}
console.log('cases',cases.length,'failures',fail,'total ours',ourTot,'official',refTot);
process.exit(fail?1:0);
