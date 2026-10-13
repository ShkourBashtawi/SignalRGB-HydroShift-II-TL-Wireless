const L=require('../src/core.cjs');const fs=require('fs');let fail=0;
for(const line of fs.readFileSync(__dirname+'/reference/effect_reference.txt','utf8').trim().split('\n')){
 const [n,c,ms,comp,eff]=line.split(' ');const col=[...Buffer.from(c,'hex')];
 const up=L.llBuildRgbUpload([Array(+n).fill(col)],+ms,null);
 const ok=Buffer.from(up.compressed).toString('hex')===comp&&Buffer.from(up.effectIndex).toString('hex')===eff;
 console.log(ok?'ok  ':'FAIL',n,'LEDs',c,ms+'ms','effect',Buffer.from(up.effectIndex).toString('hex'),'(rust',eff+')');if(!ok)fail++;}
process.exit(fail?1:0);
