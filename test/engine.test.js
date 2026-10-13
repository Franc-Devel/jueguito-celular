import test from 'node:test';import assert from 'node:assert/strict';import {levelConfig,gatePower,freshState} from '../public/engine.js';
test('100 niveles con dificultad creciente y parámetros válidos',()=>{for(let n=1;n<=100;n++){const c=levelConfig(n);assert.ok(c.duration>0&&c.spawn>0&&c.hp>0);if(n>1){assert.ok(c.boss>levelConfig(n-1).boss);assert.ok(c.spawn<=levelConfig(n-1).spawn);}}});
test('puertas multiplican y suman sin superar el límite',()=>{assert.equal(gatePower(3,'multiply'),6);assert.equal(gatePower(3,'add'),5);assert.equal(gatePower(40,'multiply'),48);});
test('cada intento reinicia vidas, poder y entidades',()=>{const a=freshState(10);a.enemies.push({});const b=freshState(10);assert.equal(b.lives,3);assert.equal(b.power,1);assert.deepEqual(b.enemies,[]);});

import {volley} from '../public/engine.js';
test('el poder representa la cantidad real de pelotitas, cada una con daño uno',()=>{for(let power=1;power<=48;power++){const balls=volley(power,195,470,390);assert.equal(balls.length,power);assert.equal(balls.reduce((sum,b)=>sum+b.damage,0),power);assert.ok(balls.every(b=>b.x>=14&&b.x<=376));assert.equal(new Set(balls.map(b=>`${b.x},${b.y}`)).size,power);}});
test('multiplicar por dos duplica la cantidad de proyectiles',()=>{assert.equal(volley(gatePower(1,'multiply'),100,300,390).length,2);assert.equal(volley(gatePower(6,'multiply'),100,300,390).length,12);});

import {multiplyAtGate} from '../public/engine.js';
const gate={id:1,kind:'multiply',x:50,w:100,y:100,previousY:98};
test('los proyectiles se duplican al cruzar ×2 y conservan su daño',()=>{const b=volley(1,100,130,390)[0];b.y=110;const copy=multiplyAtGate(b,gate,130);assert.ok(copy);assert.equal(copy.damage,1);assert.equal(b.group.count,2);assert.equal(copy.group,b.group);assert.equal(multiplyAtGate(b,gate,130),null);assert.equal(multiplyAtGate(copy,gate,130),null);});
test('no multiplica tiros fuera de la puerta o sin cruzarla',()=>{let b=volley(1,200,130,390)[0];b.y=110;assert.equal(multiplyAtGate(b,gate,130),null);b=volley(1,100,140,390)[0];assert.equal(multiplyAtGate(b,gate,150),null);assert.equal(multiplyAtGate(b,{...gate,kind:'add'},150),null);});
test('permite encadenar puertas y limita cada ráfaga a 192 pelotitas',()=>{const b=volley(1,100,130,390)[0];b.y=90;assert.ok(multiplyAtGate(b,gate,130));assert.ok(multiplyAtGate(b,{...gate,id:2,y:80,previousY:80},110));b.group.count=192;assert.equal(multiplyAtGate(b,{...gate,id:3},130),null);assert.equal(b.group.count,192);});

import {mission,missionComplete,project,configureScene} from '../public/scenery.js';
test('misiones recorren cinco regiones y exigen todos sus objetivos',()=>{assert.equal(new Set(Array.from({length:100},(_,i)=>mission(i+1).zone.name)).size,5);const a=mission(1),b=mission(2);assert.equal(missionComplete(1,a.killTarget-1,0),false);assert.equal(missionComplete(1,a.killTarget,0),true);assert.equal(missionComplete(2,b.killTarget,b.requiredBlocks,{caches:1}),false);assert.equal(missionComplete(2,b.killTarget,b.requiredBlocks,{caches:2}),true);assert.equal(mission(3).pattern,'runner-chase');});
test('perspectiva mantiene el centro y acerca los objetos sin cambiar su orden',()=>{const top=project(100,0,390,664),bottom=project(100,664,390,664);assert.ok(top.scale<bottom.scale);assert.ok(top.y<bottom.y);assert.equal(project(195,200,390,664).x,195);assert.ok(top.x>bottom.x);});

