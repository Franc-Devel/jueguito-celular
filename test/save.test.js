import test from 'node:test';
import assert from 'node:assert/strict';
import {createCampaignStorage,SAVE_VERSION,SAVE_VERSION_KEY,campaignSaveKey} from '../public/save.js';
function memory(initial={}){const values=new Map(Object.entries(initial));return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value))};}
const old={'pulso-unlocked':'100','pulso-record':'4270','pulso-gear':'["shield","rapid","blast"]','pulso-loadout':'rapid','pulso-quality':'low','pulso-sound':'on','other-site-key':'keep'};
test('la campaña nueva reinicia los cuatro datos de progreso al cargar una partida anterior',()=>{
  const p=memory(old),s=createCampaignStorage(p);assert.equal(s.resetApplied,true);
  for(const [key,value] of Object.entries({'pulso-unlocked':'1','pulso-record':'0','pulso-gear':'[]','pulso-loadout':'standard'})){assert.equal(s.get(key),value);assert.equal(p.getItem(key),value);assert.equal(p.getItem(campaignSaveKey(key)),value);}
  assert.equal(p.getItem(SAVE_VERSION_KEY),SAVE_VERSION);
  assert.equal(s.get('pulso-quality'),'low');assert.equal(s.get('pulso-sound'),'on');assert.equal(p.getItem('other-site-key'),'keep');
});
test('el reinicio se aplica una sola vez y las victorias nuevas sobreviven a la recarga',()=>{
  const p=memory(old),first=createCampaignStorage(p);first.set('pulso-unlocked',2);first.set('pulso-record',180);first.set('pulso-gear','["shield"]');first.set('pulso-loadout','shield');
  const reloaded=createCampaignStorage(p);assert.equal(reloaded.resetApplied,false);assert.equal(reloaded.get('pulso-unlocked'),'2');assert.equal(reloaded.get('pulso-record'),'180');assert.equal(reloaded.get('pulso-gear'),'["shield"]');assert.equal(reloaded.get('pulso-loadout'),'shield');
});
test('una pestaña con el juego anterior no puede restaurar el nivel viejo en la campaña nueva',()=>{
  const p=memory(old),s=createCampaignStorage(p);s.set('pulso-unlocked',2);p.setItem('pulso-unlocked',99);p.setItem('pulso-record',99999);p.setItem('pulso-gear',old['pulso-gear']);
  const reloaded=createCampaignStorage(p);assert.equal(reloaded.get('pulso-unlocked'),'2');assert.equal(reloaded.get('pulso-record'),'0');assert.equal(reloaded.get('pulso-gear'),'[]');
});
test('sin almacenamiento disponible se inicia desde uno y se puede jugar durante la sesión',()=>{
  for(const p of [undefined,{getItem(){return '100';},setItem(){throw Error('blocked');}}]){const s=createCampaignStorage(p);assert.equal(s.get('pulso-unlocked',1),'1');assert.equal(s.get('pulso-record',0),'0');s.set('pulso-unlocked',2);assert.equal(s.get('pulso-unlocked'),'2');}
});
test('un reinicio interrumpido no deja pasar la partida vieja y puede reintentarse',()=>{
  const p=memory(old),write=p.setItem;let calls=0;p.setItem=(key,value)=>{if(++calls===3)throw Error('quota');write(key,value);};
  const s=createCampaignStorage(p);assert.equal(s.get('pulso-unlocked'),'1');assert.equal(s.get('pulso-record'),'0');assert.equal(p.getItem(SAVE_VERSION_KEY),null);
  p.setItem=write;assert.equal(createCampaignStorage(p).get('pulso-unlocked'),'1');assert.equal(p.getItem(SAVE_VERSION_KEY),SAVE_VERSION);
});
