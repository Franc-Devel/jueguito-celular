import {clamp} from './engine.js';
export const zones=[
 {name:'Ruta del éxodo',sky:'#d58469',haze:'#ffc590',ground:'#a88460',road:'#414654',accent:'#ffd36d'},
 {name:'Ciudad en cuarentena',sky:'#655787',haze:'#ed97a2',ground:'#484c62',road:'#343b4b',accent:'#ff8ea4'},
 {name:'Bosque infectado',sky:'#356b70',haze:'#a5d8b5',ground:'#386252',road:'#3b4547',accent:'#8df4ae'},
 {name:'Paso congelado',sky:'#7194be',haze:'#d7edf6',ground:'#a5c2d2',road:'#526176',accent:'#9ce8ff'},
 {name:'Zona cero',sky:'#462c62',haze:'#ef7f87',ground:'#5b4659',road:'#352e43',accent:'#da99ff'}
];
export function mission(level){const zone=zones[Math.min(4,Math.floor((level-1)/20))];const type=(level-1)%3;return {zone,type,name:['Frená la horda','Rompé el bloqueo','Cazá al mutante'][type],target:type===0?6+Math.min(12,Math.floor(level/8)):type===1?2:1};}
export function project(x,y,w,h){const depth=clamp(y/h,0,1),scale=.48+.52*depth;return {x:w/2+(x-w/2)*scale,y:66+y*(h-66)/h,scale};}
export function place(ctx,x,y,w,h){const p=project(x,y,w,h);ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.scale,p.scale);ctx.translate(-x,-y);}
const poly=(ctx,points,color)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
export function road(ctx,w,h,time,level){const z=mission(level).zone,bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,z.sky);bg.addColorStop(.2,z.haze);bg.addColorStop(1,z.ground);ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
ctx.fillStyle='#ffe2a970';ctx.beginPath();ctx.arc(w*.76,31,20,0,7);ctx.fill();
for(let i=0;i<15;i++){const x=i*w/14,height=12+(i*17)%38;ctx.fillStyle=level>20&&level<=40?'#30344666':'#34475140';if(level>20&&level<=40){ctx.fillRect(x,66-height,w/13,height);ctx.fillStyle='#ffdd9950';ctx.fillRect(x+5,70-height,3,4);}else poly(ctx,[[x-22,66],[x,66-height],[x+28,66]],'#34475150');}
poly(ctx,[[w*.23,66],[w*.77,66],[w, h],[0,h]],'#ddd8c1');poly(ctx,[[w*.25,66],[w*.75,66],[w*.96,h],[w*.04,h]],z.road);
ctx.strokeStyle='#ffffff35';ctx.lineWidth=2;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(w/2+side*w*.24,66);ctx.lineTo(w/2+side*w*.45,h);ctx.stroke();}
for(let i=0;i<13;i++){const y=((i*70+time*90)%(h+70))-50;for(const x of [w/3,w*2/3]){const a=project(x,y,w,h),b=project(x,y+27,w,h);ctx.strokeStyle='#eee5c587';ctx.lineWidth=3*a.scale;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
for(let i=0;i<8;i++){const y=((i*109+time*65)%(h+100))-60,p=project(0,y,w,h),side=i%2?-1:1,x=w/2+side*(w*.27+w*.25*clamp(y/h,0,1));ctx.save();ctx.translate(x,p.y);ctx.scale(p.scale,p.scale);if(level>40&&level<=60){poly(ctx,[[-14,8],[0,-35],[14,8]],'#214c3e');ctx.fillStyle='#735344';ctx.fillRect(-3,4,6,14);}else{ctx.fillStyle='#393d4870';ctx.beginPath();ctx.ellipse(0,10,18,6,0,0,7);ctx.fill();ctx.fillStyle=i%3?'#77675c':'#8476a0';ctx.beginPath();ctx.roundRect(-13,-12,26,22,5);ctx.fill();ctx.fillStyle='#253647';ctx.fillRect(-9,-8,18,7);}ctx.restore();}
}
export function zombie(ctx,e,time){const r=e.r,t=Math.sin(time*(e.kind==='runner'?15:7)+e.x),boss=e.boss,color=e.hit>0?'#fff8c2':boss?'#bf80e9':e.kind==='tank'?'#9ebb6d':'#80d5a1';
ctx.fillStyle='#10192050';ctx.beginPath();ctx.ellipse(e.x,e.y+r*.9,r*.9,r*.3,0,0,7);ctx.fill();ctx.save();ctx.translate(e.x,e.y);ctx.rotate(t*.07);
if(e.kind==='barricade'){ctx.fillStyle='#433c37';ctx.fillRect(-r,-r/2,r*2,r);ctx.fillStyle='#ffce67';ctx.fillRect(-r,-r/2,r*2,8);ctx.fillStyle='#302c33';for(let i=-r;i<r;i+=12)poly(ctx,[[i,-r/2],[i+6,-r/2],[i+12,-r/2+8],[i+6,-r/2+8]],'#302c33');ctx.fillStyle='#dc8564';ctx.fillRect(-r*.6,0,r*1.2,6);ctx.restore();return;}
ctx.strokeStyle='#293948';ctx.lineWidth=r*.35;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-r*.3,r*.2);ctx.lineTo(-r*.35-t*3,r*.85);ctx.moveTo(r*.3,r*.2);ctx.lineTo(r*.35+t*3,r*.85);ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=r*.25;ctx.beginPath();ctx.moveTo(-r*.4,-r*.25);ctx.lineTo(-r*.9,-r*.55+t*3);ctx.moveTo(r*.4,-r*.25);ctx.lineTo(r*.9,-r*.55-t*3);ctx.stroke();ctx.fillStyle=boss?'#755296':e.kind==='tank'?'#66794b':'#457184';ctx.beginPath();ctx.roundRect(-r*.5,-r*.5,r,r*.9,4);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(-r*.47,-r*1.15,r*.94,r*.8,5);ctx.fill();ctx.fillStyle='#24293c';ctx.fillRect(-r*.27,-r*.87,r*.17,r*.16);ctx.fillRect(r*.1,-r*.87,r*.17,r*.16);ctx.fillRect(-r*.2,-r*.57,r*.4,2);if(boss){poly(ctx,[[-r*.4,-r*1.1],[-r*.5,-r*1.5],[-r*.05,-r*1.17]],'#ffe18b');poly(ctx,[[r*.4,-r*1.1],[r*.5,-r*1.5],[r*.05,-r*1.17]],'#ffe18b');}ctx.restore();
}
export function vehicle(ctx,x,y,power,recoil,time){ctx.fillStyle='#030e2960';ctx.beginPath();ctx.ellipse(x,y+17,32,12,0,0,7);ctx.fill();ctx.fillStyle='#242d3e';for(const side of [-1,1]){ctx.beginPath();ctx.roundRect(x+side*23-7,y-24,14,47,5);ctx.fill();ctx.fillStyle='#556075';for(let i=0;i<5;i++)ctx.fillRect(x+side*23-5,y-19+i*8,10,3);ctx.fillStyle='#242d3e';}const fill=ctx.createLinearGradient(x-22,y,x+22,y);fill.addColorStop(0,'#16a5c2');fill.addColorStop(.5,'#7dedeb');fill.addColorStop(1,'#2589ad');ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x-22,y-26,44,50,9);ctx.fill();ctx.fillStyle='#183e57';ctx.beginPath();ctx.roundRect(x-15,y+6,30,12,4);ctx.fill();ctx.fillStyle='#ffe59a';ctx.fillRect(x-20,y-24,7,5);ctx.fillRect(x+13,y-24,7,5);ctx.fillStyle='#6fc0cf';ctx.beginPath();ctx.arc(x,y-8,16,0,7);ctx.fill();const barrels=Math.min(power,3);for(let i=0;i<barrels;i++){const bx=x+(i-(barrels-1)/2)*10;ctx.fillStyle='#e2faff';ctx.fillRect(bx-4,y-42+recoil,8,29);ctx.fillStyle='#355571';ctx.fillRect(bx-4,y-42+recoil,8,5);if(recoil>0){poly(ctx,[[bx-6,y-44],[bx,y-54-Math.sin(time*30)*4],[bx+6,y-44]],'#ffdc7f');}}
}

export function missionComplete(level,kills,blocks){const m=mission(level);return m.type===0?kills>=m.target:m.type===1?blocks>=m.target:true;}
