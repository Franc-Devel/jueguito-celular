import {mission,missionComplete,project,place,road,zombie,vehicle} from './scenery.js';
import {clamp,levelConfig,gatePower,freshState,volley,multiplyAtGate,projectileHit,resizeWorld,routeReward} from './engine.js';
import {routeOptions,drawFork,drawRouteTarget} from './routes.js';
import {GameAudio} from './audio.js';

const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
const audio=new GameAudio(),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const storage={get(key,fallback){try{return localStorage.getItem(key)??fallback;}catch{return fallback;}},set(key,value){try{localStorage.setItem(key,String(value));}catch{}}};
let unlocked=clamp(Number(storage.get('pulso-unlocked',1))||1,1,100);
let record=Number(storage.get('pulso-record',0))||0;
let unlockedGear=[];try{const saved=JSON.parse(storage.get('pulso-gear','[]'));if(Array.isArray(saved))unlockedGear=saved.filter(x=>['shield','rapid','blast'].includes(x));}catch{}
let loadout=storage.get('pulso-loadout','standard');if(!unlockedGear.includes(loadout))loadout='standard';
function refreshArsenal(){const names={standard:'Cañón estándar',shield:'Escudo · 1 carga',rapid:'Ráfaga · tiro rápido',blast:'Explosivo · daño de área'};for(const option of $('weapon').options){option.disabled=option.value!=='standard'&&!unlockedGear.includes(option.value);option.textContent=option.disabled?`${names[option.value].split(' · ')[0]} · abrir taller`:names[option.value];}$('weapon').value=loadout;}
refreshArsenal();$('weapon').onchange=()=>{loadout=$('weapon').value;storage.set('pulso-loadout',loadout);};

let level=unlocked,s=freshState(level),mode='menu',W=420,H=550,last=0,keys=new Set();
let quality=storage.get('pulso-quality','auto'),economy=false,slowFrames=0,activePointer=null;
const glowing=new Map();

