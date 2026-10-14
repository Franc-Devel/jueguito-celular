// A campaign release resets only game progress, once per browser.
// Audio, graphics preferences and unrelated site storage keep their values.
export const SAVE_VERSION='kingdom-fresh-start-v2';
export const SAVE_VERSION_KEY='pulso-campaign-version';
const DEFAULTS={'pulso-unlocked':'1','pulso-record':'0','pulso-gear':'[]','pulso-loadout':'standard'};
export const campaignSaveKey=key=>Object.hasOwn(DEFAULTS,key)?`${key}:${SAVE_VERSION}`:key;

export function createCampaignStorage(persistent){
  let current=false;
  const session=new Map();
  try{current=persistent?.getItem(SAVE_VERSION_KEY)===SAVE_VERSION;}catch{}
  const resetApplied=!current;
  if(resetApplied){
    for(const [key,value] of Object.entries(DEFAULTS))session.set(key,value);
    try{
      // Write the marker last: an interrupted reset can safely retry on reload.
      for(const [key,value] of Object.entries(DEFAULTS)){persistent.setItem(key,value);persistent.setItem(campaignSaveKey(key),value);}
      persistent.setItem(SAVE_VERSION_KEY,SAVE_VERSION);current=true;
    }catch{}
  }
  return {
    resetApplied,
    get(key,fallback){
      if(session.has(key))return session.get(key);
      if(!current&&Object.hasOwn(DEFAULTS,key))return DEFAULTS[key];
      try{return persistent?.getItem(campaignSaveKey(key))??fallback??DEFAULTS[key];}catch{return fallback??DEFAULTS[key];}
    },
    set(key,value){const text=String(value);session.set(key,text);try{persistent?.setItem(campaignSaveKey(key),text);}catch{}}
  };
}