import {projectileHit,resizeWorld} from '../public/engine.js';
test('un proyectil rápido alcanza al enemigo aunque termine al otro lado',()=>{const e={x:100,y:150,previousY:149,hp:2,r:18};const b={x:100,y:110};const t=projectileHit(b,200,e);assert.ok(t>0&&t<1);assert.equal(projectileHit({...b,x:150},200,e),null);assert.equal(projectileHit(b,200,{...e,hp:0}),null);});
test('detecta enemigos que cruzan la trayectoria durante un cuadro',()=>{const e={x:100,y:150,previousY:100,hp:2,r:18};assert.ok(projectileHit({x:100,y:125},140,e)!==null);});
test('rotar reescala el mundo y las puertas sin perder entidades',()=>{const s=freshState(20);s.enemies.push({x:100,y:200,previousY:195});s.gates.push({x:50,y:100,w:120,previousY:99});s.bullets.push(...volley(2,100,200,390));resizeWorld(s,390,550,780,330);assert.equal(s.enemies[0].x,200);assert.equal(s.enemies[0].y,120);assert.equal(s.gates[0].w,240);assert.equal(s.bullets.length,2);assert.equal(s.power,2);});
test('niveles altos arrancan con un arma adecuada y preparación inicial',()=>{assert.ok(freshState(100).power>freshState(1).power);assert.equal(freshState(1).spawn,3);assert.ok(levelConfig(100).spawn>=.65);});

import {routeReward} from '../public/engine.js';
test('cada camino concede una recompensa distinta con límites seguros',()=>{const s=freshState(1);routeReward(s,'ammo');assert.equal(s.power,4);routeReward(s,'shield');assert.equal(s.shield,1);routeReward(s,'rapid');assert.equal(s.rapid,true);routeReward(s,'blast');assert.equal(s.blast,true);for(let i=0;i<100;i++){routeReward(s,'ammo');routeReward(s,'shield');}assert.equal(s.power,48);assert.equal(s.shield,3);});

import {routeOptions} from '../public/routes.js';
test('las rutas presentan munición a la izquierda y tres mejoras de taller a la derecha',()=>{const rewards=new Set();for(let i=0;i<3;i++){const [left,right]=routeOptions(1,390,650,i);assert.equal(left.route,'ammo');assert.ok(left.x<right.x);assert.ok(left.hp>0&&right.hp>0);rewards.add(right.route);}assert.deepEqual([...rewards].sort(),['blast','rapid','shield']);});

import {levelPlan} from '../public/campaign.js';
import {damageOnImpact} from '../public/engine.js';
test('la campaña contiene 100 diseños de encuentros distintos y reproducibles',()=>{
  const signatures=new Set();
  for(let i=1;i<=100;i++){const p=levelPlan(i);assert.deepEqual(levelPlan(i),p);signatures.add(JSON.stringify({waves:p.waves.map(w=>({lane:w.lane,formation:w.formation,kinds:w.kinds})),obstacles:p.obstacles.map(o=>o.lane),gates:p.gateSequence,routes:p.routeSequence,cap:p.powerCap,boss:p.bossKind}));}
  assert.equal(signatures.size,100);
});
test('cada misión puede cumplir sus objetivos con los encuentros programados',()=>{for(let i=1;i<=100;i++){const p=levelPlan(i),total=p.waves.reduce((n,w)=>n+w.kinds.length,0);assert.ok(total>=p.killTarget);assert.ok(p.obstacles.length>=p.requiredBlocks);assert.ok(p.spawnRoutesAt.length*2>=p.requiredCaches);assert.ok(p.waves.every(w=>w.at>0&&w.at<p.duration));assert.ok(p.obstacles.every(o=>o.at>0&&o.at<p.duration));assert.ok(p.startingPower<=p.powerCap);}});
test('el 49, 50 y 51 cambian enemigos, clima, trazado y obstáculos',()=>{const a=levelPlan(49),b=levelPlan(50),c=levelPlan(51);assert.equal(a.bossKind,'swarm');assert.equal(b.roadStyle,'sCurve');assert.equal(b.timeOfDay,'night');assert.equal(b.weather,'rain');assert.ok(b.requiredBlocks>0);assert.equal(c.timeOfDay,'day');assert.equal(c.requiredBlocks,0);assert.notDeepEqual(a.waves,b.waves);assert.notDeepEqual(b.waves,c.waves);});
test('las curvas cambian la carretera y mantienen alineado el vehículo',()=>{configureScene(levelPlan(50));const middle=project(195,300,390,664),player=project(195,620,390,664);assert.notEqual(middle.x,195);assert.equal(player.x,195);configureScene();});
test('las misiones de pocas reservas conservan el límite de poder',()=>{const s=freshState(17);for(let i=0;i<30;i++)routeReward(s,'ammo');assert.equal(s.power,levelPlan(17).powerCap);assert.equal(gatePower(s.power,'multiply',s.powerCap),s.powerCap);});
test('el jefe acorazado reduce el daño solo durante su fase de blindaje',()=>{assert.equal(damageOnImpact({bossKind:'armored',armorActive:true},10),1.2);assert.equal(damageOnImpact({bossKind:'armored',armorActive:false},10),10);assert.equal(damageOnImpact({bossKind:'brute'},10),10);});

