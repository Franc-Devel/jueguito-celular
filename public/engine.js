import {levelPlan} from './campaign.js';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function levelConfig(level){
  const p=levelPlan(level),n=p.id;
  return {duration:p.duration,spawn:Math.max(.65,1.5-n*.0085),speed:38+n*.5,hp:2+Math.floor(n/10),basePower:p.startingPower,powerCap:p.powerCap,boss:24+n*4};
}
export function gatePower(power,kind,cap=48){return Math.min(cap,kind==='multiply'?power*2:power+2);}
export function freshState(level){const plan=levelPlan(level);return {level,x:.5,power:levelConfig(level).basePower,powerCap:levelConfig(level).powerCap,laneMin:levelPlan(level).roadStyle==='narrow'?.18:.08,laneMax:levelPlan(level).roadStyle==='narrow'?.82:.92,lives:3,time:0,score:0,bullets:[],enemies:[],gates:[],particles:[],rings:[],labels:[],lights:[],debris:[],combo:0,comboTime:0,spawn:3,shot:0,gate:0,nextGate:0,kills:0,blocks:0,blockSpawn:0,shake:0,flash:0,shield:0,rapid:false,blast:false,routeTimer:2,routeCount:0,waveIndex:0,obstacleIndex:0,cachesOpened:0,bossesDown:0,bossIndex:0,rescued:0,minesDefused:0,basesDestroyed:0,mutationsChosen:0,path:null,civilianIndex:0,mineIndex:0,droneIndex:0,baseIndex:0,pathIndex:0,choiceIndex:0,pickups:[],hostileShots:[],pierce:false,bounce:false,spread:false,freeze:false,invincible:0,bossesTotal:plan.bossSchedule.reduce((n,b)=>n+(b.kind==='swarm'?3:1),0),fork:null,bossDefeated:false,bossSpawned:false};}

export function volley(power,x,y,width,options={}){
  const count=clamp(Math.floor(power),1,48),columns=Math.min(count,8),group={count};
  return Array.from({length:count},(_,i)=>{
    const row=Math.floor(i/columns),rowSize=Math.min(columns,count-row*columns);
    return {x:clamp(x+(i%columns-(rowSize-1)/2)*(options.spread?17:9),14,width-14),y:y+row*10,damage:1,group,passed:[],hitTargets:[],pierceLeft:options.pierce?2:0,freeze:!!options.freeze,bounce:!!options.bounce,vx:options.bounce?(i%2?85:-85)*width/390:0,spread:0};
  });
}

// Swept crossing uses both previous positions so fast frames cannot skip a gate.
export function multiplyAtGate(bullet,gate,previousY){
  const oldGateY=gate.previousY??gate.y,oldDistance=previousY-(oldGateY+19),newDistance=bullet.y-(gate.y+19);
  const fraction=oldDistance/(oldDistance-newDistance),xAt=(bullet.previousX??bullet.x)+(bullet.x-(bullet.previousX??bullet.x))*fraction;
  if(!Number.isFinite(fraction)||fraction<0||fraction>1)return null;
  const gateX=(gate.previousX??gate.x)+(gate.x-(gate.previousX??gate.x))*fraction;
  if(gate.kind!=='multiply'||bullet.passed.includes(gate.id)||
     xAt<gateX||xAt>gateX+gate.w||
     previousY<(gate.previousY??gate.y)+19||bullet.y>gate.y+19)return null;
  bullet.passed.push(gate.id);
  if(bullet.group.count>=192)return null;
  bullet.group.count++;
  const clone={...bullet,passed:[...bullet.passed],hitTargets:[...(bullet.hitTargets||[])],vx:bullet.bounce?Math.abs(bullet.vx):26,spread:.22};
  bullet.vx=bullet.bounce?-Math.abs(bullet.vx):-26;bullet.spread=.22;
  return clone;
}

