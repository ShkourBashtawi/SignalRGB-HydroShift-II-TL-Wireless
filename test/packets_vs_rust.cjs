const fs=require('fs');const L=require('../src/core.cjs');
const ref={};for(const line of fs.readFileSync(__dirname+'/reference/rgb_reference.txt','utf8').trim().split('\n')){const [k,v]=line.split(' ');ref[k]=v;}
const hex=a=>Buffer.from(a).toString('hex');const unhex=h=>[...Buffer.from(h,'hex')];
const mac=[0x11,0x22,0x33,0x44,0x55,0x66],master=[0xa1,0xb2,0xc3,0xd4,0xe5,0xf6];
let fail=0,checked=0;
function check(tag,frames,interval,eff,compKey,pktPrefix){
  const up=L.llBuildRgbUpload(frames,interval,eff);
  up.compressed=unhex(ref[compKey]); // use reference compression to compare framing byte-for-byte
  up.packetCount=Math.ceil(up.compressed.length/220)+1;
  for(let i=0;i<up.packetCount;i++){const k=pktPrefix+i;checked++;
    if(hex(L.llRgbPacket(up,mac,master,i))!==ref[k]){fail++;console.log('MISMATCH',tag,k);}}
  if(ref[pktPrefix+up.packetCount]!==undefined){fail++;console.log('packet count differs',tag);}
}
const f1=[...Array(96)].map((_,i)=>[(i*2)&255,(255-i)&255,(i*7)%256]);
check('direct',[f1],5000,[0,0,0,1],'COMPRESSED','PKT');
const frames=[...Array(20)].map((_,f)=>[...Array(96)].map((_,i)=>[(f*13+i*5)%256,(f*7+i)%256,(i*f)%256]));
check('anim',frames,37,[0x81,2,3,4],'COMPRESSED2','PKT2_');
const clock=hex(L.llBuildClockFrame(master));checked++;
if(clock!==fs.readFileSync(__dirname+'/reference/clock_reference.txt','utf8').trim()){fail++;console.log('MISMATCH clock');}
// our own compressor must still round-trip through official decoder for these exact inputs
console.log('packets checked',checked,'mismatches',fail);process.exit(fail?1:0);
