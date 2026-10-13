export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function levelConfig(level){const n=clamp(Math.floor(level),1,100);return {duration:28+Math.min(n,30)*.3,spawn:Math.max(.42,1.5-n*.011),speed:38+n*.8,hp:2+Math.floor(n/5),boss:24+n*4};}
export function gatePower(power,kind){return Math.min(48,kind==='multiply'?power*2:power+2);}
export function freshState(level){return {level,x:.5,power:1,lives:3,time:0,score:0,bullets:[],enemies:[],gates:[],particles:[],rings:[],labels:[],spawn:0,shot:0,gate:0,nextGate:0,bossSpawned:false};}

export function volley(power,x,y,width){
  const count=clamp(Math.floor(power),1,48),columns=Math.min(count,8),group={count};
  return Array.from({length:count},(_,i)=>{
    const row=Math.floor(i/columns),rowSize=Math.min(columns,count-row*columns);
    return {x:clamp(x+(i%columns-(rowSize-1)/2)*9,14,width-14),y:y+row*10,damage:1,group,passed:[],vx:0,spread:0};
  });
}

// Swept crossing uses both previous positions so fast frames cannot skip a gate.
export function multiplyAtGate(bullet,gate,previousY){
  if(gate.kind!=='multiply'||bullet.passed.includes(gate.id)||
     bullet.x<gate.x||bullet.x>gate.x+gate.w||
     previousY<(gate.previousY??gate.y)+19||bullet.y>gate.y+19)return null;
  bullet.passed.push(gate.id);
  if(bullet.group.count>=192)return null;
  bullet.group.count++;
  const clone={...bullet,passed:[...bullet.passed],vx:26,spread:.22};
  bullet.vx=-26;bullet.spread=.22;
  return clone;
}
