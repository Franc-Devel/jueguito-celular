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
  const act=Math.floor((n-1)/10),archetype=(n-1)%10,type=TYPES[archetype];
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
  return {id:n,title:`${type.title} · ${act+1}`,briefing:n===1?'Mové el convoy con el dedo o el mouse. Atravesá ×2 y frená la primera horda.':n===2?'Abrí 2 cajas a tiros: munición a la izquierda, taller a la derecha. Luego frená al jefe.':n===3?'Llegaron los corredores. Apuntá primero al grupo más cercano y buscá las puertas ×2.':type.briefing,pattern:type.pattern,roadStyle,weather,timeOfDay:type.timeOfDay,bossKind:type.bossKind,powerCap,startingPower,gateInterval:type.gateInterval,gateSequence,waves,obstacles,requiredBlocks,requiredCaches,killTarget,duration,routeSequence,spawnRoutesAt};
}