// Earliest hit against a moving enemy along the whole bullet segment.
export function projectileHit(bullet,previousY,enemy){
  if(enemy.hp<=0)return null;
  const sx=(bullet.previousX??bullet.x)-(enemy.previousX??enemy.x),sy=previousY-(enemy.previousY??enemy.y);
  const dx=(bullet.x-(bullet.previousX??bullet.x))-(enemy.x-(enemy.previousX??enemy.x)),dy=(bullet.y-previousY)-(enemy.y-(enemy.previousY??enemy.y));
  const radius=enemy.r+4,c=sx*sx+sy*sy-radius*radius;
  if(c<=0)return 0;
  const a=dx*dx+dy*dy;if(a===0)return null;
  const b=2*(sx*dx+sy*dy),discriminant=b*b-4*a*c;
  if(discriminant<0)return null;
  const t=(-b-Math.sqrt(discriminant))/(2*a);
  return t>=0&&t<=1?t:null;
}
export function resizeWorld(state,oldW,oldH,newW,newH){
  const xScale=newW/oldW,yScale=newH/oldH;
  if(state.fork){state.fork.top*=yScale;state.fork.bottom*=yScale;}
  for(const collection of [state.enemies,state.bullets,state.gates,state.particles,state.rings,state.labels,state.lights,state.debris,state.pickups,state.hostileShots]){
    for(const item of collection||[]){item.x*=xScale;item.y*=yScale;if(typeof item.vx==='number')item.vx*=xScale;if(typeof item.vy==='number')item.vy*=yScale;if(item.w)item.w*=xScale;if(item.homeX!==undefined)item.homeX*=xScale;if(item.previousY!==undefined)item.previousY*=yScale;if(item.previousX!==undefined)item.previousX*=xScale;}
  }
}

export function routeReward(state,route){
  if(route==='ammo'){const old=state.power;state.power=Math.min(state.powerCap??48,state.power+3);return state.power>old?`+${state.power-old} PELOTITAS`:'PODER AL MÁXIMO';}
  if(route==='shield'){state.shield=Math.min(3,state.shield+1);return 'ESCUDO ACTIVADO';}
  if(route==='rapid'){state.rapid=true;return 'RÁFAGA ACTIVADA';}
  if(route==='blast'){state.blast=true;return 'EXPLOSIVO ACTIVADO';}
  return null;
}

export function damageOnImpact(enemy,damage){return enemy.bossKind==='armored'&&enemy.armorActive?damage*.12:damage;}

export const MUTATIONS=[
  {id:'pierce',name:'Perforación',description:'Cada pelotita puede atravesar hasta 3 enemigos.',color:'#97e7ff'},
  {id:'bounce',name:'Rebote',description:'Los disparos viajan en diagonal y rebotan en los bordes.',color:'#ffe18e'},
  {id:'spread',name:'Dispersión',description:'La misma cantidad de pelotitas cubre una franja más ancha.',color:'#e3adff'},
  {id:'freeze',name:'Hielo',description:'Los impactos frenan al enemigo durante 1,5 segundos.',color:'#adf9f4'},
  {id:'heal',name:'Reparación',description:'Recuperá una vida del convoy, hasta 3.',color:'#a7f799'}
];
export function applyMutation(state,id){
  if(id==='heal')state.lives=Math.min(3,state.lives+1);
  else if(['pierce','bounce','spread','freeze'].includes(id))state[id]=true;
  else return false;
  state.mutationsChosen++;return true;
}
export function missionObjectives(plan,state){
  return state.kills>=plan.killTarget&&state.blocks>=plan.requiredBlocks&&state.cachesOpened>=plan.requiredCaches&&
    state.rescued>=plan.requiredRescues&&state.minesDefused>=plan.requiredMines&&state.basesDestroyed>=plan.requiredBases&&
    state.mutationsChosen>=plan.requiredMutations&&(!plan.requiredPath||!!state.path);
}