test('los pasos estrechos reducen el espacio disponible para maniobrar',()=>{assert.equal(freshState(6).laneMin,.18);assert.equal(freshState(6).laneMax,.82);assert.equal(freshState(51).laneMin,.08);assert.equal(freshState(51).laneMax,.92);});

import {applyMutation,missionObjectives} from '../public/engine.js';
test('hay siete mecánicas adicionales, con objetivos que cambian cómo se juega',()=>{const expected={11:'rescue',12:'evolution',13:'minefield',14:'siege',15:'crossfire',18:'branch-choice',20:'boss-rush'};for(const [n,type] of Object.entries(expected))assert.equal(levelPlan(Number(n)).pattern,type);assert.equal(levelPlan(11).endMode,'timed');assert.equal(levelPlan(14).endMode,'siege');});
test('los objetivos nuevos requieren rescatar, desactivar y destruir las bases',()=>{for(const [n,key,goal] of [[11,'rescued','requiredRescues'],[13,'minesDefused','requiredMines'],[14,'basesDestroyed','requiredBases'],[12,'mutationsChosen','requiredMutations']]){const p=levelPlan(n),s=freshState(n);s.kills=p.killTarget;s.blocks=p.requiredBlocks;s.cachesOpened=p.requiredCaches;s[key]=p[goal]-1;assert.equal(missionObjectives(p,s),false);s[key]++;assert.equal(missionObjectives(p,s),true);}});
test('las mutaciones alteran el disparo manteniendo la cantidad de pelotitas',()=>{const s=freshState(12);applyMutation(s,'pierce');applyMutation(s,'bounce');applyMutation(s,'spread');const v=volley(6,195,300,390,s);assert.equal(v.length,6);assert.ok(v.every(b=>b.pierceLeft===2&&b.bounce));assert.ok(v[0].vx<0&&v[1].vx>0);assert.ok(v[5].x-v[0].x>volley(6,195,300,390)[5].x-volley(6,195,300,390)[0].x);assert.equal(s.mutationsChosen,3);});
test('el maratón de jefes programa tres duelos y el rescate no impone un mutante',()=>{const p=levelPlan(20);assert.equal(p.bossSchedule.length,3);assert.ok(p.bossSchedule[0].at<p.bossSchedule[1].at&&p.bossSchedule[1].at<p.bossSchedule[2].at);assert.equal(freshState(20).bossesTotal,3);assert.equal(levelPlan(11).bossSchedule.length,0);});
test('una puerta móvil multiplica en el punto real del cruce',()=>{const b=volley(1,100,150,390)[0];b.y=90;const g={id:123,kind:'multiply',x:120,previousX:20,w:60,y:100,previousY:100};assert.ok(multiplyAtGate(b,g,150));const miss=volley(1,250,150,390)[0];miss.y=90;assert.equal(multiplyAtGate(miss,g,150),null);});
test('la bifurcación exige una elección y los nuevos objetivos tienen entidades suficientes',()=>{const p=levelPlan(18),s=freshState(18);s.kills=p.killTarget;s.blocks=p.requiredBlocks;s.cachesOpened=p.requiredCaches;assert.equal(missionObjectives(p,s),false);s.path='safe';assert.equal(missionObjectives(p,s),true);for(let n=1;n<=100;n++){const plan=levelPlan(n);assert.ok(plan.civilians.length>=plan.requiredRescues);assert.ok(plan.mines.length>=plan.requiredMines);assert.ok(plan.bases.length>=plan.requiredBases);assert.ok(plan.choiceAt.length>=plan.requiredMutations);}});