function show(title,message,label='Volver a intentar',badge='UN NUEVO INTENTO'){
  $('title').innerHTML=title;$('message').textContent=message;
  $('play').innerHTML=label+' <span>↗</span>';$('badge').textContent=badge;$('overlay').hidden=false;
}
function resize(){
  const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
  if(r.width!==W||r.height!==H)resizeWorld(s,W,H,r.width,r.height);
  W=r.width;H=r.height;
  const d=Math.min(devicePixelRatio||1,quality==='low'||economy?1.25:2);
  canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);
}
new ResizeObserver(resize).observe(canvas);
$('quality').value=['auto','high','low'].includes(quality)?quality:'auto';
quality=$('quality').value;
$('quality').onchange=()=>{quality=$('quality').value;economy=quality==='low';slowFrames=0;storage.set('pulso-quality',quality);resize();};
function updateSound(){
  $('sound').textContent=audio.enabled?'Sonido: sí':'Sonido: no';
  $('sound').setAttribute('aria-pressed',String(audio.enabled));
  $('sound').setAttribute('aria-label',audio.enabled?'Desactivar sonido':'Activar sonido');
}
updateSound();
$('sound').onclick=()=>{audio.setEnabled(!audio.enabled);audio.unlock();audio.setPlaying(mode==='playing');audio.play('gate');updateSound();};
function start(){
  audio.unlock();s=freshState(level);if(loadout!=='standard')routeReward(s,loadout);label(mission(level).name,W/2,H*.4,'#ffe5a1');
  mode='playing';audio.setPlaying(true);$('overlay').hidden=true;$('pause').textContent='II';
  $('pause').setAttribute('aria-label','Pausar juego');canvas.focus();audio.play('gate');
}
function resume(){audio.unlock();mode='playing';audio.setPlaying(true);$('overlay').hidden=true;$('pause').textContent='II';$('pause').setAttribute('aria-label','Pausar juego');}
$('play').onclick=()=>mode==='paused'?resume():start();
function pause(){
  if(mode==='paused'){resume();return;}if(mode!=='playing')return;
  mode='paused';audio.setPlaying(false);$('pause').textContent='▶';$('pause').setAttribute('aria-label','Continuar juego');
  show('Un respiro.','Tu convoy te espera.','Continuar','EN PAUSA');
}
$('pause').onclick=pause;
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();});
$('levels').onclick=()=>{
  if(mode==='playing')pause();
  $('grid').replaceChildren();
  for(let i=1;i<=100;i++){
    const b=document.createElement('button');b.textContent=String(i).padStart(2,'0');b.disabled=i>unlocked;
    b.setAttribute('aria-label',`Misión ${i}: ${mission(i).name}${i>unlocked?', bloqueada':''}`);
    if(i===s.level)b.classList.add('current');
    b.onclick=()=>{level=i;$('picker').close();start();};$('grid').append(b);
  }
  $('picker').showModal();
};
$('close').onclick=()=>$('picker').close();
function move(e){
  if(mode==='playing')s.x=clamp(.5+((e.clientX-canvas.getBoundingClientRect().left)/W-.5)/project(0,H-48,W,H).scale,.08,.92);
}
canvas.addEventListener('pointerdown',e=>{if(activePointer!==null)return;activePointer=e.pointerId;canvas.setPointerCapture(e.pointerId);move(e);});
canvas.addEventListener('pointermove',e=>{if(e.pointerId===activePointer||(activePointer===null&&e.pointerType==='mouse'))move(e);});
function release(e){if(e.pointerId===activePointer)activePointer=null;}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
window.addEventListener('keydown',e=>{
  if(e.target.matches('button,select,input')||$('picker').open)return;
  if(['ArrowLeft','ArrowRight',' '].includes(e.key)){
    e.preventDefault();keys.add(e.key);if(e.key===' '&&!e.repeat)pause();
  }
});
window.addEventListener('keyup',e=>keys.delete(e.key));
window.addEventListener('blur',()=>{keys.clear();activePointer=null;if(mode==='playing')pause();});

