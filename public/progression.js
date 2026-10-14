// Unlocks change the rules of play. Art and chapter colors are independent.
export const UNLOCKS=[
  {at:1,id:'recruit',name:'La batería azul',hint:'Cada cañón recluta soldados. Mové la batería para dirigir el ejército.'},
  {at:1,id:'multiply',name:'Portales ×2',hint:'Los soldados se multiplican al atravesar el portal; el cañón queda atrás.'},
  {at:2,id:'workshops',name:'Talleres del reino',hint:'Abrí cofres a tiros: más cañones, escudo, ráfaga o artillería.'},
  {at:3,id:'runners',name:'Incursores',hint:'Las tropas ligeras atacan más rápido: cambiá de frente a tiempo.'},
  {at:3,id:'moving',name:'Portales móviles',hint:'El portal se mueve. Apuntá al lugar por el que va a pasar tu tropa.'},
  {at:4,id:'guards',name:'Guardias acorazados',hint:'Los escudos enemigos requieren concentrar soldados en un carril.'},
  {at:6,id:'barricades',name:'Empalizadas',hint:'Destruí los bloqueos marcados antes de que alcancen la batería.'},
  {at:8,id:'mutations',name:'Órdenes de batalla',hint:'Elegí lanceros, hielo, flanqueo, dispersión o reparación durante la batalla.'},
  {at:9,id:'horde',name:'La gran horda',hint:'El ejército rojo se divide en columnas. Elegí qué frente reforzar.'},
  {at:10,id:'giants',name:'Caballeros gigantes',hint:'La mira roja anuncia su ataque. Salí de la línea y buscá su núcleo.'},
  {at:9,id:'rescue',name:'Civiles del reino',hint:'Recogé civiles azules mientras mantenés a raya al ejército rojo.'},
  {at:11,id:'mass-rescue',name:'Caravana de rescate',hint:'El rescate se convierte en el objetivo principal: reuní tres civiles y llegá al refugio.'},
  {at:6,id:'bombs',name:'Bombas del puente',hint:'Desactivá bombas a tiros o esquivalas con la batería.'},
  {at:15,id:'mages',name:'Magos de guerra',hint:'Destruí a los magos o esquivá sus proyectiles anunciados.'},
  {at:5,id:'branches',name:'Dos destinos',hint:'REFUGIO repara y reduce la presión; ASALTO concede poder y suma guardias.'},
  {at:20,id:'duels',name:'Duelos sucesivos',hint:'Tres caballeros, tres estilos. Cada duelo exige cambiar de estrategia.'},
  {at:2,id:'triple',name:'Portales ×3',hint:'Triplicá la formación que cruza el portal, sin aumentar los cañones.'},
  {at:4,id:'seven',name:'Portal ×7',hint:'Un portal potente puede cambiar el frente de batalla; abrí su torre primero.'},
  {at:30,id:'reinforce',name:'Contraataques',hint:'Nuevas tropas pueden entrar por los costados a mitad de la misión.'},
  {at:31,id:'veterans',name:'Veteranos del reino',hint:'Tus soldados ganan armadura y fuerza: cada uno puede vencer dos reclutas rojos.'},
  {at:7,id:'cursed',name:'Portales malditos',hint:'El portal rojo quita tropas. Elegí el azul o rodeá la maldición.'},
  {at:10,id:'fire',name:'Lluvia de fuego',hint:'Los círculos del suelo anuncian un impacto. Movete antes de que caiga.'},
  {at:8,id:'ninety-nine',name:'Portal ×99',hint:'Destruí la torre dorada para abrir un portal que convierte una tropa en un ejército.'},
  {at:50,id:'healers',name:'Estandartes de curación',hint:'El estandarte rojo recupera tropas cercanas. Destruílo antes de atacar la horda.'},
  {at:60,id:'timed',name:'Portales fugaces',hint:'Algunos portales duran pocos segundos: aprovechalos antes de que desaparezcan.'},
  {at:61,id:'elite',name:'La legión azul',hint:'Cada soldado gana fuerza para vencer tres reclutas rojos. Usá esa ventaja para repartir el ejército.'},
  {at:70,id:'escort',name:'Carro de la corona',hint:'Protegé el carro dorado: los proyectiles también pueden dañarlo.'},
  {at:80,id:'warp',name:'Portales de flanqueo',hint:'Las tropas que entran reaparecen en otro carril. Prepará el destino.'},
  {at:90,id:'royal',name:'Guardia real',hint:'El rey gigante alterna escudo y núcleo expuesto. No descuides sus escoltas.'},
  {at:91,id:'royal-blue',name:'Guardia azul de élite',hint:'Tus soldados alcanzan su máxima fuerza: cuatro reclutas rojos por soldado, antes de aplicar lanceros.'},
  {at:95,id:'last-stand',name:'Última resistencia',hint:'Al perder media vida, el jefe llama una nueva oleada de guardias.'},
  {at:100,id:'final',name:'La corona roja',hint:'El cierre combina los tres duelos, portales, magos y el carro de la corona.'}
].sort((a,b)=>a.at-b.at);
export const availableUnlocks=level=>UNLOCKS.filter(u=>u.at<=level);
export const unlockAt=level=>{const entries=UNLOCKS.filter(u=>u.at===level);return entries.length?{...entries[0],name:entries.map(u=>u.name).join(' y '),hint:entries.map(u=>u.hint).join(' ')}:null;};
const NAMES={evacuation:'Primer estandarte', 'supply-crossing':'El cruce de los cofres','runner-chase':'Asalto de los incursores','armored-convoy':'La muralla de escudos',pincer:'Ataque por los flancos','barricade-slalom':'Puente de empalizadas','limited-ammo':'La batería sitiada','curve-ambush':'Emboscada del desfiladero',swarm:'Marea escarlata','elite-gauntlet':'El último bastión',rescue:'Rescate del reino',evolution:'La escuela de guerra',minefield:'Puente de las bombas',siege:'Asedio a las fortalezas',crossfire:'Los magos del puente','branch-choice':'La bifurcación del reino','boss-rush':'Los tres caballeros'};
const BRIEFS={evacuation:'Reclutá tropas azules con tus cañones y vencé al ejército rojo.', 'supply-crossing':'Abrí dos cofres de suministros a tiros. Elegí entre refuerzos y taller.', 'runner-chase':'Los incursores rojos corren más rápido. Reforzá el frente más cercano.', 'armored-convoy':'Los guardias acorazados absorben más tropas. Concentrá el ejército y buscá portales.',pincer:'Atacan desde ambos costados. Alterná el frente y vigilá el centro.', 'barricade-slalom':'Derribá las empalizadas marcadas en el puente estrecho.', 'limited-ammo':'Tenés menos cañones disponibles. Apuntá y aprovechá cada recluta.', 'curve-ambush':'Los enemigos llegan en emboscadas. Prepará tu ejército entre los ataques.',swarm:'La horda roja cubre el puente. Multiplicá tus soldados y repartí los refuerzos.', 'elite-gauntlet':'Guardias, incursores y empalizadas se combinan antes del gigante.',evolution:'Elegí dos órdenes de batalla y combiná sus efectos para vencer al caballero.',siege:'Destruí las dos fortalezas antes de que venza el plazo. También disparan.',crossfire:'Los magos apuntan a tu posición. La mira roja queda fija: movete o destruí al mago.', 'branch-choice':'Cruzá REFUGIO para reparar y reducir la presión, o ASALTO para sumar cañones y enemigos.', 'boss-rush':'Vencé a los tres caballeros en duelos sucesivos. Cada uno tiene ataques diferentes.'};

