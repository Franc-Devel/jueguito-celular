import {clamp} from './engine.js';

// Original procedural art: every silhouette is drawn locally, without downloaded assets.
export const zones = [
  {name:'Ruta del éxodo',sky:'#60417d',haze:'#ffa276',ground:'#bc8559',road:'#343943',accent:'#ffd36d'},
  {name:'Ciudad en cuarentena',sky:'#182642',haze:'#986283',ground:'#3c4257',road:'#292e3c',accent:'#ff8ea4'},
  {name:'Bosque infectado',sky:'#1e3c47',haze:'#7db3a4',ground:'#30584a',road:'#303c3c',accent:'#8df4ae'},
  {name:'Paso congelado',sky:'#36567b',haze:'#d1e8ed',ground:'#9abcc8',road:'#3d5268',accent:'#9ce8ff'},
  {name:'Zona cero',sky:'#211934',haze:'#b45573',ground:'#4d394c',road:'#292635',accent:'#da99ff'}
];
export function mission(level) {
  const zone = zones[Math.min(4,Math.floor((level-1)/20))], type = (level-1)%3;
  return {zone,type,name:['Frená la horda','Rompé el bloqueo','Cazá al mutante'][type],target:type===0?6+Math.min(12,Math.floor(level/8)):type===1?2:1};
}
export function project(x,y,w,h) {
  const depth=clamp(y/h,0,1),scale=.48+.52*depth;
  return {x:w/2+(x-w/2)*scale,y:66+y*(h-66)/h,scale};
}
export function place(ctx,x,y,w,h) {
  const p=project(x,y,w,h);ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.scale,p.scale);ctx.translate(-x,-y);
}
const TAU=Math.PI*2;
function poly(ctx,points,color,stroke) {
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
  if(color){ctx.fillStyle=color;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}
function ellipse(ctx,x,y,rx,ry,color) {
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();
}
function rounded(ctx,x,y,w,h,r,color,stroke) {
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=color;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}
function gradient(ctx,x,y,w,h,stops) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h);for(const [position,color] of stops)g.addColorStop(position,color);return g;
}
function line(ctx,x1,y1,x2,y2,width,color) {
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
function glow(ctx,x,y,r,color) {
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#ffffff00');
  ellipse(ctx,x,y,r,r,g);
}

function skyline(ctx,w,zone) {
  if(zone===1) {
    for(let i=0;i<19;i++) {
      const x=i*w/18, height=17+(i*31)%57, width=13+(i*11)%21;
      rounded(ctx,x-width/2,83-height,width,height,1,i%2?'#242a43':'#32354e');
      poly(ctx,[[x-width/2,83-height],[x-width/2+4,80-height],[x+width/2+4,80-height],[x+width/2,83-height]],'#5f5062');
      for(let row=0;row<4;row++)for(let col=0;col<3;col++)if((i+row*3+col)%4!==0)ctx.fillStyle=(i+row)%3?'#ffc38366':'#74c8de88',ctx.fillRect(x-width/2+3+col*5,87-height+row*9,2,4);
      if(i%4===0)line(ctx,x,83-height,x,70-height,1,'#2d2c45');
    }
  } else {
    for(let layer=0;layer<2;layer++) {
      const peaks=[[0,80]];
      for(let i=0;i<=12;i++)peaks.push([i*w/12,54+layer*10+Math.sin(i*1.9+layer)*12+(i%3)*3]);
      peaks.push([w,87],[0,87]);poly(ctx,peaks,layer?'#29394280':'#41435a70');
    }
    if(zone===3)for(let i=0;i<7;i++) {
      const x=i*w/6,y=49+(i*19)%27;
      poly(ctx,[[x-16,y+16],[x,y],[x+19,y+17],[x+6,y+10],[x,y+6],[x-7,y+13]],'#d5ebeb9c');
    }
    if(zone===4)for(let i=0;i<8;i++) {
      const x=i*w/7,height=20+(i*13)%33;
      ctx.fillStyle='#342a4380';ctx.fillRect(x-7,83-height,14,height);
      line(ctx,x-10,83-height,x+10,83-height,2,'#754255');
      ctx.fillStyle='#e06a8555';ctx.fillRect(x-4,84-height,8,2);
    }
  }
}
function pine(ctx,x,y,s,snow=false) {
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  ellipse(ctx,4,5,22,7,'#081d293b');rounded(ctx,-3,-28,6,34,1,snow?'#73757a':'#675546');
  for(let i=0;i<3;i++) {
    const top=-70+i*17,width=14+i*6;
    poly(ctx,[[-width,top+29],[0,top],[width,top+29]],snow?'#446b76':'#235a47');
    poly(ctx,[[0,top],[width,top+29],[3,top+24]],snow?'#244959':'#153f37');
    if(snow)poly(ctx,[[-width*.62,top+18],[0,top],[width*.68,top+20],[3,top+14],[-3,top+13]],'#dbebee');
    else line(ctx,-width*.6,top+24,-3,top+13,1.3,'#74af705b');
  }
  ctx.restore();
}
function wreck(ctx,x,y,s,zone,side) {
  ctx.save();ctx.translate(x,y);ctx.rotate(side*.11);ctx.scale(s,s);
  ellipse(ctx,3,5,18,9,'#06122250');
  rounded(ctx,-15,-29,30,34,4,'#121d2a');
  for(const sign of [-1,1])rounded(ctx,sign*14-3,-24,6,26,2,'#17222b');
  rounded(ctx,-12,-31,24,36,4,zone===0?'#9c735b':zone===1?'#485c7f':'#755467');
  poly(ctx,[[-8,-21],[7,-21],[10,-11],[-10,-11]],'#193646');
  poly(ctx,[[-8,-20],[2,-20],[-7,-13]],'#a4e2da51');
  rounded(ctx,-10,-7,20,10,2,'#00000020');
  line(ctx,-9,-27,7,-27,1.5,'#ffffff3b');
  line(ctx,-7,-14,7,-4,1,'#332b31');
  rounded(ctx,-10,-30,5,3,1,'#daba78');rounded(ctx,6,-30,5,3,1,'#e1b970');
  poly(ctx,[[10,-22],[23,-15],[15,-9]],'#5f6770');
  ctx.restore();
}
function roadside(ctx,w,h,time,zone) {
  const period=h+190;
  for(let i=0;i<12;i++) {
    const y=(i*period/12+time*72)%period-90;
    if(y<-32)continue;
    const p=project(0,y,w,h),side=i%2?-1:1;
    const x=w/2+side*(w*.275+w*.255*clamp(y/h,0,1));
    const sc=p.scale*.88;
    if(zone===2||zone===3) {
      pine(ctx,x+side*14,p.y,sc*(i%3===0?1.35:1),zone===3);
      if(i%3===0)pine(ctx,x+side*37,p.y+12,sc*.7,zone===3);
      if(zone===2&&i%3===1) {
        glow(ctx,x-side*6,p.y-16*sc,10*sc,'#bcff8055');
        ellipse(ctx,x-side*6,p.y-16*sc,2*sc,2*sc,'#c2f997');
      }
    } else if(zone===0) {
      ctx.save();ctx.translate(x,p.y);ctx.scale(sc,sc);
      ellipse(ctx,5,4,18,5,'#543d4140');
      if(i%3===0) {
        ctx.lineCap='round';line(ctx,0,2,0,-38,7,'#55785e');line(ctx,-12,-26,-12,-15,5,'#56765a');line(ctx,-12,-15,0,-15,5,'#56765a');line(ctx,11,-33,11,-23,5,'#45694f');line(ctx,0,-23,11,-23,5,'#45694f');line(ctx,-1,-33,-1,-2,1,'#8ba170');
      } else {
        poly(ctx,[[-15,3],[-10,-10],[3,-17],[17,-3],[19,5]],'#9b7058');
        poly(ctx,[[-10,-10],[3,-17],[17,-3],[0,-5]],'#d8aa79');
        line(ctx,-7,-8,2,-11,1,'#f4c58d90');
      }
      ctx.restore();if(i===4||i===9)wreck(ctx,x+side*12,p.y-20,sc,zone,side);
    } else if(zone===1) {
      if(i%3===0)wreck(ctx,x,p.y,sc,zone,side);
      else {
        ctx.save();ctx.translate(x,p.y);ctx.scale(sc,sc);
        ellipse(ctx,4,5,15,4,'#07142760');
        rounded(ctx,-3,-76,6,80,2,'#344555');line(ctx,-2,-74,-2,1,1,'#8292a3');
        line(ctx,0,-73,-side*25,-78,4,'#536578');rounded(ctx,-side*25-7,-80,15,6,2,'#eac4a2');
        glow(ctx,-side*25,-76,20,'#ffd9ae4a');
        poly(ctx,[[-side*25-3,-76],[-side*25-28,-1],[-side*25+22,-1]],'#ffdeab05');
        ctx.restore();
      }
    } else {
      ctx.save();ctx.translate(x,p.y);ctx.scale(sc,sc);
      ellipse(ctx,5,4,21,8,'#160d2740');
      if(i%3===0) {
        rounded(ctx,-13,-33,26,35,4,'#394854');
        ellipse(ctx,0,-33,13,4,'#576d6d');line(ctx,-12,-20,12,-20,3,'#182b37');line(ctx,-12,-5,12,-5,3,'#182b37');
        glow(ctx,0,-18,18,'#adfc7540');
        poly(ctx,[[0,-25],[-7,-13],[7,-13]],'#abef79');ellipse(ctx,0,-17,2,2,'#304d40');
      } else {
        poly(ctx,[[-17,3],[-4,-28],[10,-34],[19,0]],'#634964');
        poly(ctx,[[-4,-28],[10,-34],[6,-4],[-17,3]],'#89617c');
        line(ctx,3,-24,-3,-7,2,'#f58aab9c');glow(ctx,1,-13,12,'#ed73ba32');
      }
      ctx.restore();
    }
  }
}

export function road(ctx,w,h,time,level) {
  const zone=Math.min(4,Math.floor((level-1)/20)),z=zones[zone];
  ctx.save();ctx.lineCap='butt';
  ctx.fillStyle=gradient(ctx,0,0,0,h,[[0,z.sky],[.16,z.haze],[.34,z.ground],[1,z.ground]]);ctx.fillRect(0,0,w,h);
  glow(ctx,w*.72,61,68,zone===1?'#ffa3d93b':zone===4?'#ff71872c':'#ffe2a575');
  ellipse(ctx,w*.72,54,zone===3?15:21,zone===3?15:21,zone===1?'#ffd8d180':zone===4?'#ffb5bb85':'#ffe4becc');
  skyline(ctx,w,zone);
  // Scrolling ground ribs and stones establish motion without obscuring the battlefield.
  for(let i=0;i<20;i++) {
    const y=(i*(h+50)/20+time*63)%(h+50),p=project(0,y,w,h),d=clamp(y/h,0,1);
    for(const side of [-1,1]) {
      const x=w/2+side*(w*.29+w*.31*d);
      ellipse(ctx,x,p.y,11*p.scale,2*p.scale,zone===3?'#eef6f139':'#1b27341a');
      if(i%3===0)poly(ctx,[[x-3*p.scale,p.y],[x,p.y-5*p.scale],[x+5*p.scale,p.y+1]],zone===3?'#e8f3ed60':'#ebbe852e');
    }
  }
  const outer=[[w*.242,66],[w*.758,66],[w*1.012,h],[w*-.012,h]];
  poly(ctx,outer,zone===3?'#d4e1dc':'#bcaa93');
  poly(ctx,[[w*.255,66],[w*.745,66],[w*.975,h],[w*.025,h]],gradient(ctx,0,66,0,h-66,[[0,z.road],[.5,z.road],[1,zone===3?'#2c3e51':'#202732']]));
  // Sparse deterministic aggregate, cracks and skid marks, clipped to the actual asphalt.
  ctx.save();poly(ctx,[[w*.255,66],[w*.745,66],[w*.975,h],[w*.025,h]]);ctx.clip();
  for(let i=0;i<94;i++) {
    const y=(i*67.71+time*78)%(h+80)-40,x=(i*73.41)%w,p=project(x,y,w,h);
    ctx.fillStyle=i%2?'#b8ccd610':'#060d1b25';ctx.fillRect(p.x,p.y,1+p.scale*1.2,p.scale*.8);
  }
  for(let i=0;i<6;i++) {
    const y=(i*(h+140)/6+time*74)%(h+140)-80,p=project(w*(i%2?.69:.31),y,w,h);
    ctx.strokeStyle='#050b1729';ctx.lineWidth=2*p.scale;
    ctx.beginPath();ctx.moveTo(p.x-3,p.y);ctx.lineTo(p.x+1,p.y+14*p.scale);ctx.lineTo(p.x-4,p.y+27*p.scale);ctx.lineTo(p.x+7,p.y+35*p.scale);ctx.stroke();
  }
  for(const side of [-1,1]) {
    const a=project(w/2+side*w*.31,0,w,h),b=project(w/2+side*w*.31,h,w,h);
    line(ctx,a.x,a.y,b.x,b.y,5,'#02081913');
  }
  if(zone===3) {
    poly(ctx,[[0,h],[w*.11,h],[w*.287,66],[0,66]],'#e1f0ed29');
    poly(ctx,[[w,h],[w*.89,h],[w*.713,66],[w,66]],'#e1f0ed20');
  }
  ctx.restore();
  // Three lanes use the same projection as bullets and enemies.
  for(let i=0;i<12;i++) {
    const y=(i*80+time*85)%(h+100)-65;
    if(y<0)continue;
    for(const x of [w/3,w*2/3]) {
      const a=project(x,y,w,h),b=project(x,y+29,w,h);
      line(ctx,a.x+1,a.y+1,b.x+1,b.y+1,4*a.scale,'#0f172970');
      line(ctx,a.x,a.y,b.x,b.y,3*a.scale,zone===4?'#d9b4bb8a':'#fff0d3a6');
    }
  }
  // Double shoulder lines and segmented raised guardrails.
  for(const side of [-1,1]) {
    line(ctx,w/2+side*w*.242,66,w/2+side*w*.468,h,3,zone===4?'#eac0ba99':'#f6e7c5b3');
    line(ctx,w/2+side*w*.252,66,w/2+side*w*.486,h,1,'#101c3755');
    for(let i=0;i<13;i++) {
      const y=(i*76+time*85)%(h+90)-55;
      if(y<0)continue;
      const p=project(0,y,w,h),d=clamp(y/h,0,1),x=w/2+side*(w*.26+w*.245*d);
      const p2=project(0,y+38,w,h),d2=clamp((y+38)/h,0,1),x2=w/2+side*(w*.26+w*.245*d2);
      line(ctx,x,p.y+4,x,p.y-10*p.scale,2.5*p.scale,'#525b68');
      line(ctx,x,p.y-10*p.scale,x2,p2.y-10*p2.scale,5*p.scale,'#536173');
      line(ctx,x,p.y-12*p.scale,x2,p2.y-12*p2.scale,1.4*p.scale,'#d5dfdcc4');
      rounded(ctx,x-2*p.scale,p.y-9*p.scale,4*p.scale,3*p.scale,1,zone===4?'#f391c3':'#ffda86');
    }
  }
  roadside(ctx,w,h,time,zone);
  // Airborne details are deliberately few and low contrast on small phones.
  if(zone>=2)for(let i=0;i<15;i++) {
    const x=(i*71.7+Math.sin(time*.5+i)*13)%w,y=(i*93.2+time*(zone===3?24:11))%h;
    ellipse(ctx,x,y,zone===3?1.3:1,zone===3?1.8:1,zone===3?'#eaffff65':zone===2?'#b9fda737':'#f48cb232');
  }
  ctx.fillStyle=gradient(ctx,0,66,0,74,[[0,'#dce3dc1a'],[1,'#dce3dc00']]);ctx.fillRect(0,66,w,74);
  const vignette=ctx.createRadialGradient(w/2,h*.5,w*.28,w/2,h*.5,h*.8);
  vignette.addColorStop(0,'#08112000');vignette.addColorStop(1,'#08112065');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
  ctx.restore();
}

function limb(ctx,points,width,dark,light) {
  ctx.lineCap='round';ctx.lineJoin='round';
  const trace=()=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));};
  ctx.strokeStyle='#13252de0';ctx.lineWidth=width+2;trace();ctx.stroke();
  ctx.strokeStyle=dark;ctx.lineWidth=width;trace();ctx.stroke();
  ctx.strokeStyle=light;ctx.lineWidth=Math.max(1,width*.3);ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x-width*.17,y-width*.13):ctx.moveTo(x-width*.17,y-width*.13));ctx.stroke();
}
function hand(ctx,x,y,r,skin,light,boss) {
  ellipse(ctx,x,y,r*.14,r*.19,skin);
  line(ctx,x-r*.04,y-r*.12,x-r*.05,y+r*.08,r*.045,light);
  if(boss)for(let j=-1;j<=1;j++)poly(ctx,[[x+j*r*.08-r*.035,y+r*.1],[x+j*r*.08,y+r*.29],[x+j*r*.08+r*.035,y+r*.1]],'#e9dfb5');
}
function barricade(ctx,e,time) {
  const r=e.r,health=clamp(e.hp/e.max,0,1);
  ellipse(ctx,3,r*.55,r*1.25,r*.24,'#060d255c');
  for(const side of [-1,1]) {
    poly(ctx,[[side*r*.7-4,-r*.2],[side*r*.7+5,-r*.2],[side*r*.7+8,r*.53],[side*r*.7-8,r*.53]],'#444954');
    rounded(ctx,side*r*.7-8,r*.45,16,4,1,'#707b84');
  }
  poly(ctx,[[-r,-r*.51],[-r+5,-r*.7],[r+5,-r*.7],[r,-r*.51]],'#a4a097');
  poly(ctx,[[r,-r*.51],[r+5,-r*.7],[r+5,r*.27],[r,r*.44]],'#474451');
  rounded(ctx,-r,-r*.51,r*2,r*.95,3,gradient(ctx,-r,-r*.5,0,r,[[0,'#b6a17a'],[.12,'#f1d484'],[.5,'#ad8158'],[1,'#675955']]),'#252a37');
  ctx.save();ctx.beginPath();ctx.rect(-r+1,-r*.46,r*2-2,r*.3);ctx.clip();
  for(let i=-r-12;i<r+12;i+=14)poly(ctx,[[i,-r*.49],[i+7,-r*.49],[i+16,-r*.14],[i+9,-r*.14]],'#2e3440');ctx.restore();
  rounded(ctx,-r+4,r*.01,r*2-8,r*.16,1,'#6e5547');
  for(const side of [-1,1])ellipse(ctx,side*(r-5),r*.27,1.5,1.5,'#dce3df');
  if(health<.75) {
    line(ctx,-r*.1,-r*.5,r*.12,-r*.22,1.6,'#302930');line(ctx,r*.12,-r*.22,-r*.04,r*.05,1.6,'#302930');line(ctx,-r*.04,r*.05,r*.24,r*.36,1.6,'#302930');
    if(health<.35)poly(ctx,[[-r,-r*.02],[-r*.63,r*.12],[-r*.78,r*.34],[-r,r*.37]],'#1d2636');
  }
  for(const side of [-1,1]) {
    line(ctx,side*r*.75,-r*.7,side*r*.75,-r*.83,2,'#354151');
    glow(ctx,side*r*.75,-r*.86,r*.22,'#ffa65844');
    ellipse(ctx,side*r*.75,-r*.86,3,3,Math.sin(time*5+side)>0?'#fff0ad':'#d48847');
  }
  if(e.hit>0){ctx.globalAlpha=Math.min(.55,e.hit*4);rounded(ctx,-r,-r*.51,r*2,r*.95,3,'#fffbe0');ctx.globalAlpha=1;}
}

