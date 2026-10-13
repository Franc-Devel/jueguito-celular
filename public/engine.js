export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function levelConfig(level){const n=clamp(Math.floor(level),1,100);return {duration:28+Math.min(n,30)*.3,spawn:Math.max(.42,1.5-n*.011),speed:38+n*.8,hp:2+Math.floor(n/5),boss:24+n*4};}
export function gatePower(power,kind){return Math.min(48,kind==='multiply'?power*2:power+2);}
export function freshState(level){return {level,x:.5,power:1,lives:3,time:0,score:0,bullets:[],enemies:[],gates:[],particles:[],spawn:0,shot:0,gate:0,bossSpawned:false};}
