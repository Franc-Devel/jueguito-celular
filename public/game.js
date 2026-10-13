import {drawSpecial,drawPickup} from './encounters.js';
import {levelPlan} from './campaign.js';
import {mission,missionComplete,project,place,road,zombie,vehicle,configureScene} from './scenery.js';
import {clamp,levelConfig,gatePower,freshState,volley,multiplyAtGate,projectileHit,resizeWorld,routeReward,damageOnImpact,MUTATIONS,applyMutation,missionObjectives,shotInterval,attackProfile,hostileSalvo,slowedSpeed} from './engine.js';
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
configureScene(levelPlan(level));
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
  hideChoices();audio.unlock();s=freshState(level);configureScene(levelPlan(level));if(loadout!=='standard')routeReward(s,loadout);label(mission(level).name,W/2,H*.4,'#ffe5a1');
  mode='playing';audio.setPlaying(true);$('overlay').hidden=true;$('pause').textContent='II';
  $('pause').setAttribute('aria-label','Pausar juego');canvas.focus();audio.play('gate');
}
function resume(){audio.unlock();mode='playing';audio.setPlaying(true);$('overlay').hidden=true;$('pause').textContent='II';$('pause').setAttribute('aria-label','Pausar juego');}
$('play').onclick=()=>mode==='paused'?resume():start();
function pause(){
  if(mode==='paused'){resume();return;}if(mode!=='playing')return;
  mode='paused';audio.setPlaying(false);$('pause').textContent='▶︎';$('pause').setAttribute('aria-label','Continuar juego');
  show('Un respiro.',levelPlan(s.level).briefing,'Continuar',`MISIÓN ${s.level} · EN PAUSA`);
}
$('pause').onclick=pause;
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();});
$('levels').onclick=()=>{
  if(mode==='playing')pause();
  $('grid').replaceChildren();
  for(let i=1;i<=100;i++){
    const b=document.createElement('button');b.innerHTML=String(i).padStart(2,'0')+`<small>${levelPlan(i).title.split(' · ')[0].split(' ').slice(0,2).join(' ')}</small>`;b.title=levelPlan(i).briefing;b.disabled=i>unlocked;
    b.setAttribute('aria-label',`Misión ${i}: ${mission(i).name}${i>unlocked?', bloqueada':''}`);
    if(i===s.level)b.classList.add('current');
    b.onclick=()=>{level=i;$('picker').close();start();};$('grid').append(b);
  }
  $('picker').showModal();
};
$('close').onclick=()=>$('picker').close();
function move(e){
  if(mode==='playing'){const center=project(W/2,H-48,W,H);s.x=clamp(.5+(e.clientX-canvas.getBoundingClientRect().left-center.x)/(W*center.scale),s.laneMin,s.laneMax);}
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
    show(completed?'¡Los 100 son tuyos!':'¡Ruta despejada!',completed?`Puntaje: ${s.score} · Récord: ${record}. Podés volver a jugar cualquier misión.`:`Puntaje: ${s.score}. Sigue ${levelPlan(level+1).title}: ${levelPlan(level+1).briefing}`,completed?'Jugar de nuevo':'Siguiente misión','MISIÓN CUMPLIDA');
    if(!completed)level++;
    for(let i=0;i<6;i++)burst(W*(.15+Math.random()*.7),H*(.2+Math.random()*.4),i%2?'#ffe181':'#7ef4ce',true);
  }else{
    const m=mission(s.level),missing=(s.bossDefeated||s.time>=m.duration)&&!missionObjectives(m,s);
    show(missing?'Faltó el objetivo.':'El convoy cayó.',missing?`Faltó completar: ${objectiveText(m,s)}.`:`Puntaje: ${s.score}. Usá las puertas ×2 y concentrá el fuego en los enemigos más cercanos.`);
  }
}
function defeatEnemy(e){
  if(e.kind==='cache'){
    const reward=routeReward(s,e.route);s.score+=25;s.cachesOpened++;
    if(e.route!=='ammo'&&!unlockedGear.includes(e.route)){unlockedGear.push(e.route);storage.set('pulso-gear',JSON.stringify(unlockedGear));refreshArsenal();label('ARSENAL DESBLOQUEADO',W/2,H*.38,'#ffe49a');}
    label(reward,e.x,e.y-20,e.color||'#8deffd');burst(e.x,e.y,e.color||'#8deffd',true);audio.play('gate');
    if(s.fork){const lane=s.fork.lanes?.find(l=>l.lane===e.routeLane);if(lane)lane.label='ABIERTA';}
    return;
  }
  if(e.kind==='mine'){s.minesDefused++;s.score+=20;burst(e.x,e.y,'#ffd389');label('MINA DESACTIVADA',e.x,e.y,'#ffe6a0');audio.play('kill',.3);return;}
  if(e.kind==='base'){s.basesDestroyed++;s.score+=150;burst(e.x,e.y,'#ffb178',true);label('BASE DESTRUIDA',e.x,e.y,'#ffe9ad');audio.play('kill');return;}
  const multiplier=1+Math.min(4,Math.floor(s.combo/5));
  s.combo++;s.comboTime=2.5;
  const reward=(e.boss?100:e.kind==='tank'?20:10)*multiplier;s.score+=reward;
  if(e.kind==='barricade')s.blocks++;else if(e.boss){s.bossesDown++;s.bossDefeated=s.bossesDown>=s.bossesTotal;}else s.kills++;
  burst(e.x,e.y,e.boss?'#d8a0ff':e.kind==='barricade'?'#ffd07a':'#9bedb2',e.boss);
  audio.play(e.boss?'boss':'kill',e.boss?1:.6);
  label(`+${reward}`,e.x,e.y,'#ffe18a');
  if(e.boss){s.shake=.3;label('¡MUTANTE ELIMINADO!',W/2,H*.35,'#e8b9ff');}
  if(s.debris.length<24)s.debris.push({x:e.x,y:e.y,color:e.boss?'#644b78':e.kind==='barricade'?'#847351':'#53735d',life:2,radius:e.r*.7});
}
function spawnHorde(c,wave){
  const kinds=[...wave.kinds];if(s.path==='risk')kinds.push('tank');const count=kinds.length,center=[.22,.5,.78][wave.lane]*W;
  for(let member=0;member<count;member++){
    const kind=kinds[member];let x=center+(member-(count-1)/2)*22,y=-28;
    if(wave.formation==='flanks'){x=(member%2?.77:.23)*W+(Math.floor(member/2)-(count/4-.5))*18;y-=Math.floor(member/2)*18;}
    else if(wave.formation==='v'){x=center+(member-(count-1)/2)*24;y-=Math.abs(member-(count-1)/2)*22;}
    else if(wave.formation==='alternating'){x=([.22,.5,.78][(wave.lane+member)%3])*W;y-=member*26;}
    else if(wave.formation==='cluster'){x=center+(member%3-1)*21;y-=Math.floor(member/3)*22;}
    x=clamp(x,W*s.laneMin,W*s.laneMax);
    const hp=Math.max(1,c.hp*wave.hpScale*(s.path==='safe'?.85:1)*(kind==='tank'?2.4:1));
    s.enemies.push({kind,x,homeX:x,y,hp,max:hp,r:kind==='tank'?23:18,speed:c.speed*wave.speedScale*(s.path==='safe'?.82:s.path==='risk'?1.15:1)*(kind==='runner'?1.45:kind==='tank'?.72:1),phase:member*.85+wave.at,sway:kind==='runner'?.025:0});
  }
}
function spawnBoss(c,plan){
  const kind=plan.bossKind,count=kind==='swarm'?3:1;
  const names={brute:'BRUTO',armored:'ACORAZADO',charger:'CARGADOR',swarm:'ENJAMBRE'};
  label(`¡${names[kind]} EN CAMINO!`,W/2,H*.35,'#f5b0ff');audio.play('boss');
  for(let i=0;i<count;i++){
    const x=W*(count===1?.5:.24+i*.26),hp=c.boss*(plan.bossScale??1)*(kind==='swarm'?.4:kind==='armored'?1.3:1);
    s.enemies.push({x,homeX:x,y:-40-i*35,hp,max:hp,r:count>1?29:40,speed:(22+s.level*.2)*(kind==='charger'?1.1:.95),boss:true,bossKind:kind,phase:i*2,charge:0,spawnAt:s.time});
  }
  if(s.level>=20)spawnHorde(c,{formation:'flanks',lane:0,kinds:s.level>=60?['tank','runner']:['walker','runner'],hpScale:.8,speedScale:.9,at:s.time});
}
function update(dt){
  const c=levelConfig(s.level),m=mission(s.level),plan=levelPlan(s.level),unit=H/550;
  s.time+=dt;s.invincible=Math.max(0,s.invincible-dt);s.shake=Math.max(0,s.shake-dt);s.flash=Math.max(0,s.flash-dt);
  s.spawn-=dt;s.shot-=dt;s.gate-=dt;s.routeTimer-=dt;if(s.fork)s.fork.life=Math.max(0,s.fork.life-dt);s.comboTime=Math.max(0,s.comboTime-dt);if(!s.comboTime)s.combo=0;
  if(keys.has('ArrowLeft'))s.x=clamp(s.x-dt*.7,s.laneMin,s.laneMax);
  if(keys.has('ArrowRight'))s.x=clamp(s.x+dt*.7,s.laneMin,s.laneMax);
  if(s.shot<=0){s.shot=shotInterval(s);const balls=volley(s.power,s.x*W,H-80,W,{pierce:s.pierce,bounce:s.bounce,spread:s.spread,freeze:s.freeze});if(s.blast)balls[0].explosive=true;s.bullets.push(...balls);audio.play('fire',s.power/48);}
  if(s.choiceIndex<plan.choiceAt.length&&s.time>=plan.choiceAt[s.choiceIndex]){s.choiceIndex++;openChoices();return;}
  updateSpecialSpawns(plan,c);
  while(s.routeCount<plan.spawnRoutesAt.length&&s.time>=plan.spawnRoutesAt[s.routeCount]){
    const index=s.routeCount++,route=plan.routeSequence[index%plan.routeSequence.length];
    const options=routeOptions(s.level,W,H,index).map(e=>{
      const ammo=e.route==='ammo',lane=ammo?route.ammoLane:route.techLane;
      return {...e,x:[.22,.5,.78][lane]*W,homeX:[.22,.5,.78][lane]*W,routeLane:lane,route:ammo?'ammo':route.tech,label:ammo?'MUNICIÓN':({shield:'ESCUDO',rapid:'RÁFAGA',blast:'EXPLOSIVO'}[route.tech]),required:plan.requiredCaches>0};
    });
    s.enemies.push(...options);
    s.fork={top:H*.08,bottom:H*.95,life:9,lanes:options.map(e=>({lane:e.routeLane,label:e.route==='ammo'?'MUNICIÓN +3':e.label,color:e.color}))};
    label(plan.requiredCaches?'ABRÍ DOS CAJAS A TIROS':'ELEGÍ UNA RUTA',W/2,H*.48,'#ffe4a0');
  }
  while(s.waveIndex<plan.waves.length&&s.time>=plan.waves[s.waveIndex].at){
    const wave=plan.waves[s.waveIndex++];spawnHorde(c,wave);
    if(s.waveIndex===1||wave.formation==='flanks')label(wave.formation==='flanks'?'¡ATAQUE POR LOS FLANCOS!':`OLEADA ${s.waveIndex}`,W/2,H*.28,'#e4edbd');
  }
  if(s.time<c.duration-3&&s.gate<=0){
    s.gate=plan.gateInterval;const first=s.nextGate===0,g=plan.gateSequence[s.nextGate%plan.gateSequence.length],center=[.22,.5,.78][g.lane];
    s.gates.push({id:s.nextGate++,x:(center-.17)*W,homeX:(center-.17)*W,moving:plan.movingGates,y:first?H*.35:-40,w:W*.34,kind:g.kind,used:false});
  }
  while(s.obstacleIndex<plan.obstacles.length&&s.time>=plan.obstacles[s.obstacleIndex].at){
    const obstacle=plan.obstacles[s.obstacleIndex++],hp=4+Math.floor(s.level/4);
    const x=[.22,.5,.78][obstacle.lane]*W;
    s.enemies.push({kind:'barricade',x,homeX:x,y:-20,hp,max:hp,r:25,speed:48,required:plan.requiredBlocks>0});
  }
  while(s.bossIndex<plan.bossSchedule.length&&s.time>=plan.bossSchedule[s.bossIndex].at){
    if(s.bossIndex>0&&s.enemies.some(e=>e.boss&&e.hp>0))break;
    const b=plan.bossSchedule[s.bossIndex++];spawnBoss(c,{...plan,bossKind:b.kind,bossScale:b.scale});s.bossSpawned=s.bossIndex===plan.bossSchedule.length;
  }
  for(const g of s.gates){
    g.previousY=g.y;g.previousX=g.x;if(g.moving)g.x=clamp(g.homeX+Math.sin(s.time*1.4+g.id)*W*.085,W*.025,W*.975-g.w);g.y+=68*unit*dt;g.flash=Math.max(0,(g.flash||0)-dt);g.labelCooldown=Math.max(0,(g.labelCooldown||0)-dt);
    if(!g.used&&g.y>=H-90&&g.y<H-45&&s.x*W>=g.x&&s.x*W<=g.x+g.w){
      g.used=true;s.power=gatePower(s.power,g.kind,s.powerCap);burst(s.x*W,H-85,'#65e1f4');
      label(`${s.power} PELOTITAS`,s.x*W,H-125,'#b7f76b');audio.play('gate');
    }
  }
  s.gates=s.gates.filter(g=>g.y<H+40);
  for(const e of s.enemies){
    e.hit=Math.max(0,(e.hit||0)-dt);e.previousY=e.y;e.previousX=e.x;
    let speed=e.speed*slowedSpeed(e);if(e.slow>0)e.slow=Math.max(0,e.slow-dt);
    if(e.boss){
      e.armorActive=e.bossKind==='armored'&&(s.time-(e.spawnAt??0))%3.6<2.1;
      if(e.bossKind==='charger'){e.charge=(s.time+e.phase)%3.8;e.x=clamp((e.homeX??W*.5)+Math.sin(s.time*1.8+e.phase)*W*.25,W*.12,W*.88);speed*=e.charge>3?2.7:.7;}
      else if(e.bossKind==='swarm')e.x=clamp((e.homeX??e.x)+Math.sin(s.time*1.7+e.phase)*W*.06,W*.1,W*.9);
      else if(e.bossKind==='armored')e.x=clamp((e.homeX??W*.5)+Math.sin(s.time*.75)*W*.12,W*.12,W*.88);
      else e.x=clamp((e.homeX??W*.5)+Math.sin((s.time-(e.spawnAt??0))*.9)*W*.24,W*.12,W*.88);
    }else if(e.sway)e.x=clamp(e.homeX+Math.sin(s.time*3+e.phase)*W*e.sway,W*s.laneMin,W*s.laneMax);
    e.y+=speed*unit*dt;
    updateEnemyAttack(e,dt);

  }
  const orderedGates=[...s.gates].sort((a,b)=>b.y-a.y),splits=[];
  for(const b of s.bullets){
    const previousY=b.y;b.previousX=b.x;b.y-=420*unit*dt;
    if(b.bounce){b.x+=b.vx*dt;if(b.x<14||b.x>W-14){b.x=clamp(b.x,14,W-14);b.vx*=-1;}}
    else if(b.spread>0){b.x=clamp(b.x+b.vx*Math.min(dt,b.spread),14,W-14);b.spread=Math.max(0,b.spread-dt);}
    const events=[];
    for(const e of s.enemies){if(b.hitTargets?.includes(e))continue;const t=projectileHit(b,previousY,e);if(t!==null)events.push({kind:'hit',e,t});}
    for(const g of orderedGates){const d0=previousY-(g.previousY+19),d1=b.y-(g.y+19),t=d0/(d0-d1);if(t>=0&&t<=1)events.push({kind:'gate',g,t});}
    events.sort((a,b)=>a.t-b.t);
    for(const event of events){
      if(event.kind==='gate'){
        const g=event.g,copy=multiplyAtGate(b,g,previousY);
        if(copy){splits.push(copy);g.flash=.18;if(s.rings.length<50)s.rings.push({x:b.x,y:g.y+19,color:'#dca5ff',life:.25,maxLife:.25,radius:22});if(!g.labelCooldown){label('×2',b.x,g.y-8,'#e2b8ff');g.labelCooldown=.5;audio.play('gate',.4);light(b.x,g.y,'#ce8dff',55,.18);}}
        continue;
      }
      const target=event.e;if(target.hp<=0)continue;
      const impactY=previousY+(b.y-previousY)*event.t;
      target.hp-=damageOnImpact(target,b.damage);target.hit=.1;if(b.freeze)target.slow=1.5;
      if(s.particles.length<(economy?80:180))particles(b.x,impactY,target.kind==='tank'?'#ffce7e':'#e0ffc0',3,75);
      audio.play('hit',.3);if(target.hp<=0)defeatEnemy(target);
      if(b.explosive){burst(b.x,impactY,'#ffbc66',true);audio.play('kill',.5);for(const other of s.enemies){if(other!==target&&other.hp>0&&other.kind!=='cache'&&Math.hypot(other.x-b.x,other.y-impactY)<55){other.hp-=damageOnImpact(other,1.5);other.hit=.12;if(other.hp<=0)defeatEnemy(other);}}}
      if(b.pierceLeft>0){b.pierceLeft--;b.hitTargets??=[];b.hitTargets.push(target);}else{b.y=-100;break;}
    }
  }
  s.bullets=s.bullets.filter(b=>b.y>-20);s.bullets.push(...splits);
  for(const e of s.enemies){
    if(e.hp>0&&e.y>H-75){
      e.hp=0;if(e.kind==='cache')continue;if(e.kind==='mine'){if(Math.abs(e.x-s.x*W)<e.r+21)hurt();continue;}if(e.kind==='barricade'&&Math.abs(e.x-s.x*W)>e.r+21)continue;if(s.shield>0&&!e.boss){s.shield--;burst(e.x,H-70,'#77ddff',true);label('ESCUDO ABSORBIÓ EL GOLPE',W/2,H-115,'#87eaff');audio.play('gate');continue;}s.lives--;s.combo=0;s.comboTime=0;s.shake=.22;s.flash=.18;
      burst(e.x,H-70,'#ff657e');audio.play('hurt');
      if(s.lives<=0||e.boss){finish(false);return;}
    }
  }
  s.enemies=s.enemies.filter(e=>e.hp>0);
  updatePickups(dt,unit);
  updateHostileShots(dt);
  if(mode!=='playing')return;
  animateEffects(dt);
  const complete=missionObjectives(plan,s);
  if(plan.endMode==='timed'&&s.time>=plan.duration)finish(complete);
  else if(plan.endMode==='siege'&&s.time>=plan.duration){if(complete)finish(true);else if(s.time>=plan.duration+25)finish(false);}
  else if(plan.endMode==='boss'&&s.bossSpawned&&!s.enemies.some(e=>e.kind!=='cache'))finish(complete);

}
function objectiveText(plan,state){
  const parts=[];
  if(plan.killTarget)parts.push(`${Math.min(state.kills,plan.killTarget)}/${plan.killTarget} bajas`);
  for(const [goal,key,name] of [['requiredBlocks','blocks','bloqueos'],['requiredCaches','cachesOpened','cajas'],['requiredRescues','rescued','rescates'],['requiredMines','minesDefused','minas'],['requiredBases','basesDestroyed','bases'],['requiredMutations','mutationsChosen','mejoras']])if(plan[goal])parts.push(`${Math.min(state[key],plan[goal])}/${plan[goal]} ${name}`);
  if(plan.requiredPath)parts.push(state.path==='safe'?'REFUGIO':state.path==='risk'?'ASALTO':'Elegí ramal');
  return parts.join(' · ');
}
function hideChoices(){
  $('mutations').hidden=true;$('play').hidden=false;$('levels').hidden=false;$('weapon').closest('label').hidden=false;
}
function openChoices(){
  mode='upgrade';audio.setPlaying(false);
  show('Elegí tu mutación.','Se aplica durante esta misión. El juego está pausado mientras elegís.','Continuar','TALLER EN RUTA');
  $('play').hidden=true;$('levels').hidden=true;$('weapon').closest('label').hidden=true;$('mutations').hidden=false;$('mutations').replaceChildren();
  const pool=MUTATIONS.filter(p=>p.id==='heal'||!s[p.id]);
  const start=(s.level+s.choiceIndex)%pool.length,choices=Array.from({length:Math.min(3,pool.length)},(_,i)=>pool[(start+i)%pool.length]);
  s.choiceOptions=choices.map(p=>p.id);
  for(const perk of choices){const b=document.createElement('button');b.className='mutation-card '+perk.id;b.innerHTML=`<strong>${perk.name}</strong><span>${perk.description}</span>`;b.onclick=()=>chooseMutation(perk.id);$('mutations').append(b);}
}
function chooseMutation(id){
  if(mode!=='upgrade'||!s.choiceOptions.includes(id))return false;
  applyMutation(s,id);hideChoices();resume();const p=MUTATIONS.find(p=>p.id===id);label(p.name.toUpperCase(),W/2,H*.5,p.color);audio.play('gate');return true;
}
function updateSpecialSpawns(plan,c){
  const xFor=lane=>[.22,.5,.78][lane]*W;
  while(s.civilianIndex<plan.civilians.length&&s.time>=plan.civilians[s.civilianIndex].at){const p=plan.civilians[s.civilianIndex++];s.pickups.push({kind:'civilian',x:xFor(p.lane),y:H*.3,r:16,speed:65});label('CIVIL EN LA RUTA',xFor(p.lane),H*.28,'#a6efff');}
  while(s.mineIndex<plan.mines.length&&s.time>=plan.mines[s.mineIndex].at){const p=plan.mines[s.mineIndex++],hp=Math.max(2,c.hp*.3);s.enemies.push({kind:'mine',x:xFor(p.lane),y:-20,r:18,hp,max:hp,speed:80});}
  while(s.droneIndex<plan.drones.length&&s.time>=plan.drones[s.droneIndex].at){const p=plan.drones[s.droneIndex++],hp=Math.max(6,c.hp*2.5);s.enemies.push({kind:'drone',x:xFor(p.lane),y:H*(.15+p.lane*.06),r:22,hp,max:hp,speed:0,fireIn:1.3});label('DRON HOSTIL',xFor(p.lane),H*.13,'#ffabc0');}
  while(s.baseIndex<plan.bases.length&&s.time>=plan.bases[s.baseIndex].at){const p=plan.bases[s.baseIndex++],hp=Math.max(20,c.boss*.55);s.enemies.push({kind:'base',label:`BASE ${s.baseIndex}`,x:xFor(p.lane),y:H*.24,r:38,hp,max:hp,speed:0});}
  while(s.pathIndex<plan.pathAt.length&&s.time>=plan.pathAt[s.pathIndex]){
    s.pathIndex++;if(s.path)continue;
    s.pickups.push({kind:'path',path:'safe',x:xFor(0),y:H*.3,r:35,speed:65},{kind:'path',path:'risk',x:xFor(2),y:H*.3,r:35,speed:65});
    label('ELEGÍ REFUGIO O ASALTO',W/2,H*.48,'#ffe8ae');
  }
}
function updatePickups(dt,unit){
  for(const p of s.pickups){
    p.y+=p.speed*unit*dt;
    if(p.used||(p.kind==='path'&&s.path))continue;
    if(p.y>=H-84&&p.y<H-25&&Math.abs(p.x-s.x*W)<p.r+18){
      p.used=true;
      if(p.kind==='civilian'){s.rescued++;s.score+=50;burst(p.x,p.y,'#8aeeff');label('RESCATADO',p.x,H-112,'#b0f6ff');}
      else{s.path=p.path;if(p.path==='safe')s.lives=Math.min(3,s.lives+1);else s.power=Math.min(s.powerCap,s.power+4);label(p.path==='safe'?'RAMAL REFUGIO':'RAMAL ASALTO',W/2,H*.5,p.path==='safe'?'#aff897':'#ffd297');}
      audio.play('gate');
    }
  }
  s.pickups=s.pickups.filter(p=>!p.used&&p.y<H+35&&(p.kind!=='path'||!s.path));
}
function hurt(){
  if(s.invincible>0)return;
  s.invincible=.8;s.shake=.2;s.flash=.18;
  if(s.shield>0){s.shield--;label('ESCUDO',W/2,H-115,'#88e7ff');audio.play('gate');return;}
  s.lives--;audio.play('hurt');if(s.lives<=0)finish(false);
}
function updateEnemyAttack(e,dt){
  const profile=attackProfile(s.level,e);if(!profile||e.y<0||e.hp<=0)return;
  e.fireIn=(e.fireIn??1.5)-dt;
  if(e.fireIn<=profile.warning&&!e.attackTarget)e.attackTarget={x:s.x*W,y:H-48};
  if(e.fireIn<=0){
    const shots=hostileSalvo(e,e.attackTarget,W,H,profile);
    if(s.hostileShots.length+shots.length<=40)s.hostileShots.push(...shots);
    e.attackTarget=null;e.fireIn=profile.interval;audio.play('hit',.2);
  }
}
function updateHostileShots(dt){
  for(const shot of s.hostileShots){
    shot.previousX=shot.x;const oldY=shot.y;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;
    if(projectileHit(shot,oldY,{x:s.x*W,y:H-48,r:19,hp:1})!==null){shot.y=H+100;hurt();if(mode!=='playing')break;}
  }
  s.hostileShots=s.hostileShots.filter(p=>p.y<H+30&&p.x>-30&&p.x<W+30);
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
  ctx.fillStyle=b.freeze?'#a7ffff55':b.pierceLeft>0?'#93cfff55':'#68eff047';ctx.beginPath();ctx.ellipse(b.x,b.y+10,2.5,12,0,0,7);ctx.fill();
  if(!economy)glow(b.x,b.y,b.explosive?11:8,b.explosive?'#ffae69':'#b9ff79',.4);
  ctx.fillStyle=b.explosive?'#ffbc69':'#baff82';ctx.beginPath();ctx.arc(b.x,b.y,3.6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x-.7,b.y-.8,1.5,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawEnemy(e){
  place(ctx,e.x,e.y,W,H);if(e.kind==='cache'){drawRouteTarget(ctx,e,s.time);ctx.restore();return;}if(['mine','drone','base'].includes(e.kind))drawSpecial(ctx,e,s.time);else zombie(ctx,e,s.time);
  if(e.boss&&e.armorActive){ctx.strokeStyle='#83dfff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y-e.r*.35,e.r*1.15,e.r*1.45,0,0,Math.PI*2);ctx.stroke();}
  if(e.bossKind==='charger'&&e.charge>2.5){ctx.strokeStyle='#ffbd70';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x-12,e.y+e.r);ctx.lineTo(e.x,e.y+e.r+18);ctx.lineTo(e.x+12,e.y+e.r);ctx.stroke();}
  const barY=e.y-e.r*1.7;ctx.fillStyle='#111a2ccc';ctx.beginPath();ctx.roundRect(e.x-e.r,barY,e.r*2,5,2);ctx.fill();
  ctx.fillStyle=e.boss?'#e8a1ff':e.kind==='barricade'?'#ffcd68':'#b4f782';ctx.fillRect(e.x-e.r,barY,e.r*2*clamp(e.hp/e.max,0,1),4);
  if(e.boss||e.kind==='tank'||e.kind==='barricade'||e.kind==='base'){ctx.fillStyle='#fff';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(e.kind==='barricade'&&e.required?'OBJETIVO':Math.ceil(e.hp),e.x,barY-3);}
  ctx.restore();
}
function draw(){
  configureScene(levelPlan(s.level));ctx.clearRect(0,0,W,H);road(ctx,W,H,s.time,s.level);if(s.fork?.life>0)drawFork(ctx,W,H,s.fork,project);ctx.save();
  if(s.shake>0&&!reducedMotion.matches)ctx.translate(Math.sin(s.time*95)*s.shake*12,0);
  for(const d of s.debris){place(ctx,d.x,d.y,W,H);ctx.fillStyle=d.color;ctx.globalAlpha=Math.min(.55,d.life*.4);ctx.beginPath();ctx.ellipse(d.x,d.y,d.radius,d.radius*.4,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  for(const e of s.enemies){
    if(!e.attackTarget)continue;
    ctx.save();ctx.strokeStyle='#ff7b8c';ctx.globalAlpha=.6;ctx.lineWidth=2;
    for(const shot of hostileSalvo(e,e.attackTarget,W,H,attackProfile(s.level,e))){
      const endX=e.x+shot.vx*(e.attackTarget.y-e.y)/shot.vy;ctx.setLineDash([7,7]);ctx.beginPath();
      for(let i=0;i<=12;i++){const t=i/12,p=project(e.x+(endX-e.x)*t,e.y+(e.attackTarget.y-e.y)*t,W,H);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();ctx.setLineDash([]);
      const target=project(endX,e.attackTarget.y,W,H);ctx.beginPath();ctx.arc(target.x,target.y,18,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
  }
  const objects=[...s.gates.map(item=>({item,type:'gate',y:item.y})),...s.enemies.map(item=>({item,type:'enemy',y:item.y})),...s.bullets.map(item=>({item,type:'bullet',y:item.y})),...s.pickups.map(item=>({item,type:'pickup',y:item.y}))].sort((a,b)=>a.y-b.y);
  for(const {item,type} of objects){if(item.y<-80||item.y>H+80)continue;if(type==='gate')drawGate(item);else if(type==='enemy')drawEnemy(item);else if(type==='pickup'){place(ctx,item.x,item.y,W,H);drawPickup(ctx,item,s.time);ctx.restore();}else drawBullet(item);}
  for(const shot of s.hostileShots){place(ctx,shot.x,shot.y,W,H);glow(shot.x,shot.y,10,'#ff7192',.6);ctx.fillStyle='#ff9cad';ctx.beginPath();ctx.arc(shot.x,shot.y,5,0,Math.PI*2);ctx.fill();ctx.restore();}
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
  const m=mission(s.level);const objectives=objectiveText(m,s);
  ctx.fillStyle='#0c182bdf';ctx.fillRect(0,0,W,49);ctx.fillStyle=m.zone.accent;ctx.font='800 9px system-ui';ctx.textAlign='left';ctx.fillText(m.zone.name.toUpperCase(),14,17);
  ctx.fillStyle='#fff';ctx.font='800 12px system-ui';ctx.fillText(m.name,14,34,W-28);
  ctx.font='800 9px system-ui';ctx.textAlign='right';ctx.fillStyle=missionObjectives(m,s)?'#c2ff8c':'#d5e7e4';ctx.fillText(objectives,W-14,17,W*.63);
  const bosses=s.enemies.filter(e=>e.boss&&e.hp>0),boss=bosses[0];
  if(boss){
    ctx.fillStyle='#16203beb';ctx.beginPath();ctx.roundRect(14,58,W-28,30,7);ctx.fill();
    ctx.fillStyle='#edbcff';ctx.font='800 9px system-ui';ctx.textAlign='left';ctx.fillText(({brute:'BRUTO',armored:'ACORAZADO',charger:'CARGADOR',swarm:'ENJAMBRE'}[boss.bossKind]||'MUTANTE')+(s.bossesTotal>1?` · ${s.bossesDown}/${s.bossesTotal}`:boss.bossKind==='armored'?(boss.armorActive?' · BLINDAJE ACTIVO':' · NÚCLEO EXPUESTO'):boss.bossKind==='charger'&&boss.charge>2.5?' · ¡CARGA!':''),22,70);
    ctx.fillStyle='#403550';ctx.fillRect(22,76,W-44,4);ctx.fillStyle='#d995ff';ctx.fillRect(22,76,(W-44)*bosses.reduce((sum,e)=>sum+e.hp,0)/bosses.reduce((sum,e)=>sum+e.max,0),4);
  }
  const perkNames=MUTATIONS.filter(p=>s[p.id]).map(p=>p.name);if(perkNames.length){ctx.fillStyle='#a8edff';ctx.font='800 8px system-ui';ctx.textAlign='center';ctx.fillText(perkNames.join(' · '),W/2,H-98,W-25);}
  if(s.combo>=3){ctx.textAlign='center';ctx.font='900 13px system-ui';ctx.fillStyle='#ffe098';ctx.fillText(`RACHA ${s.combo} · ×${1+Math.min(4,Math.floor(s.combo/5))}`,W/2,boss?105:70);}
  ctx.fillStyle='#ff93a9';ctx.font='17px system-ui';ctx.textAlign='left';ctx.fillText('♥'.repeat(Math.max(0,s.lives)),18,H-13);if(s.shield){ctx.font='800 9px system-ui';ctx.fillStyle='#89e9ff';ctx.fillText(`ESCUDO ${s.shield}`,18,H-34);}
  ctx.fillStyle='#e3f6ef';ctx.font='800 9px system-ui';ctx.textAlign='right';ctx.fillText(`${s.power} ${s.power===1?'PELOTITA':'PELOTITAS'} / DISPARO`,W-18,H-13);
  $('level').textContent=String(s.level).padStart(2,'0')+' / 100';$('power').textContent=`${s.power} / ${s.powerCap}`;
  $('progress').style.width=Math.min(100,s.time/levelConfig(s.level).duration*100)+'%';
  $('status').textContent=mode==='playing'?(m.endMode==='timed'?`Salida en ${Math.max(0,Math.ceil(m.duration-s.time))}s · Puntaje ${s.score}`:m.endMode==='siege'?`Bases ${s.basesDestroyed}/2 · ${Math.max(0,Math.ceil(m.duration+25-s.time))}s`:s.bossSpawned?'¡Mutante! Defendé el convoy.':`Oleada ${s.waveIndex}/${levelPlan(s.level).waves.length} · Puntaje ${s.score}`):`Récord ${record} · Tu próxima aventura empieza acá`;
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

const initial=levelPlan(level);show(initial.title,initial.briefing,'Iniciar misión',`MISIÓN ${level} · ${initial.powerCap} PELOTITAS MÁX.`);