export function zombie(ctx,e,time) {
  const r=e.r,boss=!!e.boss,runner=e.kind==='runner',tank=e.kind==='tank';
  ctx.save();ctx.translate(e.x,e.y);
  if(e.kind==='barricade'){barricade(ctx,e,time);ctx.restore();return;}
  const gait=Math.sin(time*(runner?15:boss?5.4:7.5)+e.x*.13),step=gait*r*(runner?.22:.12),sway=gait*(boss?.025:runner?.075:.05);
  const skin=boss?'#9471c8':tank?'#96b46b':'#8dcc9a',shade=boss?'#54456f':tank?'#526c45':'#456f62',light=boss?'#cfa5f2':tank?'#c8dd91':'#b9f0b0';
  const shirt=boss?'#504763':tank?'#465866':runner?'#a4474e':'#456a83';
  ellipse(ctx,4,r*.89,r*(boss?1.02:.81),r*.28,'#05142b55');
  ellipse(ctx,0,r*.84,r*.49,r*.16,'#020d173a');
  ctx.rotate(sway);ctx.lineWidth=1.3;ctx.lineJoin='round';
  // Alternating knee and foot positions give each class a recognizable walk cycle.
  const hipWidth=r*(boss?.38:tank?.3:.24),ankleL=-hipWidth-step*.5,ankleR=hipWidth+step*.5;
  limb(ctx,[[-hipWidth,r*.18],[-hipWidth-r*.04,r*.48+step*.38],[ankleL,r*.81+step*.35]],r*(boss?.32:.22),boss?'#403a58':'#293c4b',boss?'#75667e':'#597384');
  limb(ctx,[[hipWidth,r*.18],[hipWidth+r*.02,r*.48-step*.38],[ankleR,r*.81-step*.35]],r*(boss?.32:.22),boss?'#403a58':'#293c4b',boss?'#75667e':'#597384');
  rounded(ctx,ankleL-r*.14,r*.76+step*.35,r*.32,r*.16,3,'#152534','#081c28');
  rounded(ctx,ankleR-r*.14,r*.76-step*.35,r*.32,r*.16,3,'#152534','#081c28');
  line(ctx,ankleL-r*.11,r*.86+step*.35,ankleL+r*.14,r*.86+step*.35,1,'#718d90');
  line(ctx,ankleR-r*.11,r*.86-step*.35,ankleR+r*.14,r*.86-step*.35,1,'#718d90');
  const shoulder=r*(boss?.64:tank?.56:.43),armDrop=runner?.08:.18;
  for(const side of [-1,1]) {
    const elbowX=side*r*(boss?.87:.64),elbowY=-r*.14+side*step*.35;
    const hx=side*r*(boss?.96:runner?.58:.74),hy=r*armDrop+side*step*.72;
    limb(ctx,[[side*shoulder,-r*.39],[elbowX,elbowY],[hx,hy]],r*(boss?.29:tank?.22:.18),shade,skin);
    if(boss) {
      ellipse(ctx,side*shoulder,-r*.39,r*.26,r*.23,skin);ellipse(ctx,side*shoulder-r*.06,-r*.44,r*.13,r*.1,light);
      rounded(ctx,elbowX-r*.18,elbowY-r*.12,r*.36,r*.23,3,'#3b3e52','#9b95bb');
    } else {
      ellipse(ctx,side*shoulder,-r*.37,r*.19,r*.2,shirt);
      if(tank)poly(ctx,[[side*shoulder-r*.22,-r*.56],[side*shoulder+r*.22,-r*.56],[side*shoulder+r*.2,-r*.27],[side*shoulder-r*.19,-r*.27]],'#728088','#243341');
    }
    hand(ctx,hx,hy,r,skin,light,boss);
  }
  // A shaded torso, collar and torn fabric keep the forms readable at phone scale.
  poly(ctx,[[-shoulder,-r*.47],[shoulder,-r*.47],[r*.42,r*.19],[-r*.39,r*.2]],gradient(ctx,-shoulder,-r*.5,r,0,[[0,boss?'#9980b5':tank?'#78897e':runner?'#d07168':'#759da9'],[.45,shirt],[1,boss?'#39324f':tank?'#334651':runner?'#69384c':'#294859']]),'#192d35');
  poly(ctx,[[-shoulder,-r*.46],[-r*.13,-r*.4],[-r*.1,r*.08],[-r*.32,r*.15]],'#ffffff12');
  poly(ctx,[[0,-r*.46],[r*.19,-r*.42],[r*.05,-r*.24],[-r*.03,-r*.3]],shade);
  rounded(ctx,-r*.39,r*.07,r*.79,r*.12,2,boss?'#3b344c':'#223344');rounded(ctx,-r*.04,r*.075,r*.11,r*.095,1,'#bcaa71');
  if(tank) {
    poly(ctx,[[-r*.42,-r*.43],[r*.42,-r*.43],[r*.32,r*.04],[-r*.31,r*.04]],gradient(ctx,-r*.4,-r*.5,r*.8,r*.5,[[0,'#bbc5af'],[.3,'#839785'],[1,'#455d63']]),'#293d45');
    line(ctx,-r*.28,-r*.24,r*.28,-r*.24,2,'#d0d9bb');line(ctx,-r*.23,-r*.03,r*.23,-r*.03,2,'#293c43');
    rounded(ctx,-r*.13,-r*.31,r*.26,r*.14,2,'#ffda83');
    for(const side of [-1,1])ellipse(ctx,side*r*.31,-r*.35,1.2,1.2,'#e3ebd1');
  } else if(boss) {
    for(const side of [-1,1]) {
      poly(ctx,[[side*r*.59,-r*.43],[side*r*.75,-r*.9],[side*r*.84,-r*.4]],'#e0d7c3','#8a708f');
      poly(ctx,[[side*r*.61,-r*.44],[side*r*.75,-r*.9],[side*r*.75,-r*.52]],'#fff0cc');
    }
    glow(ctx,0,-r*.14,r*.39,'#bf8aff4a');ellipse(ctx,0,-r*.14,r*.18,r*.21,'#513966');ellipse(ctx,-r*.02,-r*.17,r*.12,r*.14,'#d0a1ff');ellipse(ctx,-r*.03,-r*.2,r*.055,r*.06,'#fff4ff');
    line(ctx,-r*.31,r*.01,-r*.2,-r*.13,1.5,'#c49ee1');line(ctx,r*.31,r*.01,r*.2,-r*.13,1.5,'#c49ee1');
  } else {
    poly(ctx,[[-r*.1,r*.18],[-r*.03,r*.06],[r*.09,r*.19],[r*.18,r*.11],[r*.21,r*.2]],shade);
    line(ctx,r*.11,-r*.31,r*.23,-r*.17,1,'#dce6b85a');
    if(runner)line(ctx,-r*.27,-r*.37,-r*.24,-r*.01,2,'#f5b679');
    else rounded(ctx,r*.12,-r*.23,r*.18,r*.13,1,'#376177','#799f9b');
  }
  // Skull, brows, pointed ears and recessed luminous eyes.
  const headY=-r*(boss?.87:.89),headW=r*(boss?.49:tank?.44:.4),headH=r*(boss?.38:.36);
  ellipse(ctx,-headW*.97,headY+r*.01,r*.09,r*.13,shade);ellipse(ctx,headW*.97,headY+r*.01,r*.09,r*.13,shade);
  ctx.lineWidth=1.2;
  rounded(ctx,-headW,headY-headH,headW*2,headH*1.88,r*.15,gradient(ctx,-headW,headY-headH,headW*2,headH,[[0,light],[.32,skin],[1,shade]]),'#25433d');
  poly(ctx,[[-headW*.94,headY-headH*.2],[-headW*.58,headY+headH*.65],[headW*.6,headY+headH*.7],[headW*.96,headY-headH*.22],[headW*.52,headY+headH*.88],[-headW*.56,headY+headH*.89]],shade);
  poly(ctx,[[-headW*.66,headY-headH*.54],[-headW*.04,headY-headH*.3],[-headW*.05,headY-headH*.03],[-headW*.72,headY-headH*.14]],'#23383bd9');
  poly(ctx,[[headW*.68,headY-headH*.54],[headW*.05,headY-headH*.3],[headW*.06,headY-headH*.03],[headW*.73,headY-headH*.14]],'#23383bd9');
  const eyeColor=boss?'#ffc38f':runner?'#ffbe70':tank?'#f6e18a':'#e6ffb6';
  for(const side of [-1,1]) {
    const ex=side*headW*.37,ey=headY-headH*.2;
    ellipse(ctx,ex,ey,r*.074,r*.043,eyeColor);ellipse(ctx,ex+side*r*.013,ey,r*.022,r*.037,'#325843');
    if(boss)glow(ctx,ex,ey,r*.14,'#ff9a6c4d');
  }
  poly(ctx,[[0,headY-headH*.1],[-r*.055,headY+r*.1],[r*.065,headY+r*.1]],shade);
  rounded(ctx,-headW*.48,headY+headH*.42,headW*.98,r*.105,1,'#273531');
  for(let i=0;i<(boss?5:3);i++)ctx.fillStyle='#dce4be',ctx.fillRect(-headW*.36+i*r*.1,headY+headH*.43,r*.055,r*.048);
  line(ctx,-headW*.63,headY-headH*.72,-headW*.29,headY-headH*.79,1,'#ffffff60');
  if(tank) {
    poly(ctx,[[-headW*1.15,headY-headH*.31],[-headW*.98,headY-headH*1.03],[-headW*.4,headY-headH*1.25],[headW*.76,headY-headH*1.14],[headW*1.15,headY-headH*.38]],gradient(ctx,-headW,headY-headH*1.1,headW*2,headH*.5,[[0,'#bdcab3'],[.45,'#819686'],[1,'#405661']]),'#344c51');
    line(ctx,-headW*1.14,headY-headH*.32,headW*1.14,headY-headH*.4,3,'#263d43');
    rounded(ctx,-r*.08,headY-headH*1.06,r*.15,r*.12,1,'#ffdf90');
  } else if(runner) {
    poly(ctx,[[-headW,headY-headH*.71],[-headW*.7,headY-headH*1.1],[-r*.08,headY-headH*1.27],[r*.15,headY-headH*1.11],[headW*.9,headY-headH*.58]],'#364345');
    line(ctx,-r*.1,headY-headH*1.05,r*.14,headY-headH*.99,1,'#81a996');
  } else if(!boss) {
    poly(ctx,[[-headW*.9,headY-headH*.72],[-headW*.62,headY-headH*1.02],[headW*.07,headY-headH*1.17],[headW*.43,headY-headH*.8]],'#465b4c');
  } else {
    line(ctx,-headW*.51,headY-headH*.8,-headW*.28,headY-headH*.4,2,'#6c4585');
    line(ctx,headW*.46,headY+headH*.14,headW*.63,headY+headH*.46,1.7,'#d5a6e8');
  }
  if(e.hit>0) {
    const a=clamp(e.hit/.12,0,1);ctx.globalAlpha=a*.64;
    glow(ctx,0,-r*.32,r*1.15,'#ffebbb85');
    line(ctx,-r*.7,-r*.6,r*.68,r*.4,2,'#fff5bc');ctx.globalAlpha=1;
  }
  ctx.restore();
}