function particles(x,y,color,count=14,speed=130){
  const cap=economy?100:260;
  for(let i=0;i<count&&s.particles.length<cap;i++){
    const a=Math.random()*Math.PI*2,v=30+Math.random()*speed;
    s.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3+Math.random()*.4,maxLife:.7,color,size:1.5+Math.random()*2.5});
  }
}
function light(x,y,color,radius=65,life=.2){if(s.lights.length<12)s.lights.push({x,y,color,radius,life,maxLife:life});}
function burst(x,y,color,big=false){
  particles(x,y,color,big?30:14,big?190:130);
  if(s.rings.length<50)s.rings.push({x,y,color,life:big?.6:.4,maxLife:big?.6:.4,radius:big?75:38});
  light(x,y,color,big?115:55,big?.35:.15);
}
function label(text,x,y,color){if(s.labels.length<16)s.labels.push({text,x,y,color,life:1});}
function finish(win){
  mode=win?'won':'lost';audio.setPlaying(false);audio.play(win?'victory':'defeat');
  record=Math.max(record,s.score);storage.set('pulso-record',record);
  if(win){
    unlocked=Math.max(unlocked,Math.min(100,level+1));storage.set('pulso-unlocked',unlocked);
    const completed=level===100;
    show(completed?'¡Los 100 son tuyos!':'¡Ruta despejada!',`Puntaje: ${s.score} · Récord: ${record}. ${completed?'Podés volver a jugar cualquier misión.':'El convoy sigue adelante.'}`,completed?'Jugar de nuevo':'Siguiente misión','MISIÓN CUMPLIDA');
    if(!completed)level++;
    for(let i=0;i<6;i++)burst(W*(.15+Math.random()*.7),H*(.2+Math.random()*.4),i%2?'#ffe181':'#7ef4ce',true);
  }else{
    const m=mission(s.level),missing=s.bossDefeated&&!missionComplete(s.level,s.kills,s.blocks);
    show(missing?'Faltó el objetivo.':'El convoy cayó.',missing?`Frenaste al mutante, pero necesitabas ${m.target} ${m.type===0?'zombis eliminados':'barricadas destruidas'}.`:`Puntaje: ${s.score}. Usá las puertas ×2 y concentrá el fuego en los enemigos más cercanos.`);
  }
}
function defeatEnemy(e){
  if(e.kind==='cache'){
    const reward=routeReward(s,e.route);s.score+=25;
    if(e.route!=='ammo'&&!unlockedGear.includes(e.route)){unlockedGear.push(e.route);storage.set('pulso-gear',JSON.stringify(unlockedGear));refreshArsenal();label('ARSENAL DESBLOQUEADO',W/2,H*.38,'#ffe49a');}
    label(reward,e.x,e.y-20,e.color||'#8deffd');burst(e.x,e.y,e.color||'#8deffd',true);audio.play('gate');
    if(s.fork){if(e.route==='ammo')s.fork.leftLabel='MUNICIÓN ABIERTA';else s.fork.rightLabel='MEJORA ABIERTA';}
    return;
  }
  const multiplier=1+Math.min(4,Math.floor(s.combo/5));
  s.combo++;s.comboTime=2.5;
  const reward=(e.boss?100:e.kind==='tank'?20:10)*multiplier;s.score+=reward;
  if(e.kind==='barricade')s.blocks++;else if(e.boss)s.bossDefeated=true;else s.kills++;
  burst(e.x,e.y,e.boss?'#d8a0ff':e.kind==='barricade'?'#ffd07a':'#9bedb2',e.boss);
  audio.play(e.boss?'boss':'kill',e.boss?1:.6);
  label(`+${reward}`,e.x,e.y,'#ffe18a');
  if(e.boss){s.shake=.3;label('¡MUTANTE ELIMINADO!',W/2,H*.35,'#e8b9ff');}
  if(s.debris.length<24)s.debris.push({x:e.x,y:e.y,color:e.boss?'#644b78':e.kind==='barricade'?'#847351':'#53735d',life:2,radius:e.r*.7});
}
function spawnHorde(c){
  const center=(.2+Math.random()*.6)*W,count=Math.min(5,3+Math.floor(s.level/30));
  for(let member=0;member<count;member++){
    const kind=s.level>=3&&Math.random()<.25?'runner':s.level>=5&&Math.random()<.22?'tank':'walker';
    const hp=kind==='tank'?c.hp*2.4:c.hp;
    s.enemies.push({kind,x:clamp(center+(member-(count-1)/2)*24,W*.1,W*.9),y:-25-member*16,hp,max:hp,r:kind==='tank'?23:18,speed:c.speed*(kind==='runner'?1.45:kind==='tank'?.72:1),phase:Math.random()*Math.PI*2});
  }
}
function update(dt){
  const c=levelConfig(s.level),m=mission(s.level),unit=H/550;
  s.time+=dt;s.shake=Math.max(0,s.shake-dt);s.flash=Math.max(0,s.flash-dt);
  s.spawn-=dt;s.shot-=dt;s.gate-=dt;s.routeTimer-=dt;if(s.fork)s.fork.life=Math.max(0,s.fork.life-dt);s.comboTime=Math.max(0,s.comboTime-dt);if(!s.comboTime)s.combo=0;
  if(keys.has('ArrowLeft'))s.x=clamp(s.x-dt*.7,.08,.92);
  if(keys.has('ArrowRight'))s.x=clamp(s.x+dt*.7,.08,.92);
  if(s.shot<=0){s.shot=s.rapid?.11:.16;const balls=volley(s.power,s.x*W,H-80,W);if(s.blast)balls[0].explosive=true;s.bullets.push(...balls);audio.play('fire',s.power/48);}
  if(s.time<c.duration-5&&s.routeTimer<=0){
    s.routeTimer=10;const options=routeOptions(s.level,W,H,s.routeCount++);s.enemies.push(...options);
    s.fork={top:H*.08,bottom:H*.95,life:9,leftLabel:'MUNICIÓN +3',rightLabel:options[1].label};
    label('ELEGÍ UNA RUTA',W/2,H*.48,'#ffe4a0');
  }
  if(s.time<c.duration&&s.spawn<=0){s.spawn=c.spawn*1.8;spawnHorde(c);}
  if(s.time<c.duration-3&&s.gate<=0){
    s.gate=4.3;const left=Math.random()<.5,first=s.nextGate===0;
    s.gates.push({id:s.nextGate++,x:(left?.08:.54)*W,y:first?H*.35:-40,w:W*.38,kind:first||Math.random()<.55?'multiply':'add',used:false});
  }
  if(m.type===1&&s.blockSpawn<2&&s.time>c.duration*(.2+s.blockSpawn*.3)){
    s.blockSpawn++;const hp=4+Math.floor(s.level/4);
    s.enemies.push({kind:'barricade',x:(s.blockSpawn===1?.3:.7)*W,y:-20,hp,max:hp,r:25,speed:38});
  }
  if(s.time>=c.duration&&!s.bossSpawned){
    s.bossSpawned=true;label('¡MUTANTE EN CAMINO!',W/2,H*.35,'#f5b0ff');audio.play('boss');
    s.enemies.push({x:W*.5,y:-40,hp:c.boss,max:c.boss,r:40,speed:22+s.level*.2,boss:true,phase:0});
  }
  for(const g of s.gates){
    g.previousY=g.y;g.y+=68*unit*dt;g.flash=Math.max(0,(g.flash||0)-dt);g.labelCooldown=Math.max(0,(g.labelCooldown||0)-dt);
    if(!g.used&&g.y>=H-90&&g.y<H-45&&s.x*W>=g.x&&s.x*W<=g.x+g.w){
      g.used=true;s.power=gatePower(s.power,g.kind);burst(s.x*W,H-85,'#65e1f4');
      label(`${s.power} PELOTITAS`,s.x*W,H-125,'#b7f76b');audio.play('gate');
    }
  }
  s.gates=s.gates.filter(g=>g.y<H+40);
  for(const e of s.enemies){e.hit=Math.max(0,(e.hit||0)-dt);e.previousY=e.y;e.y+=e.speed*unit*dt;}
  const orderedGates=[...s.gates].sort((a,b)=>b.y-a.y),splits=[];
  for(const b of s.bullets){
    const previousY=b.y;b.previousX=b.x;b.y-=420*unit*dt;
    if(b.spread>0){b.x=clamp(b.x+b.vx*Math.min(dt,b.spread),14,W-14);b.spread=Math.max(0,b.spread-dt);}
    let target=null,hit=Infinity;
    for(const e of s.enemies){const t=projectileHit(b,previousY,e);if(t!==null&&t<hit){hit=t;target=e;}}
    for(const g of orderedGates){
      const previousDistance=previousY-(g.previousY+19),distance=b.y-(g.y+19);
      const gateTime=previousDistance/(previousDistance-distance);
      if(gateTime>hit)continue;
      const copy=multiplyAtGate(b,g,previousY);
      if(copy){
        splits.push(copy);g.flash=.18;
        if(s.rings.length<50)s.rings.push({x:b.x,y:g.y+19,color:'#dca5ff',life:.25,maxLife:.25,radius:22});
        if(!g.labelCooldown){label('×2',b.x,g.y-8,'#e2b8ff');g.labelCooldown=.5;audio.play('gate',.4);light(b.x,g.y,'#ce8dff',55,.18);}
      }
    }
    if(target){
      const impactY=previousY+(b.y-previousY)*hit;
      target.hp-=b.damage;target.hit=.1;b.y=-100;
      if(s.particles.length<(economy?80:180))particles(b.x,impactY,target.kind==='tank'?'#ffce7e':'#e0ffc0',3,75);
      audio.play('hit',.3);
      if(target.hp<=0)defeatEnemy(target);
      if(b.explosive){
        burst(b.x,impactY,'#ffbc66',true);audio.play('kill',.5);
        for(const other of s.enemies){if(other!==target&&other.hp>0&&other.kind!=='cache'&&Math.hypot(other.x-b.x,other.y-impactY)<55){other.hp-=1.5;other.hit=.12;if(other.hp<=0)defeatEnemy(other);}}
      }
    }
  }
  s.bullets=s.bullets.filter(b=>b.y>-20);s.bullets.push(...splits);
  for(const e of s.enemies){
    if(e.hp>0&&e.y>H-75){
      e.hp=0;if(e.kind==='cache')continue;if(s.shield>0&&!e.boss){s.shield--;burst(e.x,H-70,'#77ddff',true);label('ESCUDO ABSORBIÓ EL GOLPE',W/2,H-115,'#87eaff');audio.play('gate');continue;}s.lives--;s.combo=0;s.comboTime=0;s.shake=.22;s.flash=.18;
      burst(e.x,H-70,'#ff657e');audio.play('hurt');
      if(s.lives<=0||e.boss){finish(false);return;}
    }
  }
  s.enemies=s.enemies.filter(e=>e.hp>0);
  animateEffects(dt);
  if(s.bossSpawned&&!s.enemies.some(e=>e.kind!=='cache'))finish(missionComplete(s.level,s.kills,s.blocks));
}
function animateEffects(dt){
  for(const p of s.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=50*dt;p.life-=dt;}
  s.particles=s.particles.filter(p=>p.life>0);
  for(const r of s.rings)r.life-=dt;s.rings=s.rings.filter(r=>r.life>0);
  for(const l of s.labels){l.life-=dt;l.y-=24*dt;}s.labels=s.labels.filter(l=>l.life>0);
  for(const l of s.lights)l.life-=dt;s.lights=s.lights.filter(l=>l.life>0);
  for(const d of s.debris){d.life-=dt;d.y+=26*(H/550)*dt;}s.debris=s.debris.filter(d=>d.life>0);
}
function glow(x,y,r,color,alpha=1){
  let sprite=glowing.get(color);
  if(!sprite){sprite=document.createElement('canvas');sprite.width=sprite.height=64;const c=sprite.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,color);g.addColorStop(.3,color+'99');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,64,64);glowing.set(color,sprite);}
  ctx.save();ctx.globalAlpha=clamp(alpha,0,1);ctx.globalCompositeOperation='lighter';ctx.drawImage(sprite,x-r,y-r,r*2,r*2);ctx.restore();
}
function drawGate(g){
  place(ctx,g.x+g.w/2,g.y,W,H);const color=g.kind==='multiply'?'#cf9aff':'#65e1f4';
  ctx.globalAlpha=g.used?.38:1;
  if(!economy)glow(g.x+g.w/2,g.y+19,g.w*.55,color,.18);
  ctx.fillStyle='#0c142e';ctx.beginPath();ctx.roundRect(g.x-4,g.y+5,g.w+8,38,7);ctx.fill();
  const fill=ctx.createLinearGradient(g.x,g.y,g.x,g.y+38);fill.addColorStop(0,g.kind==='multiply'?'#995ce7':'#169cbc');fill.addColorStop(1,g.kind==='multiply'?'#35204f':'#153f57');
  ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(g.x,g.y,g.w,38,7);ctx.fill();ctx.strokeStyle=g.flash>0?'#fff':color;ctx.lineWidth=g.flash>0?3:1.5;ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='900 24px system-ui';ctx.textAlign='center';ctx.fillText(g.kind==='multiply'?'×2':'+2',g.x+g.w/2,g.y+27);
  ctx.fillStyle=color;for(const x of [g.x+6,g.x+g.w-10]){ctx.fillRect(x,g.y+4,4,30);ctx.fillStyle='#fff';ctx.fillRect(x,g.y+4,4,5);ctx.fillStyle=color;}
  ctx.globalAlpha=1;ctx.restore();
}
function drawBullet(b){
  place(ctx,b.x,b.y,W,H);
  ctx.fillStyle='#68eff047';ctx.beginPath();ctx.ellipse(b.x,b.y+10,2.5,12,0,0,7);ctx.fill();
  if(!economy)glow(b.x,b.y,b.explosive?11:8,b.explosive?'#ffae69':'#b9ff79',.4);
  ctx.fillStyle=b.explosive?'#ffbc69':'#baff82';ctx.beginPath();ctx.arc(b.x,b.y,3.6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x-.7,b.y-.8,1.5,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawEnemy(e){
  place(ctx,e.x,e.y,W,H);if(e.kind==='cache'){drawRouteTarget(ctx,e,s.time);ctx.restore();return;}zombie(ctx,e,s.time);
  const barY=e.y-e.r*1.7;ctx.fillStyle='#111a2ccc';ctx.beginPath();ctx.roundRect(e.x-e.r,barY,e.r*2,5,2);ctx.fill();
  ctx.fillStyle=e.boss?'#e8a1ff':e.kind==='barricade'?'#ffcd68':'#b4f782';ctx.fillRect(e.x-e.r,barY,e.r*2*clamp(e.hp/e.max,0,1),4);
  if(e.boss||e.kind==='tank'||e.kind==='barricade'){ctx.fillStyle='#fff';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(Math.ceil(e.hp),e.x,barY-3);}
  ctx.restore();
}
function draw(){
  ctx.clearRect(0,0,W,H);road(ctx,W,H,s.time,s.level);if(s.fork?.life>0)drawFork(ctx,W,H,s.fork,project);ctx.save();
  if(s.shake>0&&!reducedMotion.matches)ctx.translate(Math.sin(s.time*95)*s.shake*12,0);
  for(const d of s.debris){place(ctx,d.x,d.y,W,H);ctx.fillStyle=d.color;ctx.globalAlpha=Math.min(.55,d.life*.4);ctx.beginPath();ctx.ellipse(d.x,d.y,d.radius,d.radius*.4,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  const objects=[...s.gates.map(item=>({item,type:'gate',y:item.y})),...s.enemies.map(item=>({item,type:'enemy',y:item.y})),...s.bullets.map(item=>({item,type:'bullet',y:item.y}))].sort((a,b)=>a.y-b.y);
  for(const {item,type} of objects){if(item.y<-80||item.y>H+80)continue;if(type==='gate')drawGate(item);else if(type==='enemy')drawEnemy(item);else drawBullet(item);}
  for(const p of s.particles){place(ctx,p.x,p.y,W,H);ctx.globalAlpha=Math.min(1,p.life/p.maxLife);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);ctx.restore();}
  for(const r of s.rings){place(ctx,r.x,r.y,W,H);ctx.globalAlpha=clamp(r.life/r.maxLife,0,1);ctx.strokeStyle=r.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(r.x,r.y,5+(1-r.life/r.maxLife)*r.radius,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if(!economy)for(const l of s.lights){place(ctx,l.x,l.y,W,H);glow(l.x,l.y,l.radius,l.color,l.life/l.maxLife*.7);ctx.restore();}
  const x=s.x*W,y=H-48,recoil=mode==='playing'?Math.max(0,s.shot-.1)*45:0;
  place(ctx,x,y,W,H);vehicle(ctx,x,y,s.power,recoil,s.time);ctx.restore();
  for(const l of s.labels){place(ctx,l.x,l.y,W,H);ctx.globalAlpha=Math.min(1,l.life*2);ctx.font='900 14px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#102232';ctx.strokeText(l.text,clamp(l.x,72,W-72),l.y);ctx.fillStyle=l.color;ctx.fillText(l.text,clamp(l.x,72,W-72),l.y);ctx.restore();}
  ctx.restore();
  const vignette=ctx.createRadialGradient(W/2,H*.45,W*.3,W/2,H*.5,H*.85);vignette.addColorStop(0,'#08172b00');vignette.addColorStop(1,'#08172b55');ctx.fillStyle=vignette;ctx.fillRect(0,49,W,H-49);
  if(s.flash>0&&!reducedMotion.matches){ctx.strokeStyle=`rgba(255,95,105,${s.flash*3})`;ctx.lineWidth=14;ctx.strokeRect(3,52,W-6,H-55);}
  drawHUD();
}
function drawHUD(){
  const m=mission(s.level),count=m.type===0?s.kills:m.type===1?s.blocks:(s.bossDefeated?1:0);
  ctx.fillStyle='#0c182bdf';ctx.fillRect(0,0,W,49);ctx.fillStyle=m.zone.accent;ctx.font='800 9px system-ui';ctx.textAlign='left';ctx.fillText(m.zone.name.toUpperCase(),14,17);
  ctx.fillStyle='#fff';ctx.font='800 12px system-ui';ctx.fillText(m.name,14,35);
  ctx.textAlign='right';ctx.fillStyle=count>=m.target?'#c2ff8c':'#d5e7e4';ctx.fillText(`${Math.min(count,m.target)} / ${m.target}`,W-14,34);
  const boss=s.enemies.find(e=>e.boss&&e.hp>0);
  if(boss){
    ctx.fillStyle='#16203beb';ctx.beginPath();ctx.roundRect(14,58,W-28,30,7);ctx.fill();
    ctx.fillStyle='#edbcff';ctx.font='800 9px system-ui';ctx.textAlign='left';ctx.fillText('MUTANTE',22,70);
    ctx.fillStyle='#403550';ctx.fillRect(22,76,W-44,4);ctx.fillStyle='#d995ff';ctx.fillRect(22,76,(W-44)*boss.hp/boss.max,4);
  }
  if(s.combo>=3){ctx.textAlign='center';ctx.font='900 13px system-ui';ctx.fillStyle='#ffe098';ctx.fillText(`RACHA ${s.combo} · ×${1+Math.min(4,Math.floor(s.combo/5))}`,W/2,boss?105:70);}
  ctx.fillStyle='#ff93a9';ctx.font='17px system-ui';ctx.textAlign='left';ctx.fillText('♥'.repeat(Math.max(0,s.lives)),18,H-13);if(s.shield){ctx.font='800 9px system-ui';ctx.fillStyle='#89e9ff';ctx.fillText(`ESCUDO ${s.shield}`,18,H-34);}
  ctx.fillStyle='#e3f6ef';ctx.font='800 9px system-ui';ctx.textAlign='right';ctx.fillText(`${s.power} ${s.power===1?'PELOTITA':'PELOTITAS'} / DISPARO`,W-18,H-13);
  $('level').textContent=String(s.level).padStart(2,'0')+' / 100';$('power').textContent=s.power;
  $('progress').style.width=Math.min(100,s.time/levelConfig(s.level).duration*100)+'%';
  $('status').textContent=mode==='playing'?(s.bossSpawned?'¡Mutante! Defendé el convoy.':`Puntaje ${s.score} · Defendé la ruta`):`Récord ${record} · Tu próxima aventura empieza acá`;
}
function frame(t){
  const elapsed=last?(t-last)/1000:0;last=t;
  if(mode==='playing'){
    if(quality==='auto'&&!economy){slowFrames=elapsed>.026?slowFrames+elapsed:Math.max(0,slowFrames-elapsed);if(slowFrames>2.5){economy=true;resize();}}
    // Bounded steps keep collisions and animations stable during short frame stalls.
    let remaining=Math.min(elapsed,.12);while(remaining>0&&mode==='playing'){const dt=Math.min(remaining,1/60);update(dt);remaining-=dt;}
  }else if(mode==='won'||mode==='lost')animateEffects(Math.min(elapsed,.04));
  draw();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
