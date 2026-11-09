import * as A from '../js/astro.js';
// 1) Find moment Sun's sidereal longitude crosses 270 near 2025-01-14
function cross(target, from, to){
  let lo=from.getTime(), hi=to.getTime();
  const f=(t)=>{ let d=A.siderealLon('Sun',new Date(t))-target; if(d>180)d-=360; if(d<-180)d+=360; return d;};
  for(let i=0;i<50;i++){ const mid=(lo+hi)/2; if(f(mid)<0) lo=mid; else hi=mid; }
  return new Date((lo+hi)/2);
}
const t = cross(270, new Date('2025-01-13T00:00:00Z'), new Date('2025-01-16T00:00:00Z'));
const ist = new Date(t.getTime()+5.5*3600000);
console.log('Makar Sankranti 2025 (UTC):', t.toISOString(), ' IST:', ist.toISOString().replace('Z',''), ' (Drik: 14 Jan 09:03 IST)');
const t2 = cross(270, new Date('2024-01-14T00:00:00Z'), new Date('2024-01-16T00:00:00Z'));
console.log('Makar Sankranti 2024 IST:', new Date(t2.getTime()+5.5*3600000).toISOString(), ' (Drik: 15 Jan 02:54 IST)');
const t3 = cross(0, new Date('2025-04-12T00:00:00Z'), new Date('2025-04-16T00:00:00Z'));
console.log('Mesha Sankranti 2025 IST:', new Date(t3.getTime()+5.5*3600000).toISOString(), ' (Drik: 14 Apr 03:30 IST approx)');
// 2) ayanamsa 2025
console.log('Ayanamsa 2025-01-01:', A.ayanamsa(new Date('2025-01-01T00:00:00Z')).toFixed(4));
// 3) Lagna at sunrise Delhi 2025-01-01 07:14 IST  (should ~ equal Sun lon)
const d = A.toUTC(2025,1,1,7,14,5.5);
console.log('Sun sid lon:', A.siderealLon('Sun',d).toFixed(3), ' Lagna sid:', A.ascendant(d,28.6139,77.2090).toFixed(3));
// 4) Full chart sample
const k = A.kundli(A.toUTC(1990,5,15,10,30,5.5), 28.6139, 77.2090);
console.log('Lagna', k.lagna.rashi, A.fmtDeg(k.lagna.deg));
for (const g of Object.values(k.grahas)) console.log(g.id.padEnd(8), 'rashi', g.rashi, A.fmtDeg(g.deg), 'nak', g.nak, 'p', g.pada, g.retro?'R':'', g.dignity, 'house', g.house);
console.log('Panchang now:', JSON.stringify(A.panchang(new Date())));
console.log('Dasha:', k.dasha.slice(0,3).map(x=>x.lord+' '+x.start.toISOString().slice(0,10)+' -> '+x.end.toISOString().slice(0,10)).join(' | '));
