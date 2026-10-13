export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function levelConfig(level){const n=clamp(Math.floor(level),1,100);return {duration:28+Math.min(n,30)*.3,spawn:Math.max(.65,1.5-n*.0085),speed:38+n*.5,hp:2+Math.floor(n/10),basePower:Math.min(12,1+Math.floor((n-1)/10)),boss:24+n*4};}
export function gatePower(power,kind){return Math.min(48,kind==='multiply'?power*2:power+2);}
export function freshState(level){return {level,x:.5,power:levelConfig(level).basePower,lives:3,time:0,score:0,bullets:[],enemies:[],gates:[],particles:[],rings:[],labels:[],lights:[],debris:[],combo:0,comboTime:0,spawn:3,shot:0,gate:0,nextGate:0,kills:0,blocks:0,blockSpawn:0,shake:0,flash:0,shield:0,rapid:false,blast:false,routeTimer:2,routeCount:0,fork:null,bossDefeated:false,bossSpawned:false};}

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

// Earliest hit against a moving enemy along the whole bullet segment.
export function projectileHit(bullet,previousY,enemy){
  if(enemy.hp<=0)return null;
  const sx=(bullet.previousX??bullet.x)-enemy.x,sy=previousY-(enemy.previousY??enemy.y);
  const dx=bullet.x-(bullet.previousX??bullet.x),dy=(bullet.y-previousY)-(enemy.y-(enemy.previousY??enemy.y));
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
  for(const collection of [state.enemies,state.bullets,state.gates,state.particles,state.rings,state.labels,state.lights,state.debris]){
    for(const item of collection||[]){item.x*=xScale;item.y*=yScale;if(item.w)item.w*=xScale;if(item.previousY!==undefined)item.previousY*=yScale;if(item.previousX!==undefined)item.previousX*=xScale;}
  }
}

export function routeReward(state,route){
  if(route==='ammo'){state.power=Math.min(48,state.power+3);return '+3 PELOTITAS';}
  if(route==='shield'){state.shield=Math.min(3,state.shield+1);return 'ESCUDO ACTIVADO';}
  if(route==='rapid'){state.rapid=true;return 'RÁFAGA ACTIVADA';}
  if(route==='blast'){state.blast=true;return 'EXPLOSIVO ACTIVADO';}
  return null;
}
