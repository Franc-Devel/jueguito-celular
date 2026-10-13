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

import {mission,missionComplete,project} from '../public/scenery.js';
test('misiones recorren cinco regiones y exigen los objetivos correctos',()=>{assert.equal(new Set(Array.from({length:100},(_,i)=>mission(i+1).zone.name)).size,5);assert.equal(missionComplete(1,5,0),false);assert.equal(missionComplete(1,6,0),true);assert.equal(missionComplete(2,100,1),false);assert.equal(missionComplete(2,0,2),true);assert.equal(mission(3).type,2);});
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
