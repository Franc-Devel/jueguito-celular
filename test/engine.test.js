import test from 'node:test';import assert from 'node:assert/strict';import {levelConfig,gatePower,freshState} from '../public/engine.js';
test('100 niveles con dificultad creciente y parámetros válidos',()=>{for(let n=1;n<=100;n++){const c=levelConfig(n);assert.ok(c.duration>0&&c.spawn>0&&c.hp>0);if(n>1){assert.ok(c.boss>levelConfig(n-1).boss);assert.ok(c.spawn<=levelConfig(n-1).spawn);}}});
test('puertas multiplican y suman sin superar el límite',()=>{assert.equal(gatePower(3,'multiply'),6);assert.equal(gatePower(3,'add'),5);assert.equal(gatePower(40,'multiply'),48);});
test('cada intento reinicia vidas, poder y entidades',()=>{const a=freshState(10);a.enemies.push({});const b=freshState(10);assert.equal(b.lives,3);assert.equal(b.power,1);assert.deepEqual(b.enemies,[]);});

import {volley} from '../public/engine.js';
test('el poder representa la cantidad real de pelotitas, cada una con daño uno',()=>{for(let power=1;power<=48;power++){const balls=volley(power,195,470,390);assert.equal(balls.length,power);assert.equal(balls.reduce((sum,b)=>sum+b.damage,0),power);assert.ok(balls.every(b=>b.x>=14&&b.x<=376));assert.equal(new Set(balls.map(b=>`${b.x},${b.y}`)).size,power);}});
test('multiplicar por dos duplica la cantidad de proyectiles',()=>{assert.equal(volley(gatePower(1,'multiply'),100,300,390).length,2);assert.equal(volley(gatePower(6,'multiply'),100,300,390).length,12);});
