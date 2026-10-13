// Original arcade artwork for the new objective and hazard types.
const TAU=Math.PI*2;
const box=(c,x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const circle=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();};
export function drawSpecial(c,e,time){
  c.save();c.translate(e.x,e.y);c.lineWidth=2;
  if(e.kind==='mine'){
    c.fillStyle='#05162666';c.beginPath();c.ellipse(2,9,22,7,0,0,TAU);c.fill();
    circle(c,0,0,17,'#5f4650');circle(c,0,0,13,'#f49d56');circle(c,0,0,8,'#263348');
    for(let i=0;i<8;i++){const a=i*TAU/8;c.strokeStyle='#e1cc96';c.beginPath();c.moveTo(Math.cos(a)*14,Math.sin(a)*14);c.lineTo(Math.cos(a)*21,Math.sin(a)*21);c.stroke();}
    circle(c,0,0,4,'#ff637d');c.fillStyle='#fff';c.font='900 8px system-ui';c.textAlign='center';c.fillText('MINA',0,31);
  }else if(e.kind==='drone'){
    c.strokeStyle='#788bad';c.lineWidth=5;for(const side of [-1,1]){c.beginPath();c.moveTo(-18,side*15);c.lineTo(18,-side*15);c.stroke();}
    for(const x of [-20,20])for(const y of [-16,16]){circle(c,x,y,9,'#173147');c.strokeStyle='#b9d5e4';c.lineWidth=1.5;c.beginPath();c.arc(x,y,8,0,TAU);c.stroke();const a=time*28+x;c.beginPath();c.moveTo(x+Math.cos(a)*7,y+Math.sin(a)*7);c.lineTo(x-Math.cos(a)*7,y-Math.sin(a)*7);c.stroke();}
    box(c,-12,-15,24,30,7,'#8773b4');box(c,-7,-8,14,12,3,'#203248');circle(c,0,9,4,'#ff7188');
    c.font='800 8px system-ui';c.textAlign='center';c.fillStyle='#ffb4c5';c.fillText('DRON',0,32);
  }else if(e.kind==='base'){
    box(c,-36,-36,72,63,5,'#303e55');box(c,-32,-31,64,53,3,'#677b91');
    for(const x of [-27,27]){box(c,x-10,-47,20,68,3,'#344e64');for(let j=0;j<3;j++)box(c,x-10+j*7,-52,5,10,1,'#aab4a9');box(c,x-4,-25,8,10,1,'#ffe7a8');}
    box(c,-14,-12,28,38,5,'#152738');box(c,-9,-7,18,23,3,'#658391');c.strokeStyle='#d8bd74';c.lineWidth=3;c.beginPath();c.moveTo(0,-38);c.lineTo(0,-65);c.stroke();
    c.fillStyle='#ff8ea4';c.beginPath();c.moveTo(0,-65);c.lineTo(20,-59);c.lineTo(0,-52);c.fill();
    c.fillStyle='#fff';c.font='900 9px system-ui';c.textAlign='center';c.fillText(e.label||'BASE',0,40);
  }
  c.restore();
}
export function drawPickup(c,p,time){
  c.save();c.translate(p.x,p.y);
  if(p.kind==='civilian'){
    c.strokeStyle='#8eeeff';c.lineWidth=2;c.beginPath();c.ellipse(0,4,23,30,0,0,TAU);c.stroke();
    c.strokeStyle='#d3f8ff';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(-6,7);c.lineTo(-8,23);c.moveTo(6,7);c.lineTo(8,23);c.stroke();
    box(c,-10,-10,20,24,5,'#39a9d4');circle(c,0,-17,9,'#ffe3ba');c.strokeStyle='#ffe3ba';c.lineWidth=5;c.beginPath();c.moveTo(-9,-5);c.lineTo(-19,-16-Math.sin(time*5)*3);c.moveTo(9,-5);c.lineTo(19,-20);c.stroke();
    c.fillStyle='#b5f5ff';c.font='800 9px system-ui';c.textAlign='center';c.fillText('RESCATAR',0,39);
  }else{
    const safe=p.path==='safe',color=safe?'#b3f589':'#ffb375';
    box(c,-49,-25,98,47,7,'#142c3e');c.strokeStyle=color;c.lineWidth=2;c.strokeRect(-47,-23,94,43);
    c.textAlign='center';c.fillStyle=color;c.font='900 12px system-ui';c.fillText(safe?'REFUGIO':'ASALTO',0,-6);c.font='800 8px system-ui';c.fillStyle='#edf4f8';c.fillText(safe?'+VIDA · MENOS HORDA':'+4 PODER · MÁS HORDA',0,10);
  }
  c.restore();
}
