// Authored mission rules. The level number changes the encounter itself, rather
// than only making the same randomly positioned enemies stronger. All schedules
// are deterministic so a retry lets the player learn a route.
const TYPES = [
  {pattern:'evacuation',title:'Convoy de evacuación',briefing:'Despejá las columnas y elegí una puerta para preparar el cañón.',roadStyle:'straight',weather:'clear',timeOfDay:'day',bossKind:'brute',powerCap:48,gateInterval:4.2},
  {pattern:'supply-crossing',title:'Cruce de suministros',briefing:'Abrí 2 cajas de suministros para completar la misión. Elegí munición o taller en cada cruce.',roadStyle:'split',weather:'clear',timeOfDay:'dusk',bossKind:'armored',powerCap:48,gateInterval:3.8},
  {pattern:'runner-chase',title:'Carrera de los infectados',briefing:'Los corredores aceleran por turnos. Cambiá de carril antes de la próxima oleada.',roadStyle:'leftBend',weather:'rain',timeOfDay:'day',bossKind:'charger',powerCap:32,gateInterval:4.5},
  {pattern:'armored-convoy',title:'Columna blindada',briefing:'Concentrá los disparos en los blindados y aprovechá las puertas multiplicadoras.',roadStyle:'rightBend',weather:'ash',timeOfDay:'night',bossKind:'armored',powerCap:48,gateInterval:4},
  {pattern:'pincer',title:'Pinza en la autopista',briefing:'Te atacan desde ambos costados. Alterná el fuego y no descuides el centro.',roadStyle:'sCurve',weather:'rain',timeOfDay:'dusk',bossKind:'charger',powerCap:40,gateInterval:4.4},
  {pattern:'barricade-slalom',title:'Slalom del bloqueo',briefing:'Rompé las barricadas señaladas. La ruta angosta obliga a apuntar y cambiar de lado.',roadStyle:'narrow',weather:'snow',timeOfDay:'day',bossKind:'brute',powerCap:32,gateInterval:4.6},
  {pattern:'limited-ammo',title:'Cruce sin reservas',briefing:'Hay menos poder disponible. Priorizá la munición y eliminá blancos uno por uno.',roadStyle:'split',weather:'fog',timeOfDay:'night',bossKind:'armored',powerCap:24,gateInterval:6},
  {pattern:'curve-ambush',title:'Emboscada en la curva',briefing:'Los enemigos llegan en grupos separados por pausas. Prepará el taller antes de la emboscada.',roadStyle:'leftBend',weather:'fog',timeOfDay:'night',bossKind:'charger',powerCap:40,gateInterval:5},
  {pattern:'swarm',title:'Marea de infectados',briefing:'La horda es enorme pero frágil. Multiplicá las pelotitas y barré la carretera.',roadStyle:'narrow',weather:'ash',timeOfDay:'dusk',bossKind:'swarm',powerCap:48,gateInterval:3.5},
  {pattern:'elite-gauntlet',title:'Último peaje',briefing:'Blindados, corredores y bloqueos combinados. Abrí el taller y superá el asalto final.',roadStyle:'sCurve',weather:'rain',timeOfDay:'night',bossKind:'brute',powerCap:48,gateInterval:4.1}
];
// Complete campaign roster. Familiar and new objectives are interleaved in
// every chapter after the introductions; the roster is not a repeating loop.
// 0..9 combat styles; 10 rescue, 11 mutations, 12 mines, 13 siege,
// 14 drones, 15 branch decisions, 16 staged boss battles.
export const CAMPAIGN_ROSTER=[
  0,1,2,3,4,5,6,7,8,9,
  10,11,12,13,14,5,6,15,8,16,
  3,10,4,12,1,13,11,8,14,16,
  15,2,13,5,10,11,7,14,12,9,
  12,3,11,10,15,13,6,14,8,9,
  10,11,12,13,14,5,6,15,8,16,
  4,13,10,14,6,11,12,3,15,16,
  11,5,15,12,8,10,13,2,14,9,
  13,14,6,10,4,12,11,15,3,16,
  10,12,13,11,14,15,7,5,8,16
];
const SPECIAL_BASE={10:0,11:1,12:2,13:3,14:4,15:7,16:9};
const FORMATIONS = ['line','v','alternating','flanks','cluster'];
const TECH = ['shield','rapid','blast'];
const round = value => Math.round(value * 1000) / 1000;
const bound = (value,low,high) => Math.max(low,Math.min(high,value));