export function kingdomPlan(plan){
  const p={...plan},n=p.id,known=availableUnlocks(n);p.features=known.map(u=>u.id);p.unlock=unlockAt(n);p.army=true;p.populationScale=1+Math.floor((n-1)/10)*.18;p.troopRank=1+Math.floor((n-1)/30);
  p.title=`${NAMES[p.pattern]} · ${p.chapter}`;p.missionLabel=NAMES[p.pattern];p.briefing=BRIEFS[p.pattern]||p.briefing;
  if(p.pattern==='rescue')p.briefing=`Rescatá ${p.requiredRescues} civiles azules acercando la batería cuando lleguen abajo. Tus tropas no les hacen daño. Sobreviví hasta el refugio.`;
  if(p.pattern==='minefield')p.briefing=`Desactivá ${p.requiredMines} bombas con tus tropas. Esquivá las restantes y llegá con vida a la salida.`;
  if(p.requiredRescues&&p.pattern!=='rescue')p.briefing+=` Rescatá también ${p.requiredRescues} civil azul.`;
  p.choiceAt=n<8?[]:p.choiceAt;p.movingGates=n>=3&&(n<=10||p.movingGates);
  p.gateSequence=p.gateSequence.map((g,i)=>({...g,value:g.kind==='multiply'?(n>=2&&i%2===0?3:2):1+Math.floor((n-1)/20),kind:n>=7&&i===3&&n%2===1?'curse':g.kind}));
  if(n===1){p.gateSequence=p.gateSequence.map((g,i)=>({...g,kind:i%2?'add':'multiply',value:i%2?1:2}));p.spawnRoutesAt=[];}
  p.portalTowers=n>=4?[{at:6,lane:p.waves[0]?.lane===0?2:0,value:n>=8?99:7}]:[];
  // The opening chapter teaches a new decision in every mission, before the
  // full rescue, minefield and branch objectives return in later combinations.
  if(n===5){p.pathAt=[4,16];p.requiredPath=true;p.briefing+=' Elegí REFUGIO o ASALTO: cambia los refuerzos y la presión.';}
  if(n===6){p.mines=[{at:6,lane:0},{at:15,lane:2}];p.requiredMines=1;p.briefing+=' Desactivá también una bomba a tiros.';}
  if(n===9){p.civilians=[{at:6,lane:0},{at:15,lane:2}];p.requiredRescues=1;p.briefing+=' Recogé también un civil azul cuando llegue a tus cañones.';}
  p.warps=n>=80?[{at:17,lane:n%3,to:(n+1)%3}]:[];
  p.cart=n===70||n>=70&&n%4===0||n===100;
  const pool=[...(n>=30?['reinforce']:[]),...(n>=7?['curse']:[]),...(n>=10?['fire']:[]),...(n>=50?['healer']:[]),...(n>=60?['portal']:[]),...(n>=80?['warp']:[])];
  p.surprises=pool.length?Array.from({length:n>=81?3:n>=51?2:1},(_,i)=>({at:12+i*7,kind:pool[(n+i*3+Math.floor(n/10))%pool.length],lane:(n+i*2)%3})):[];
  if(n===10)p.surprises=[{at:12,kind:'fire',lane:1}];
  if(n>=90&&p.endMode==='boss'&&n%3===0)p.bossSchedule=p.bossSchedule.map((b,i)=>i===p.bossSchedule.length-1?{...b,kind:'king'}:b);
  if(n===100)p.bossSchedule=p.bossSchedule.map((b,i)=>i===2?{...b,kind:'king'}:b);
  if(n===95){p.endMode='boss';p.bossKind='king';p.bossSchedule=[{at:p.duration,kind:'king',scale:1}];}
  p.nextUnlock=UNLOCKS.find(u=>u.at>n)||null;
  const twist=p.surprises[0]?.kind;p.discovery=p.unlock?`NUEVO · ${p.unlock.name}`:twist?`Combinación: ${({reinforce:'contraataques',curse:'portales malditos',fire:'lluvia de fuego',healer:'estandartes',portal:'portales fugaces',warp:'flanqueo mágico'})[twist]}`:`${p.missionLabel} · nueva formación y rutas`;
  return p;
}
