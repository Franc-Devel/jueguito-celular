import {clamp} from './engine.js';
import {levelPlan} from './campaign.js';
const TAU=Math.PI*2;
export const zones=[
 {name:'Puentes de Escarcha',sky:'#66c8ed',haze:'#dff5ff',ground:'#edf5f7',road:'#b6b2b1',accent:'#80ddff',water:'#72bed9'},
 {name:'Valle de las Banderas',sky:'#78cde6',haze:'#d0eff7',ground:'#7dba81',road:'#c2b6a0',accent:'#ffce67',water:'#4aabc5'},
 {name:'Bosque Encantado',sky:'#8a99d4',haze:'#d8dbf4',ground:'#407d72',road:'#a4a8b7',accent:'#bdb0ff',water:'#6b87ba'},
 {name:'Fortalezas del Alba',sky:'#7ea9dc',haze:'#ffdfb6',ground:'#d0ad7a',road:'#c5af97',accent:'#ffd881',water:'#6bafbd'},
 {name:'Trono de Ceniza',sky:'#665187',haze:'#e0a6a0',ground:'#665366',road:'#928898',accent:'#ffa39e',water:'#c06461'}
];
let scene={id:1,roadStyle:'straight',weather:'snow',timeOfDay:'day'},friendlyBudget=1400,enemyBudget=1200;
export function configureScene(plan={}){scene={id:plan.id||1,roadStyle:plan.roadStyle||'straight',weather:plan.weather||'clear',timeOfDay:plan.timeOfDay||'day'};}
function offset(d,w){const t=clamp(d/.82,0,1),fade=(1-t)**2;return scene.roadStyle==='leftBend'?-w*.15*fade:scene.roadStyle==='rightBend'?w*.15*fade:scene.roadStyle==='sCurve'?w*.13*Math.sin((1-t)*TAU)*Math.sin(t*Math.PI):scene.roadStyle==='split'?w*.035*Math.sin(t*Math.PI)*fade:0;}
export function project(x,y,w,h){const depth=clamp(y/h,0,1),scale=.48+.52*depth;return {x:w/2+offset(depth,w)+(x-w/2)*scale,y:66+y*(h-66)/h,scale};}
export function place(c,x,y,w,h){const p=project(x,y,w,h);c.save();c.translate(p.x,p.y);c.scale(p.scale,p.scale);c.translate(-x,-y);}
// Enlarge actors at their projected position; world coordinates and collisions stay unchanged.
export function placeReadable(c,x,y,w,h,boost=1){const p=project(x,y,w,h),scale=Math.max(.9,p.scale)*boost;c.save();c.translate(p.x,p.y);c.scale(scale,scale);c.translate(-x,-y);}
export function mission(level){const p=levelPlan(level),zone=zones[clamp(Math.floor((p.id-1)/20),0,4)],type=p.requiredCaches?3:p.requiredBlocks?1:p.killTarget?0:2;return {...p,zone,type,name:p.title,target:type===3?p.requiredCaches:type===1?p.requiredBlocks:p.killTarget};}
export function missionComplete(level,kills,blocks,extras={}){const m=mission(level);return kills>=m.killTarget&&blocks>=m.requiredBlocks&&(extras.caches||0)>=m.requiredCaches&&(extras.rescues||0)>=m.requiredRescues&&(extras.mines||0)>=m.requiredMines&&(extras.bases||0)>=m.requiredBases&&(extras.mutations||0)>=m.requiredMutations&&(!m.requiredPath||!!extras.path)&&(!m.cart||(extras.cart||0)>0);}
const ellipse=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const box=(c,x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const poly=(c,points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const line=(c,x,y,x2,y2,width,color)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
function ribbon(c,w,h,lo,hi,color){const points=[];for(let i=0;i<=24;i++){const p=project(lo,i*h/24,w,h);points.push([p.x,p.y]);}for(let i=24;i>=0;i--){const p=project(hi,i*h/24,w,h);points.push([p.x,p.y]);}poly(c,points,color);}
function trace(c,w,h,x,y,y2,color,width){c.strokeStyle=color;c.lineWidth=width;c.beginPath();for(let i=0;i<=12;i++){const p=project(x,y+(y2-y)*i/12,w,h);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.stroke();}
function pine(c,x,y,scale,snow){c.save();c.translate(x,y);c.scale(scale,scale);box(c,-2,-22,4,24,1,'#806e69');for(let i=0;i<3;i++){const yy=-47+i*12,ww=10+i*4;poly(c,[[-ww,yy+20],[0,yy],[ww,yy+20]],snow?'#d9eaf0':'#286c5d');poly(c,[[0,yy],[ww,yy+20],[2,yy+17]],snow?'#b8d2dd':'#1c524c');}c.restore();}
export function road(c,w,h,time,level,economy=false){
 friendlyBudget=economy?650:1400;enemyBudget=economy?650:1200;const zone=Math.min(4,Math.floor((level-1)/20)),z=zones[zone],night=scene.timeOfDay==='night';c.save();
 const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,night?'#384579':z.sky);sky.addColorStop(.24,z.haze);sky.addColorStop(1,z.ground);c.fillStyle=sky;c.fillRect(0,0,w,h);
 c.fillStyle=z.water;c.fillRect(0,90,w,h-90);for(let i=0;i<35;i++){const yy=100+(i*37+time*12)%(h-100);line(c,((i*79+time*4)%w),yy,((i*79+time*4)%w)+27,yy,1,'#ffffff27');}
 for(const side of [-1,1]){const x=w/2+side*w*.46;c.fillStyle=z.ground;c.fillRect(side<0?0:x,100,w*.2,h);for(let i=0;i<7;i++){const yy=(i*(h+90)/7+time*37)%(h+90),p=project(w/2+side*w*.7,yy,w,h);pine(c,p.x,p.y,p.scale*.85,zone===0||scene.weather==='snow');}}
 // Far castle silhouettes and blue pennants establish a medieval battlefield.
 for(let i=0;i<5;i++){const x=w*.5+(i-2)*24;box(c,x-10,65-(i%2)*16,20,48+(i%2)*16,2,'#7f899e');for(let j=0;j<3;j++)box(c,x-12+j*9,60-(i%2)*16,6,9,1,'#e3e0df');poly(c,[[x-14,65-(i%2)*16],[x,42-(i%2)*16],[x+14,65-(i%2)*16]],'#566887');}
 ribbon(c,w,h,-w*.015,w*1.015,'#ddd4ce');ribbon(c,w,h,w*.035,w*.965,z.road);
 c.save();ribbon(c,w,h,w*.035,w*.965,z.road);c.clip();
 for(let i=0;i<20;i++){const yy=(i*48+time*52)%(h+60)-30;const a=project(w*.035,yy,w,h),b=project(w*.965,yy,w,h);line(c,a.x,a.y,b.x,b.y,1,'#716e732b');for(let j=0;j<7;j++)trace(c,w,h,w*(j/7+(i%2?1/14:0)),yy,yy+48,'#716e7325',1);}
 ribbon(c,w,h,w*.045,w*.18,'#50caff19');ribbon(c,w,h,w*.82,w*.955,'#ffd25924');
 for(let i=0;i<14;i++){const yy=(i*53+time*52)%(h+80)-40;for(const side of [-1,1]){const p=project(w/2+side*w*.435,yy,w,h);box(c,p.x-8*p.scale,p.y-8*p.scale,16*p.scale,4*p.scale,1,side<0?'#70cfff':'#ffe085');}}
 c.restore();
 for(const side of [-1,1]){trace(c,w,h,w/2+side*w*.483,0,h,'#e9e3df',12);trace(c,w,h,w/2+side*w*.492,0,h,'#8f929d',4);for(let i=0;i<18;i++){const yy=(i*45+time*52)%(h+70)-35;if(yy<0)continue;const p=project(w/2+side*w*.489,yy,w,h);box(c,p.x-6*p.scale,p.y-19*p.scale,12*p.scale,21*p.scale,1,'#bfc3cd');box(c,p.x-7*p.scale,p.y-21*p.scale,14*p.scale,5*p.scale,1,'#f6f4f1');if(i%5===0){line(c,p.x,p.y-22*p.scale,p.x,p.y-53*p.scale,2*p.scale,'#866e63');poly(c,[[p.x,p.y-53*p.scale],[p.x-side*17*p.scale,p.y-49*p.scale],[p.x,p.y-40*p.scale]],side<0?'#45baff':'#d86668');}}}
 if(scene.roadStyle==='split'){ribbon(c,w,h,w*.475,w*.525,'#dbcac454');for(let i=0;i<4;i++){const p=project(w*.5,i*h*.12,w,h);box(c,p.x-4,p.y,8,8,2,'#f2e4cd');}}
 if(scene.roadStyle==='narrow')for(const side of [-1,1])trace(c,w,h,w/2+side*w*.35,0,h,'#826b6c55',5);
 if(scene.weather==='fog'){const fog=c.createLinearGradient(0,65,0,h*.7);fog.addColorStop(0,'#eef9ff98');fog.addColorStop(1,'#eef9ff00');c.fillStyle=fog;c.fillRect(0,65,w,h*.7);}
 if(scene.weather==='snow'||zone===0)for(let i=0;i<23;i++)ellipse(c,(i*53+Math.sin(time*.6+i)*10+w)%w,(i*89+time*26)%h,1.5,1.8,'#ffffffb0');
 if(scene.weather==='rain'){c.strokeStyle='#d7f3ff77';c.lineWidth=1;c.beginPath();for(let i=0;i<25;i++){const x=(i*73-time*30+w*9)%w,y=(i*89+time*270)%h;c.moveTo(x,y);c.lineTo(x-4,y+10);}c.stroke();}
 c.restore();
}
const sprites=new Map();
function soldierSprite(team,guard,frame){const key=team+guard+frame;if(sprites.has(key))return sprites.get(key);const canvas=document.createElement('canvas');canvas.width=36;canvas.height=46;const c=canvas.getContext('2d'),blue=team==='blue',light=blue?'#52c6ff':team==='red-fast'?'#ff9a57':'#ff636d',dark=blue?'#176bc7':team==='red-fast'?'#bf3c31':'#b52340',step=frame%2?2:-2;c.translate(18,25);
 ellipse(c,0,13,9,3,'#1c294746');box(c,-6,5+step,4,9,1,'#28436b');box(c,2,5-step,4,9,1,'#28436b');box(c,-9,-10,18,17,4,dark);poly(c,[[-7,-7],[-5,10],[0,14],[5,10],[7,-7]],light);box(c,-5,-15,10,9,2,'#ffddbe');ellipse(c,0,-15,8,7,guard?'#d5deee':light);box(c,-9,-13,18,4,2,guard?'#7c899f':dark);line(c,0,-23,0,-17,3,blue?'#d9faff':'#ffd6a3');if(!blue){box(c,-5,-11,10,4,1,'#45273b');box(c,-3,-10,2,1,0,'#ffebbc');box(c,2,-10,2,1,0,'#ffebbc');}line(c,10,6,12,-9,2,'#ecf2f7');box(c,8,2,8,2,0,'#ffc95e');if(guard){ellipse(c,-10,0,7,9,blue?'#47baff':'#ce3449');line(c,-10,-5,-10,5,1,'#ffe5a5');}sprites.set(key,canvas);return canvas;}
function crowd(c,x,y,units,team,time,guard=false){
 const budget=team==='blue'?friendlyBudget:enemyBudget;if(budget<=0)return;const count=Math.min(Math.max(1,Math.ceil(units)),team==='blue'?99:65,budget),columns=Math.min(8,Math.ceil(Math.sqrt(count))),gap=team==='blue'?12:13,frame=Math.floor(time*7+x*.09)%4;
 for(let i=0;i<count;i++){const row=Math.floor(i/columns),xx=x+(i%columns-(columns-1)/2)*gap,yy=y+(team==='blue'?1:-1)*row*11;const sprite=soldierSprite(team,guard,(frame+i)%4);c.drawImage(sprite,xx-11,yy-23,22,29);}
 if(team==='blue')friendlyBudget-=count;else enemyBudget-=count;
 if(units>count&&units>=30){c.font='900 16px system-ui';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#162444';c.strokeText(String(Math.ceil(units)),x,y+28);c.fillStyle=team==='blue'?'#c6f5ff':'#ffe2e4';c.fillText(String(Math.ceil(units)),x,y+28);}
}
export function blueTroops(c,b,time){crowd(c,b.x,b.y,b.units||1,'blue',time,b.pierceLeft>0||b.rank>1);if(b.freeze){c.strokeStyle='#b2ffff88';c.lineWidth=1;c.beginPath();c.ellipse(b.x,b.y,13,21,0,0,TAU);c.stroke();}}
function giant(c,e,time){const r=e.r,step=Math.sin(time*5)*r*.1;c.save();c.translate(e.x,e.y);c.scale(1.65,1.65);ellipse(c,2,r*.65,r*.9,r*.3,'#3a294864');for(const side of [-1,1]){box(c,side*r*.28-r*.13,r*.12+side*step,r*.3,r*.5,4,'#452a42');box(c,side*r*.31-r*.18,r*.51+side*step,r*.39,r*.2,4,'#7b253d');ellipse(c,side*r*.57,-r*.28,r*.28,r*.25,'#d65362');ellipse(c,side*r*.57-r*.06,-r*.35,r*.17,r*.1,'#ffb1a3');line(c,side*r*.69,-r*.08,side*r*.73,r*.19,r*.21,'#a32949');}
 poly(c,[[-r*.5,-r*.48],[r*.5,-r*.48],[r*.38,r*.25],[-r*.36,r*.25]],'#b72d4b');poly(c,[[-r*.45,-r*.44],[r*.36,-r*.44],[r*.27,-r*.18],[-r*.3,-r*.09]],'#ee6870');line(c,-r*.35,r*.07,r*.32,r*.07,r*.07,'#f3cc7b');ellipse(c,0,-r*.85,r*.42,r*.38,'#abb7c8');box(c,-r*.43,-r*.8,r*.86,r*.14,3,'#3a2944');for(const side of [-1,1])ellipse(c,side*r*.16,-r*.74,r*.06,r*.032,'#fff2b4');for(const x of [-.19,0,.19])box(c,x*r-r*.035,-r*1.11,r*.07,r*.22,1,'#6e7d95');
 const king=e.bossKind==='king';poly(c,[[-r*.28,-r*1.14],[-r*.31,-r*1.38],[-r*.12,-r*1.25],[0,-r*1.43],[r*.12,-r*1.25],[r*.31,-r*1.38],[r*.28,-r*1.14]],king?'#ffe38b':'#bf384e');if(e.bossKind==='armored'||king){ellipse(c,-r*.72,r*.02,r*.36,r*.5,'#d85e6c');ellipse(c,-r*.72,r*.02,r*.24,r*.34,'#6a3147');line(c,-r*.72,-r*.22,-r*.72,r*.24,r*.04,'#ffe394');}line(c,r*.77,r*.19,r*.95,-r*.84,r*.09,'#dde5ee');line(c,r*.58,-r*.02,r*.98,r*.08,r*.09,'#e6bf73');c.restore();}
export function redArmy(c,e,time){if(e.boss){giant(c,e,time);return;}if(e.kind==='barricade'){c.save();c.translate(e.x,e.y);for(let i=0;i<7;i++){const x=(i-3)*8;poly(c,[[x-4,10],[x-4,-15],[x,-23],[x+4,-15],[x+4,10]],i%2?'#957453':'#b78c62');}line(c,-28,-7,28,-7,4,'#5f4a3d');line(c,-28,5,28,5,4,'#5f4a3d');c.restore();return;}crowd(c,e.x,e.y,e.hp,e.kind==='runner'?'red-fast':'red',time*(e.kind==='runner'?1.5:1),e.kind==='tank');}
export function vehicle(c,x,y,power,recoil,time,width=420,height=550){const scale=power>16?1.05:power>4?1.3:1.7,space=Math.min(x,width-x)*2/scale,columns=Math.max(1,Math.min(power,6,Math.floor((space-26)/20)+1)),rows=Math.ceil(power/columns),rowGap=Math.min(20,Math.max(5,(height*.45-48)/Math.max(1,rows-1)));c.save();c.translate(x,y);c.scale(scale,scale);for(let i=power-1;i>=0;i--){const row=Math.floor(i/columns),xx=(i%columns-(Math.min(columns,power-row*columns)-1)/2)*20,yy=-row*rowGap;ellipse(c,xx+2,yy+11,11,4,'#17314b45');box(c,xx-9,yy,18,10,3,'#8c6550');for(const side of [-1,1]){ellipse(c,xx+side*9,yy+5,4,5,'#58433a');ellipse(c,xx+side*9,yy+5,2.5,3.5,'#c1a07b');}box(c,xx-5,yy-20+recoil*.3,10,25,4,'#167eb6');box(c,xx-3,yy-20+recoil*.3,5,23,2,'#69d9ff');ellipse(c,xx,yy-19+recoil*.3,5,3,'#12354e');line(c,xx-5,yy-5,xx+5,yy-5,2,'#a7e8f5');if(recoil>1&&i%3===0)ellipse(c,xx,yy-24,3+Math.sin(time*30),6,'#d5faff88');}c.restore();}