function encounter(pattern,index,act,level) {
  const shift = (level + act + index) % 3;
  switch(pattern) {
    case 'evacuation':
      return {formation:index % 2 ? 'v' : 'line',lane:shift,kinds:Array.from({length:3 + Math.floor(act/4)},(_,j)=>level > 10 && (index+j)%5===0?'runner':'walker'),speedScale:.86 + (index%3)*.07,hpScale:.9};
    case 'supply-crossing':
      return {formation:index%2?'alternating':'flanks',lane:(index+act)%3,kinds:index%3===2&&level>10?['walker','tank','walker']:['walker','walker',...(index%2?['walker']:[])],speedScale:.9,hpScale:.88};
    case 'runner-chase':
      return {formation:index%2?'alternating':'v',lane:index%2?2:0,kinds:index%3===0?['walker','runner','walker']:['runner','runner',...(act>2?['walker']:[])],speedScale:1 + (index%3)*.09,hpScale:.74};
    case 'armored-convoy':
      return {formation:index%3===0?'line':'v',lane:shift,kinds:index%2?['walker','tank','walker']:['tank',...(act>1?['tank']:[]),'walker'],speedScale:.76 + (index%2)*.06,hpScale:1.08};
    case 'pincer':
      return {formation:'flanks',lane:index%2?2:0,kinds:index%3===1?['runner','walker','walker','runner']:['walker','runner','runner','walker'],speedScale:.95 + (index%2)*.13,hpScale:.82};
    case 'barricade-slalom':
      return {formation:index%2?'alternating':'line',lane:shift,kinds:index%3===2?['walker','runner']:['walker','walker','walker'],speedScale:.78,hpScale:.84};
    case 'limited-ammo':
      return {formation:index%2?'line':'alternating',lane:shift,kinds:index%4===3?['tank','walker']:['walker',...(index%2?['runner']:['walker'])],speedScale:.84 + (index%2)*.08,hpScale:.65};
    case 'curve-ambush':
      return {formation:index%3===2?'cluster':'alternating',lane:(level+index*2)%3,kinds:index%3===2?['tank','runner','walker','runner']:index%3===1?['runner','runner']:['walker','walker','walker'],speedScale:index%3===1?1.15:.9,hpScale:.87};
    case 'swarm':
      return {formation:index%3===0?'flanks':'cluster',lane:shift,kinds:Array.from({length:6 + (index%2) + Math.floor(act/4)},(_,j)=>(index+j)%5===0?'runner':'walker'),speedScale:.86 + (index%3)*.04,hpScale:.46};
    default:
      return {formation:FORMATIONS[(index+act)%FORMATIONS.length],lane:shift,kinds:index%3===0?['tank','walker','runner','tank']:index%3===1?['runner','walker','runner','walker']:['walker','tank','walker','runner'],speedScale:.96 + (index%2)*.08,hpScale:.93};
  }
}

function waveSchedule(n,act,pattern,duration) {
  let count = 7 + Math.floor(act/3);
  if(pattern==='swarm')count+=3;
  if(pattern==='curve-ambush')count+=2;
  if(n<=3)count=n===1?6:7;
  const first = n<=3 ? 4 : 3.4 + (n%4)*.18;
  const end = duration - 9.05;
  return Array.from({length:count},(_,index)=>{
    let fraction = index/(count-1);
    // Short ambush bursts followed by a recovery interval; not an even spawn loop.
    if(pattern==='curve-ambush')fraction=(Math.floor(index/3)*3+(index%3)*.62)/(Math.floor((count-1)/3)*3+((count-1)%3)*.62);
    const jitter = index===0||index===count-1?0:(((n*7+index*11)%17)-8)*.019;
    const wave=encounter(pattern,index,act,n);
    if(n===1)wave.kinds=['walker','walker'];
    if(n===2)wave.kinds=['walker','walker',...(index%2?['walker']:[])];
    // A tiny per-level cadence offset combines with lane/formation changes so
    // repeated archetypes remain different layouts across the ten chapters.
    return {at:round(first+(end-first)*fraction+jitter),...wave,hpScale:round(wave.hpScale+act*.018),speedScale:round(wave.speedScale+act*.012)};
  });
}

function obstacleSchedule(n,act,pattern,duration) {
  let count = 0;
  if(pattern==='barricade-slalom')count=4+Math.floor(act/4);
  else if(pattern==='elite-gauntlet')count=2+act%2;
  else if(pattern==='supply-crossing'||pattern==='armored-convoy')count=1+(act>3?1:0);
  else if(pattern==='curve-ambush'&&act>1)count=2;
  if(n===2)count=1;
  if(!count)return [];
  const first=n===2?10:7.5;
  const end=duration-12.05;
  return Array.from({length:count},(_,index)=>({at:round(count===1?Math.min(11.5,end):first+(end-first)*index/(count-1)),lane:(n+index*2+act)%3,kind:'barricade'}));
}

