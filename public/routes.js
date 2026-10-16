import {clamp,levelConfig} from './engine.js';

const TECH = [
  {route:'shield',label:'ESCUDO'},
  {route:'rapid',label:'RÁFAGA'},
  {route:'blast',label:'ARTILLERÍA'}
];
const CYAN='#70e8f2',GOLD='#ffd685',TAU=Math.PI*2;

export function routeOptions(level,w,h,index=0) {
  const hp=Math.max(3,levelConfig(level).basePower*4),tech=TECH[((Math.floor(level)-1+Math.floor(index))%TECH.length+TECH.length)%TECH.length];
  const y=h*.28-(Math.floor(index)%3)*6;
  const common={kind:'cache',y,r:28,hp,max:hp,speed:45,opened:false};
  return [
    {...common,route:'ammo',x:w*.22,label:'+3 CAÑONES',color:CYAN},
    {...common,...tech,x:w*.78,color:GOLD}
  ];
}
function polygon(ctx,points,fill,stroke) {
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}
function box(ctx,x,y,w,h,r,fill,stroke) {
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}
function line(ctx,x,y,x2,y2,width,color) {
  ctx.lineWidth=width;ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();
}
function glow(ctx,x,y,r,color) {
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#ffffff00');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
}
function icon(ctx,route,x,y,r,color) {
  ctx.save();ctx.translate(x,y);ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=1.5;
  if(route==='ammo') {
    for(let i=-1;i<=1;i++) {
      const xx=i*r*.42;
      polygon(ctx,[[xx-r*.13,r*.45],[xx-r*.13,-r*.16],[xx,-r*.46],[xx+r*.13,-r*.16],[xx+r*.13,r*.45]],color);
      line(ctx,xx-r*.13,r*.28,xx+r*.13,r*.28,1.2,'#16344c');
      line(ctx,xx-r*.05,-r*.12,xx-r*.05,r*.13,1,'#ffffffaa');
    }
  } else if(route==='shield') {
    polygon(ctx,[[-r*.56,-r*.35],[0,-r*.53],[r*.56,-r*.35],[r*.46,r*.14],[0,r*.59],[-r*.46,r*.14]],color);
    polygon(ctx,[[-r*.37,-r*.2],[0,-r*.34],[r*.36,-r*.2],[r*.28,r*.08],[0,r*.37],[-r*.28,r*.08]],'#32556c');
    line(ctx,-r*.17,0,-r*.01,r*.13,2,'#fff1ca');line(ctx,-r*.01,r*.13,r*.25,-r*.16,2,'#fff1ca');
  } else if(route==='rapid') {
    polygon(ctx,[[r*.03,-r*.66],[-r*.45,r*.06],[-r*.02,r*.04],[-r*.16,r*.64],[r*.5,-r*.14],[r*.04,-r*.14]],color);
    line(ctx,-r*.75,-r*.24,-r*.45,-r*.24,1.5,color);line(ctx,-r*.72,r*.12,-r*.53,r*.12,1.5,color);line(ctx,r*.46,r*.3,r*.73,r*.3,1.5,color);
  } else {
    const points=[];
    for(let i=0;i<16;i++) {const a=i*Math.PI/8,d=i%2?r*.32:r*.68;points.push([Math.cos(a)*d,Math.sin(a)*d]);}
    polygon(ctx,points,color);glow(ctx,0,0,r*.56,'#ffb18b70');
    ctx.fillStyle='#fff8df';ctx.beginPath();ctx.arc(0,0,r*.19,0,TAU);ctx.fill();
  }
  ctx.restore();
}

