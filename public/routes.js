import {clamp,levelConfig} from './engine.js';

const TECH = [
  {route:'shield',label:'ESCUDO'},
  {route:'rapid',label:'RÁFAGA'},
  {route:'blast',label:'EXPLOSIÓN'}
];
const CYAN='#70e8f2',GOLD='#ffd685',TAU=Math.PI*2;

export function routeOptions(level,w,h,index=0) {
  const hp=Math.max(3,levelConfig(level).basePower*4),tech=TECH[((Math.floor(level)-1+Math.floor(index))%TECH.length+TECH.length)%TECH.length];
  const y=h*.28-(Math.floor(index)%3)*6;
  const common={kind:'cache',y,r:28,hp,max:hp,speed:45,opened:false};
  return [
    {...common,route:'ammo',x:w*.22,label:'MUNICIÓN',color:CYAN},
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
export function drawRouteTarget(ctx,e,time) {
  const r=e.r||28,color=e.color||(e.route==='ammo'?CYAN:GOLD),progress=1-clamp(e.hp/e.max,0,1),pulse=.5+.5*Math.sin(time*4+e.x*.05);
  ctx.save();ctx.translate(e.x,e.y);ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=1.5;
  ctx.fillStyle='#04122566';ctx.beginPath();ctx.ellipse(3,r*.63,r*1.07,r*.25,0,0,TAU);ctx.fill();
  glow(ctx,0,r*.29,r*1.35,e.route==='ammo'?'#5bdbf324':'#ffcc6c24');
  // Cargo shell has three faces and metal corners; it remains distinct from zombies.
  polygon(ctx,[[-r,-r*.7],[-r*.81,-r*.95],[r*.84,-r*.95],[r,-r*.7]],e.route==='ammo'?'#54949b':'#a5926b','#a8bdad');
  polygon(ctx,[[r,-r*.7],[r*.84,-r*.95],[r*.84,r*.31],[r,r*.53]],'#273a4b','#12293d');
  const g=ctx.createLinearGradient(-r,-r,r,r);g.addColorStop(0,e.route==='ammo'?'#517c8d':'#877966');g.addColorStop(.4,'#283f53');g.addColorStop(1,'#192c40');
  box(ctx,-r,-r*.7,r*2,r*1.26,5,g,'#091b2c');
  box(ctx,-r*.81,-r*.52,r*1.62,r*.77,4,'#112b43',color);
  for(const side of [-1,1]) {
    box(ctx,side*r*.85-r*.075,-r*.73,r*.15,r*1.25,2,'#607e8b');
    line(ctx,side*r*.85-r*.04,-r*.66,side*r*.85-r*.04,r*.43,1,'#cadbd28c');
    for(const yy of [-r*.6,r*.4]) {
      ctx.fillStyle='#d1d7b8';ctx.beginPath();ctx.arc(side*r*.85,yy,1.6,0,TAU);ctx.fill();
    }
  }
  icon(ctx,e.route,0,-r*.18,r*.58,color);
  // The lower lock opens through damage: cyan/gold segments fill as bullets land.
  box(ctx,-r*.65,r*.29,r*1.3,r*.15,2,'#081b2c');
  for(let i=0;i<6;i++) {
    const active=progress>=(i+1)/6;
    box(ctx,-r*.59+i*r*.205,r*.32,r*.13,r*.075,1,active?color:'#456074');
  }
  if(progress>0) {
    const crack=progress>.55;
    line(ctx,-r*.35,-r*.53,-r*.21,-r*.34,1.3,'#bcebd283');
    if(crack) {line(ctx,-r*.21,-r*.34,-r*.3,-r*.08,1.3,'#d4edd59c');line(ctx,r*.26,-r*.48,r*.4,-r*.25,1.3,'#d4edd59c');}
  }
  const light=color+(pulse>.5?'cc':'88');
  for(const side of [-1,1]) {
    glow(ctx,side*r*.55,-r*.88,r*.2,e.route==='ammo'?'#79e8f357':'#ffd68057');
    box(ctx,side*r*.55-r*.1,-r*.94,r*.2,r*.1,1,light);
  }
  // A compact action label can be read without relying on color alone.
  const label=e.label||({ammo:'MUNICIÓN',shield:'ESCUDO',rapid:'RÁFAGA',blast:'EXPLOSIÓN'}[e.route]||'MEJORA');
  ctx.textAlign='center';ctx.font='800 11px system-ui';ctx.fillStyle=color;ctx.fillText(label,0,r*.98,r*2.5);
  ctx.font='700 9px system-ui';ctx.fillStyle='#d8e8ed';ctx.fillText(e.opened?'¡ABIERTA!':'ABRÍ A TIROS',0,r*1.34,r*2.5);
  if(e.hit>0) {
    ctx.globalAlpha=clamp(e.hit/.12,0,1)*.65;glow(ctx,0,-r*.15,r*1.2,'#fff0bb7a');
    line(ctx,-r*.5,-r*.45,r*.45,r*.2,2,'#fff4c3');ctx.globalAlpha=1;
  }
  ctx.restore();
}

// Localized lane overlays: no changes to the road, camera, hitboxes or enemy positions.
// Optional fork.leftLabel/rightLabel override the default labels. Hide with active:false.
export function drawFork(ctx,w,h,fork={},project) {
  if(typeof project!=='function'||fork.active===false)return;
  const top=clamp(fork.top??h*.25,0,h),bottom=clamp(fork.bottom??h*.95,top,h);
  if(bottom-top<20)return;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  const sides=[{lo:.075,hi:.445,center:.245,color:CYAN,shade:'#49b8d2',label:fork.leftLabel||'MUNICIÓN'},
    {lo:.555,hi:.925,center:.755,color:GOLD,shade:'#d9a253',label:fork.rightLabel||'TALLER'}];
  for(const side of sides) {
    const corners=[[side.lo*w,top],[side.hi*w,top],[side.hi*w,bottom],[side.lo*w,bottom]].map(([x,y])=>project(x,y,w,h));
    const g=ctx.createLinearGradient(0,corners[0].y,0,corners[2].y);
    g.addColorStop(0,side.shade+'02');g.addColorStop(.2,side.shade+'10');g.addColorStop(.75,side.shade+'22');g.addColorStop(1,side.shade+'08');
    polygon(ctx,corners.map(p=>[p.x,p.y]),g);
    for(const edge of [side.lo,side.hi]) {
      const a=project(edge*w,top,w,h),b=project(edge*w,bottom,w,h);
      line(ctx,a.x,a.y,b.x,b.y,1,side.color+'30');
    }
    for(let i=1;i<=3;i++) {
      const y=top+(bottom-top)*i/4,p=project(side.center*w,y,w,h),s=p.scale;
      ctx.strokeStyle=side.color+'48';ctx.lineWidth=2.5*s;
      ctx.beginPath();ctx.moveTo(p.x-9*s,p.y+4*s);ctx.lineTo(p.x,p.y-4*s);ctx.lineTo(p.x+9*s,p.y+4*s);ctx.stroke();
    }
    const p=project(side.center*w,bottom-31,w,h),scale=p.scale;
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale,scale);
    const labelWidth=Math.min(w*.29,92);
    box(ctx,-labelWidth/2,-12,labelWidth,22,6,'#09192acf',side.color+'60');
    ctx.font='800 9px system-ui';ctx.textAlign='center';ctx.fillStyle=side.color;ctx.fillText(side.label,0,2,labelWidth-10);
    ctx.restore();
  }
  ctx.restore();
}