/**
 * Return a fresh, deterministic plan for a level (1..100).
 * Lane indices are left=0, center=1, right=2. Wave times are seconds from
 * mission start; kinds lists define exactly how many enemies the wave contains.
 * Gates/routing sequences cycle independently, while authored waves/obstacles
 * fire once. The boss comes after duration and is required for every mission.
 */
export function levelPlan(level) {
  const numeric=Number(level),n=bound(Number.isFinite(numeric)?Math.floor(numeric):1,1,100);
  const act=Math.floor((n-1)/10),variant=CAMPAIGN_ROSTER[n-1],archetype=variant>=10?SPECIAL_BASE[variant]:variant,type=TYPES[archetype];
  const duration=round(bound(28+act*.7+(archetype===8?4:archetype===9?5:archetype===5?3:1)+(n%3)*.6,28,42));
  const waves=waveSchedule(n,act,type.pattern,duration),obstacles=obstacleSchedule(n,act,type.pattern,duration);
  const totalEnemies=waves.reduce((sum,wave)=>sum+wave.kinds.length,0);
  const powerCap=type.pattern==='limited-ammo'?(act%2?16:24):type.powerCap;
  const startingPower=n===3?2:Math.min(10,1+act);
  const roadStyle=type.roadStyle==='leftBend'&&act%2?'rightBend':type.roadStyle==='rightBend'&&act%2?'leftBend':type.roadStyle==='straight'&&act>=5?'sCurve':type.roadStyle;
  const weather=n===1||n===2?'clear':n===3?'rain':act===6||act===7?(type.weather==='fog'?'fog':'snow'):type.weather;
  const gateSequence=Array.from({length:4},(_,index)=>({lane:n<=2?(index%2?2:0):(n+index*2+act)%3,kind:type.pattern==='limited-ammo'?'add':index===0||((index+archetype+act)%3!==1)?'multiply':'add'}));
  const routeSequence=Array.from({length:4},(_,index)=>{
    const ammoLane=n<=3?0:(act+archetype+index)%2?2:0;
    return {ammoLane,techLane:2-ammoLane,tech:TECH[(act+archetype+index)%TECH.length]};
  });
  const spawnRoutesAt=[2,10,round(Math.min(20,duration-10))];
  const requiredBlocks=type.pattern==='barricade-slalom'?Math.min(4,obstacles.length-1):type.pattern==='elite-gauntlet'?obstacles.length:0;
  const requiredCaches=type.pattern==='supply-crossing'?2:0;
  const killTarget=Math.max(3,Math.floor(totalEnemies*.3));
  const plan={id:n,title:`${type.title} · ${act+1}`,briefing:n===1?'Mové el convoy con el dedo o el mouse. Atravesá ×2 y frená la primera horda.':n===2?'Abrí 2 cajas a tiros: munición a la izquierda, taller a la derecha. Luego frená al jefe.':n===3?'Llegaron los corredores. Apuntá primero al grupo más cercano y buscá las puertas ×2.':type.briefing,pattern:type.pattern,roadStyle,weather,timeOfDay:type.timeOfDay,bossKind:type.bossKind,powerCap,startingPower,gateInterval:type.gateInterval,gateSequence,waves,obstacles,requiredBlocks,requiredCaches,killTarget,duration,routeSequence,spawnRoutesAt};
  return diversify(plan,act,archetype,variant);

}