// Called inside the same place() transform as the enemies. Coordinates and collision
// radius stay in world units; this helper only draws the destructible reward container.
export function drawRouteTarget(c,e,time){
 const portal=e.route==='portal',color=e.color||GOLD,r=e.r||28;
 c.save();c.translate(e.x,e.y);c.lineWidth=2;
 if(portal){
  box(c,-31,-5,62,44,4,'#a2aec4','#6d7a96');box(c,-35,24,70,17,3,'#e9e5e4','#6d7a96');
  const clouds=[[-24,-13,17],[-8,-28,21],[16,-24,20],[29,-6,16],[5,-5,25]];
  for(const [x,y,rr] of clouds){c.fillStyle='#b9d2e2';c.beginPath();c.arc(x+2,y+3,rr,0,TAU);c.fill();c.fillStyle='#f2fcff';c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  box(c,-7,-43,14,18,4,'#49c6ef','#297caa');box(c,-4,-46,8,8,2,'#157fa7');
  c.textAlign='center';c.font='900 18px system-ui';c.fillStyle='#28314e';c.fillText(Math.ceil(e.hp),0,36);
  box(c,-31,-70,62,23,4,'#ffd95e','#bc902e');c.fillStyle='#422f25';c.font='900 17px system-ui';c.fillText('×'+e.value,0,-53);
 }else{
  c.fillStyle='#25374c40';c.beginPath();c.ellipse(2,17,32,9,0,0,TAU);c.fill();
  box(c,-27,-27,54,46,5,'#795647','#442f35');box(c,-27,-28,54,17,5,color,'#86653d');box(c,-25,-7,50,23,2,'#c59e75');
  for(const x of [-19,19])box(c,x-3,-27,6,45,1,'#e6cb8d');box(c,-7,-12,14,14,3,'#453447');icon(c,e.route,0,-5,17,color);
  c.textAlign='center';c.font='900 14px system-ui';c.fillStyle='#26304b';c.fillText(e.route==='ammo'?'+3 CAÑONES':e.label||'TALLER',0,35);
 }
 c.textAlign='center';c.font='800 13px system-ui';c.fillStyle='#2c3754';c.fillText('ABRÍ A TIROS',0,portal?55:49);
 const progress=1-clamp(e.hp/e.max,0,1);box(c,-24,portal?42:21,48,4,1,'#596581');box(c,-24,portal?42:21,48*progress,4,1,color);
 c.restore();
}

// Localized lane overlays: no changes to the road, camera, hitboxes or enemy positions.
// Optional fork.leftLabel/rightLabel override the default labels. Hide with active:false.
export function drawFork(ctx,w,h,fork={},project) {
  if(typeof project!=='function'||fork.active===false)return;
  const top=clamp(fork.top??h*.25,0,h),bottom=clamp(fork.bottom??h*.95,top,h);
  if(bottom-top<20)return;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  const sides=fork.lanes?.map(l=>({lo:Math.max(.05,[.22,.5,.78][l.lane]-.16),hi:Math.min(.95,[.22,.5,.78][l.lane]+.16),center:[.22,.5,.78][l.lane],color:l.color||CYAN,shade:l.color||CYAN,label:l.label}))||[
    {lo:.075,hi:.445,center:.245,color:CYAN,shade:CYAN,label:fork.leftLabel||'MUNICIÓN'},
    {lo:.555,hi:.925,center:.755,color:GOLD,shade:GOLD,label:fork.rightLabel||'TALLER'}];
  for(const side of sides){
    const left=[],right=[];
    for(let i=0;i<=16;i++){const y=top+(bottom-top)*i/16;left.push(project(side.lo*w,y,w,h));right.push(project(side.hi*w,y,w,h));}
    const g=ctx.createLinearGradient(0,left[0].y,0,left.at(-1).y);
    g.addColorStop(0,side.shade+'02');g.addColorStop(.2,side.shade+'10');g.addColorStop(.75,side.shade+'22');g.addColorStop(1,side.shade+'08');
    polygon(ctx,[...left,...right.slice().reverse()].map(p=>[p.x,p.y]),g);
    for(const points of [left,right]){ctx.strokeStyle=side.color+'30';ctx.lineWidth=1;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
    for(let i=1;i<=3;i++){
      const y=top+(bottom-top)*i/4,p=project(side.center*w,y,w,h),scale=p.scale;
      ctx.strokeStyle=side.color+'48';ctx.lineWidth=2.5*scale;ctx.beginPath();ctx.moveTo(p.x-9*scale,p.y+4*scale);ctx.lineTo(p.x,p.y-4*scale);ctx.lineTo(p.x+9*scale,p.y+4*scale);ctx.stroke();
    }
    const p=project(side.center*w,bottom-31,w,h),scale=p.scale;
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale,scale);const labelWidth=Math.min(w*.4,156);
    box(ctx,-labelWidth/2,-19,labelWidth,34,7,'#09192acf',side.color+'60');ctx.font='800 15px system-ui';ctx.textAlign='center';ctx.fillStyle=side.color;ctx.fillText(side.label,0,3,labelWidth-12);ctx.restore();
  }
  ctx.restore();
}
