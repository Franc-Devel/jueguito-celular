import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const root=decodeURIComponent(new URL('..',import.meta.url).pathname).replace(/\/$/,'');
const worldWidth=Number(process.env.PULSO_WIDTH)||420,worldHeight=Number(process.env.PULSO_HEIGHT)||550;
const source=fs.readFileSync(`${root}/public/game.js`,'utf8');
const bindings={};
for(const match of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g)){
  const exports=await import(pathToFileURL(`${root}/public/${match[2].replace(/^\.\//,'')}`));
  for(const raw of match[1].split(',')){
    const [name,alias]=raw.trim().split(/\s+as\s+/);bindings[alias||name]=exports[name];
  }
}
const code=source.replace(/^import[^\n]+\n/gm,'')+`
globalThis.gameProbe={init(n,gear='standard'){level=n;loadout=gear;W=${worldWidth};H=${worldHeight};start();},step(dt){update(dt);},state(){return s;},mode(){return mode;},choose(id){return chooseMutation(id);}};`;
const names=['standard','shield','rapid','blast'];
function simulate(level,pattern='objective',gear='standard',seed=1){
  let rng=seed>>>0;
  const math=Object.create(Math);math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
  const elements=new Map();
  function el(id){if(!elements.has(id))elements.set(id,{options:names.map(value=>({value})),value:'auto',style:{},classList:{add(){}},setAttribute(){},addEventListener(){},replaceChildren(){},append(){},showModal(){},close(){},focus(){},closest(){return this;},getBoundingClientRect(){return {width:worldWidth,height:worldHeight,left:0,top:0};},getContext(){return {};}});return elements.get(id);}
  const storage=new Map([['pulso-unlocked','100'],['pulso-gear',JSON.stringify(names.slice(1))],['pulso-loadout',gear]]);
  class AudioStub{enabled=false;unlock(){}setPlaying(){}play(){}setEnabled(v){this.enabled=v;}}
  const context=vm.createContext({...bindings,GameAudio:AudioStub,Math:math,document:{getElementById:el,addEventListener(){},createElement(){return el('canvas2');}},window:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>({matches:true}),ResizeObserver:class{observe(){}},requestAnimationFrame(){},devicePixelRatio:1});
  vm.runInContext(code,context);
  const game=context.gameProbe;game.init(level,gear);let moves=0,lastAim=.5,lastTarget=null,dodgeUntil=0,dodgeAim=.5;
  const trace=[];
  for(let frame=0;frame<120*60&&['playing','upgrade'].includes(game.mode());frame++){
    const s=game.state(),w=worldWidth,h=worldHeight,time=s.time;
    if(game.mode()==='upgrade'){const plan=bindings.levelPlan(level),priority=plan.army?['pierce','freeze','spread','heal','bounce']:plan.powerCap<=24||plan.pattern==='boss-rush'?['freeze','pierce','spread','heal','bounce']:['pierce','freeze','spread','heal','bounce'];const selected=priority.find(id=>s.choiceOptions.includes(id));game.choose(selected);continue;}
    let aim=.5,target=null;
    const eta=e=>e.speed>0?(h-75-e.y)/(e.speed*h/550):Infinity;
    const threats=s.enemies.filter(e=>e.hp>0&&e.kind!=='cache'&&e.kind!=='mine').sort((a,b)=>eta(a)-eta(b));
    const plan=bindings.levelPlan(level),gates=s.gates.filter(g=>plan.army?g.kind==='multiply'&&g.value>1&&g.y>h*.15&&g.y<h-70:!g.used&&g.y>h-180&&g.y<h-45).sort((a,b)=>(b.value??2)-(a.value??2)||b.y-a.y);
    const rewards=s.enemies.filter(e=>e.hp>0&&e.kind==='cache'&&e.y<h-160);
    if(pattern==='sweep'){aim=.5+.34*Math.sin(time*1.5);}
    else if(pattern==='center'){aim=.5;}
    else{
      target=threats[0];
      const imminent=target&&eta(target)<2.7;
      if(!imminent&&gates.length&&s.power<36)aim=(gates[0].x+gates[0].w/2)/w;
      else if(!imminent&&rewards.length&&(s.power<24||!s.rapid)){
        target=rewards.find(e=>s.power<24?e.route==='ammo':e.route==='rapid')||target;
        aim=target?target.x/w:.5;
      }else aim=target?target.x/w:.5;
      if(plan.army){
        const imminent=target&&eta(target)<2.5,portal=s.enemies.find(e=>e.route==='portal'&&e.hp>0);
        if(!imminent&&gates.length)aim=(gates[0].x+gates[0].w/2)/w;
        else if(!imminent&&portal&&s.power>=4)aim=portal.x/w;
      }
    }
    if(pattern==='objective'||pattern==='expert'){
      if(pattern==='expert'&&target?.boss){
        const flight=Math.max(0,(h-80-target.y)/(((plan.army?225:420)+target.speed)*h/550)),future=time+flight;
        if(target.bossKind==='charger')aim=((target.homeX??w*.5)+Math.sin(future*1.8+target.phase)*w*.25)/w;
        else if(target.bossKind==='armored')aim=((target.homeX??w*.5)+Math.sin(future*.75)*w*.12)/w;
        else if(target.bossKind==='swarm')aim=((target.homeX??target.x)+Math.sin(future*1.7+target.phase)*w*.06)/w;
        else aim=((target.homeX??w*.5)+Math.sin((future-(target.spawnAt??0))*.9)*w*.24)/w;
      }
      const pickup=s.pickups.filter(p=>!p.used&&p.y>h-170).sort((a,b)=>b.y-a.y).find(p=>p.kind==='civilian'||p.path===(process.env.PULSO_PATH||'safe'));
      if(pickup)aim=pickup.x/w;
      else if(!threats.some(e=>eta(e)<2)){
        const mine=s.enemies.find(e=>e.kind==='mine'&&e.hp>0&&eta(e)<3&&s.minesDefused<bindings.levelPlan(level).requiredMines);
        const turret=s.enemies.find(e=>['drone','base'].includes(e.kind)&&e.hp>0);
        if(mine||turret)aim=(mine||turret).x/w;
      }
      const danger=s.hostileShots.filter(p=>p.vy>0&&(h-48-p.y)/p.vy<.7&&(h-48-p.y)/p.vy>0).find(p=>Math.abs((p.x+p.vx*(h-48-p.y)/p.vy)-s.x*w)<28);
      const locked=s.enemies.some(e=>e.attackTarget&&e.fireIn<.3&&Math.abs(e.attackTarget.x-s.x*w)<30);
      if((danger||locked)&&!pickup&&time>=dodgeUntil){dodgeAim=Math.max(s.laneMin,Math.min(s.laneMax,s.x<.5?s.x+.12:s.x-.12));dodgeUntil=time+.4;}
      if(time<dodgeUntil)aim=dodgeAim;
      if(pattern==='expert'){
        const crossing=s.hostileShots.filter(p=>p.vy>0).map(p=>({t:(h-48-p.y)/p.vy,x:(p.x+p.vx*(h-48-p.y)/p.vy)/w}));
        for(const e of s.enemies){if(!e.attackTarget)continue;for(const p of bindings.hostileSalvo(e,e.attackTarget,w,h,bindings.attackProfile(level,e)))crossing.push({t:e.fireIn+(h-48-p.y)/p.vy,x:(p.x+p.vx*(h-48-p.y)/p.vy)/w});}
        const hazards=crossing.filter(p=>p.t>0&&p.t<1.1),wanted=aim;
        let best=aim,score=Infinity;
        for(let x=s.laneMin;x<=s.laneMax;x+=.02){let cost=Math.abs(x-wanted);for(const p of hazards){const at=s.x+Math.max(-.7*p.t,Math.min(.7*p.t,x-s.x)),distance=Math.abs(at-p.x)*w;if(distance<32)cost+=100+(32-distance);}if(cost<score){best=x;score=cost;}}
        if(hazards.length&&!pickup)aim=best;
      }
    }
    // Follow at the keyboard's actual maximum speed, rather than instant teleporting.
    const delta=Math.max(-.7/60,Math.min(.7/60,aim-s.x));s.x=Math.max(s.laneMin??.08,Math.min(s.laneMax??.92,s.x+delta));
    if(Math.abs(aim-lastAim)>.2){moves++;lastAim=aim;}
    if(target&&target!==lastTarget){lastTarget=target;}
    if(frame%(process.env.PULSO_TRACE?60:600)===0)trace.push({time:+time.toFixed(1),power:s.power,kills:s.kills,blocks:s.blocks,lives:s.lives,...(plan.army?{aim:+aim.toFixed(2),x:+s.x.toFixed(2),recruited:s.recruited,multiplied:s.multiplied}:{} )});
    game.step(1/60);
  }
  const s=game.state();
  return {level,pattern,gear,seed,result:game.mode(),seconds:+s.time.toFixed(1),power:s.power,kills:s.kills,blocks:s.blocks,rescued:s.rescued,mines:s.minesDefused,bases:s.basesDestroyed,mutations:s.mutationsChosen,path:s.path,caches:s.cachesOpened,bossesDown:s.bossesDown,lives:s.lives,boss:s.bossDefeated,moves,remaining:s.enemies.filter(e=>e.hp>0&&e.kind!=='cache').map(e=>({kind:e.kind,hp:e.hp,y:Math.round(e.y)})),trace};
}

const requested=process.argv.slice(2).filter(a=>/^\d+$/.test(a)).map(Number);
const levels=requested.length?requested:[1,10,20,30,40,50,60,70,80,90,100];
const patterns=(process.env.PULSO_PATTERNS||'objective,center,sweep').split(',');
const gears=(process.env.PULSO_GEARS||'standard,rapid').split(',');
const rows=[];
for(const level of levels)for(const pattern of patterns)for(const gear of gears){const row=simulate(level,pattern,gear,12345+level);rows.push(row);console.log(JSON.stringify(row));}
console.log(JSON.stringify({summary:{runs:rows.length,wins:rows.filter(r=>r.result==='won').length,byPattern:Object.fromEntries(patterns.map(p=>[p,{runs:rows.filter(r=>r.pattern===p).length,wins:rows.filter(r=>r.pattern===p&&r.result==='won').length}]))}}));