// Mechanics are authored independently from color/stat changes. Each chapter
// alternates familiar combat with different verbs: rescue, dodge, defuse, siege.
function diversify(plan,act,archetype,variant){
  const p={...plan,endMode:'boss',requiredRescues:0,requiredMines:0,requiredBases:0,requiredMutations:0,requiredPath:false,
    civilians:[],mines:[],drones:[],bases:[],pathAt:[],choiceAt:[],movingGates:plan.id>=4&&plan.id%3!==1};
  const special=variant>=10;
  if(special&&archetype===0){
    Object.assign(p,{pattern:'rescue',title:`Ruta de rescate · ${act+1}`,briefing:'Rescatá 3 civiles: acercá el convoy a las figuras azules cuando lleguen abajo. Los disparos no les hacen daño. Llegá con vida al refugio.',endMode:'timed',requiredRescues:3,roadStyle:'rightBend',weather:'fog'});
    p.civilians=[3,7,11,15,19].map((at,i)=>({at,lane:(i+act)%3}));p.waves=p.waves.filter((_,i)=>i%2===0);p.killTarget=2;p.obstacles=[];p.requiredBlocks=0;
  }else if(special&&archetype===1){
    Object.assign(p,{pattern:'evolution',title:`Laboratorio en marcha · ${act+1}`,briefing:'Elegí dos mutaciones durante la misión: perforación, rebote, dispersión o hielo. Combiná las mejoras y frená al jefe.',requiredCaches:0,requiredMutations:2,roadStyle:'split',weather:'clear'});p.choiceAt=[7,17];
  }else if(special&&archetype===2){
    Object.assign(p,{pattern:'minefield',title:`Campo minado · ${act+1}`,briefing:'Desactivá 3 minas disparándoles. Esquivá las restantes: explotan si chocan con el convoy. Alcanzá la salida con vida.',endMode:'timed',requiredMines:3,roadStyle:'narrow',weather:'rain'});
    p.mines=[4,7,10,13,16,19,22].map((at,i)=>({at,lane:(i*2+act)%3}));p.waves=p.waves.filter((_,i)=>i%2===0);p.killTarget=2;p.obstacles=[];p.requiredBlocks=0;
  }else if(special&&archetype===3){
    Object.assign(p,{pattern:'siege',title:`Asedio a las bases · ${act+1}`,briefing:'Destruí las dos bases, una a cada costado. Cada base tiene su propia barra. Tenés 25 segundos extra para terminar el asedio.',endMode:'siege',requiredBases:2,roadStyle:'split',weather:'ash'});
    p.bases=[{at:8,lane:0},{at:13,lane:2}];p.waves=p.waves.filter((_,i)=>i%2===0);p.killTarget=2;p.obstacles=[];p.requiredBlocks=0;
  }else if(special&&archetype===4){
    Object.assign(p,{pattern:'crossfire',title:`Cruce de drones · ${act+1}`,briefing:'Los drones disparan proyectiles rojos hacia tu posición. Movete para esquivarlos o destruí los drones. Sobreviví hasta el final.',endMode:'timed',roadStyle:'sCurve',weather:'clear'});
    p.drones=[{at:5,lane:0},{at:12,lane:2},{at:20,lane:1}];p.waves=p.waves.filter((_,i)=>i%2===0);p.killTarget=2;p.obstacles=[];p.requiredBlocks=0;
  }else if(special&&archetype===7){
    Object.assign(p,{pattern:'branch-choice',title:`La bifurcación · ${act+1}`,briefing:'Elegí un ramal cruzando su cartel: REFUGIO recupera vida y reduce la presión; ASALTO da +4 poder y agrega enemigos. La elección cambia las siguientes oleadas.',requiredPath:true,roadStyle:'split',weather:'clear'});p.pathAt=[4,16];p.choiceAt=[12];
  }else if(special&&archetype===9){
    Object.assign(p,{pattern:'boss-rush',title:`Tres amenazas · ${act+1}`,briefing:'Tres duelos seguidos: cargador, acorazado y bruto. Cambiá de carril, aprovechá el núcleo expuesto y derrotá a los tres.',roadStyle:'straight',weather:'ash'});
    p.waves=p.waves.slice(0,3);p.obstacles=[];p.requiredBlocks=0;p.killTarget=2;
    p.bossSchedule=[{at:round(p.duration*.3),kind:'charger',scale:.6},{at:round(p.duration*.64),kind:'armored',scale:.6},{at:p.duration,kind:'brute',scale:.85}];
  }
  // Every post-tutorial mission has a tactical choice; some later missions
  // combine two mutations. These affect shot behavior, not just statistics.
  if(p.id>=4&&p.choiceAt.length===0)p.choiceAt=p.id>60&&p.id%3===0?[9,19]:[9+p.id%4];
  if(p.id>=21&&!special){
    const twist=(p.id+act)%3;
    if(twist===0){p.mines=[{at:9,lane:(p.id+1)%3},{at:17,lane:(p.id+2)%3}];p.briefing+=' Hay minas en el recorrido: disparales o esquivalas.';}
    else if(twist===1){p.drones=[{at:12,lane:p.id%3}];p.briefing+=' Un dron protege el cierre: destruílo y esquivá sus disparos rojos.';}
    else{p.civilians=[{at:6,lane:p.id%3},{at:15,lane:(p.id+2)%3}];p.requiredRescues=1;p.briefing+=' Rescatá también a un civil azul al pasar cerca de él.';}
  }
  p.chapter=act+1;
  p.missionLabel=p.title.split(' · ')[0];

  if(p.endMode==='boss'&&!p.bossSchedule)p.bossSchedule=[{at:p.duration,kind:p.bossKind,scale:1}];
  if(p.endMode!=='boss')p.bossSchedule=[];
  p.waves=p.waves.map(w=>({...w,kinds:[...w.kinds]}));
  p.killTarget=Math.min(p.killTarget,p.waves.reduce((n,w)=>n+w.kinds.length,0));
  return p;
}