export function vehicle(ctx,x,y,power,recoil,time) {
  ctx.save();ctx.translate(x,y);ctx.lineJoin='round';ctx.lineCap='round';
  const rumble=Math.sin(time*44)*.32,shot=clamp(recoil/2.7,0,1);
  ellipse(ctx,4,23,38,13,'#020b1c66');ellipse(ctx,0,17,28,8,'#020b1c4d');
  // Headlight cones are low opacity; the projectiles stay the brightest elements.
  for(const side of [-1,1]) {
    poly(ctx,[[side*19-3,-25],[side*19+3,-25],[side*19+15,-101],[side*19-13,-101]],gradient(ctx,0,-101,0,80,[[0,'#d5ffec00'],[1,'#d5ffec14']]));
    glow(ctx,side*19,-27,13,'#bdfde932');
  }
  ctx.translate(0,rumble);
  for(const side of [-1,1]) {
    rounded(ctx,side*27-8,-28,16,57,5,'#091626','#596774');
    rounded(ctx,side*27-6,-26,12,53,4,'#293747');
    ctx.save();ctx.beginPath();ctx.roundRect(side*27-6,-26,12,53,4);ctx.clip();
    for(let i=0;i<9;i++) {
      const yy=-33+(i*8+time*105)%68;
      rounded(ctx,side*27-5,yy,10,4,1,'#4d6172');line(ctx,side*27-4,yy,side*27+4,yy,1,'#869195');
    }
    ctx.restore();line(ctx,side*27-side*5,-21,side*27-side*5,22,1,'#182638');
  }
  poly(ctx,[[-24,-29],[-17,-37],[17,-37],[24,-29],[26,16],[18,26],[-18,26],[-26,16]],gradient(ctx,-26,-35,52,52,[[0,'#b9ede3'],[.15,'#65c4bd'],[.5,'#268b94'],[1,'#1c4a65']]),'#11293a');
  poly(ctx,[[-24,-27],[-17,-34],[-13,-32],[-16,20],[-23,15]],'#baf5dc59');
  poly(ctx,[[17,-34],[24,-27],[25,14],[17,21],[14,8]],'#143f54');
  poly(ctx,[[-16,20],[16,20],[18,25],[-18,25]],'#163d55');
  line(ctx,-17,-35,17,-35,1.5,'#e2ffe7');line(ctx,-24,-26,-21,15,1,'#ddffe960');
  // Armored nose, hatch seams and bolts replace a single flat car rectangle.
  poly(ctx,[[-16,-30],[16,-30],[17,-13],[-17,-13]],gradient(ctx,0,-30,0,17,[[0,'#9de4d2'],[1,'#4698a1']]),'#347a8a');
  rounded(ctx,-10,-30,20,3,1,'#244b60');
  for(const side of [-1,1]) {
    rounded(ctx,side*18-4,-30,8,6,2,'#102e41');rounded(ctx,side*18-3,-29,6,3,1,'#edffbc');
    line(ctx,side*22,-17,side*24,-5,2,'#c5e9bf');ellipse(ctx,side*20,15,1.5,1.5,'#b9dace');
  }
  rounded(ctx,-18,6,36,13,4,'#15374e','#8acab6');
  rounded(ctx,-14,8,28,8,2,gradient(ctx,-14,8,28,8,[[0,'#58a7b2'],[.5,'#173e58'],[1,'#0d2943']]));
  poly(ctx,[[-12,9],[2,9],[-6,15],[-12,15]],'#b9fff053');line(ctx,-1,8,-1,16,1,'#5f9dab');
  // A tiny helmeted driver is visible through the rear canopy.
  ellipse(ctx,7,12,3.2,3.2,'#c9d7a8');rounded(ctx,4.5,11.5,5,1.4,1,'#153741');
  for(const side of [-1,1]) {
    rounded(ctx,side*20-3,20,6,3,1,'#fc8e7c');glow(ctx,side*20,21,7,'#ff716b22');
  }
  for(let i=0;i<3;i++)line(ctx,-8+i*8,21,-8+i*8,23,2,'#101e2e');
  // Rotating turret housing: circular bevel, luminous power ring and brass details.
  ellipse(ctx,1,-5,19,15,'#102e43');
  ellipse(ctx,0,-9,18,15,gradient(ctx,-18,-24,36,26,[[0,'#d4f1cf'],[.18,'#82cfc3'],[.55,'#479b9f'],[1,'#194b64']]));
  ctx.strokeStyle='#c4f6c75c';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-10,15,12,0,Math.PI,TAU);ctx.stroke();
  ctx.strokeStyle=power>=8?'#d7a5ff':power>=4?'#bfff81':'#8ceaf5';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-9,15,11,0,.12,Math.PI-.12);ctx.stroke();
  rounded(ctx,-10,-13,20,12,4,'#377187','#143a50');
  const barrels=Math.min(power,3);
  for(let i=0;i<barrels;i++) {
    const bx=(i-(barrels-1)/2)*10,top=-45+recoil;
    rounded(ctx,bx-4.4,top,8.8,32,2,'#1c3e52');
    rounded(ctx,bx-3.4,top+2,6.8,28,1,gradient(ctx,bx-4,0,8,0,[[0,'#f3f5d6'],[.28,'#a9cfcd'],[.65,'#547d94'],[1,'#243f57']]));
    for(let band=0;band<3;band++)rounded(ctx,bx-4.3,top+13+band*5,8.6,2,1,'#375265');
    rounded(ctx,bx-5,top-2,10,8,2,'#213749','#87b9bb');rounded(ctx,bx-3.3,top,6.6,3,1,'#071c2c');
    if(shot>.08) {
      const flare=7+shot*8,pulse=1+Math.sin(time*120)*.2;
      glow(ctx,bx,top-4,flare*2,'#ffcd6a65');
      poly(ctx,[[bx-4,top-2],[bx-7*pulse,top-8],[bx-3,top-10],[bx,top-10-flare],[bx+3,top-10],[bx+7*pulse,top-8],[bx+4,top-2]],'#ffc665');
      poly(ctx,[[bx-3,top-2],[bx-2,top-8],[bx,top-14-shot*7],[bx+2,top-8],[bx+3,top-2]],'#fffce3');
    }
  }
  rounded(ctx,-6,-7,12,6,2,'#dfbd75','#b59159');line(ctx,-3,-6,3,-6,1,'#fff0b4');
  line(ctx,12,-8,17,-33,1.5,'#213b4d');ellipse(ctx,17,-33,1.4,1.4,'#b8f9a0');
  ctx.restore();
}

export function missionComplete(level,kills,blocks) {
  const m=mission(level);return m.type===0?kills>=m.target:m.type===1?blocks>=m.target:true;
}
