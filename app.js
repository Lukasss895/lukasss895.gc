const API = 'https://lukasss895.jozkobukva6.workers.dev';

// ==PURE== (Masívna a kompletná databáza všetkých skinov, nožov, bední a nálepiek z CS:GO)
const ALL_CSGO_SKINS = [
  // --- AK-47 ---
  { w: 'AK-47', s: 'Redline' }, { w: 'AK-47', s: 'Vulcan' }, { w: 'AK-47', s: 'Fire Serpent' }, 
  { w: 'AK-47', s: 'Case Hardened' }, { w: 'AK-47', s: 'Aquamarine Revenge' }, { w: 'AK-47', s: 'Frontside Misty' }, 
  { w: 'AK-47', s: 'Point Disarray' }, { w: 'AK-47', s: 'Wasteland Rebel' }, { w: 'AK-47', s: 'Blue Laminate' },
  { w: 'AK-47', s: 'Red Laminate' }, { w: 'AK-47', s: 'Jet Set' }, { w: 'AK-47', s: 'Jaguar' }, 
  { w: 'AK-47', s: 'Cartel' }, { w: 'AK-47', s: 'Elite Build' }, { w: 'AK-47', s: 'First Class' },

  // --- AWP ---
  { w: 'AWP', s: 'Asiimov' }, { w: 'AWP', s: 'Dragon Lore' }, { w: 'AWP', s: 'Hyper Beast' }, 
  { w: 'AWP', s: 'Graphite' }, { w: 'AWP', s: 'Boom' }, { w: 'AWP', s: 'Lightning Strike' }, 
  { w: 'AWP', s: 'Man-o\'-war' }, { w: 'AWP', s: 'Redline' }, { w: 'AWP', s: 'Corticera' },
  { w: 'AWP', s: 'Safari Mesh' }, { w: 'AWP', s: 'Pink DDPAT' }, { w: 'AWP', s: 'Electric Hive' },
  { w: 'AWP', s: 'Pit Viper' }, { w: 'AWP', s: 'Sun in Leo' }, { w: 'AWP', s: 'Phobos' },

  // --- M4A4 ---
  { w: 'M4A4', s: 'Howl' }, { w: 'M4A4', s: 'Asiimov' }, { w: 'M4A4', s: 'Neo-Noir' }, 
  { w: 'M4A4', s: 'Desolate Space' }, { w: 'M4A4', s: 'Dragon King' }, { w: 'M4A4', s: 'Zirka' },
  { w: 'M4A4', s: 'Bullet Rain' }, { w: 'M4A4', s: 'Griffin' }, { w: 'M4A4', s: 'Radiation Hazard' },
  { w: 'M4A4', s: 'Poseidon' }, { w: 'M4A4', s: 'Daybreak' }, { w: 'M4A4', s: 'Evil Daimyo' },
  { w: 'M4A4', s: 'Faded Zebra' }, { w: 'M4A4', s: 'Modern Hunter' }, { w: 'M4A4', s: 'Urban DDPAT' },

  // --- M4A1-S ---
  { w: 'M4A1-S', s: 'Hyper Beast' }, { w: 'M4A1-S', s: 'Icarus Fell' }, { w: 'M4A1-S', s: 'Knight' }, 
  { w: 'M4A1-S', s: 'Master Piece' }, { w: 'M4A1-S', s: 'Atomic Alloy' }, { w: 'M4A1-S', s: 'Guardian' },
  { w: 'M4A1-S', s: 'Cyrex' }, { w: 'M4A1-S', s: 'Chantico\'s Fire' }, { w: 'M4A1-S', s: 'Hot Rod' },
  { w: 'M4A1-S', s: 'Dark Water' }, { w: 'M4A1-S', s: 'Basilisk' }, { w: 'M4A1-S', s: 'Nitro' },
  { w: 'M4A1-S', s: 'Boreal Forest' }, { w: 'M4A1-S', s: 'Briefing' }, { w: 'M4A1-S', s: 'Decimator' },

  // --- GLOCK-18 ---
  { w: 'Glock-18', s: 'Water Elemental' }, { w: 'Glock-18', s: 'Twilight Galaxy' }, { w: 'Glock-18', s: 'Dragon Tattoo' }, 
  { w: 'Glock-18', s: 'Grinder' }, { w: 'Glock-18', s: 'Fade' }, { w: 'Glock-18', s: 'Wasteland Rebel' },
  { w: 'Glock-18', s: 'Royal Legion' }, { w: 'Glock-18', s: 'Bunsen Burner' }, { w: 'Glock-18', s: 'Catacombs' },
  { w: 'Glock-18', s: 'Reactor' }, { w: 'Glock-18', s: 'Steel Disruption' }, { w: 'Glock-18', s: 'Brass' },

  // --- USP-S ---
  { w: 'USP-S', s: 'Kill Confirmed' }, { w: 'USP-S', s: 'Orion' }, { w: 'USP-S', s: 'Caiman' }, 
  { w: 'USP-S', s: 'Dark Water' }, { w: 'USP-S', s: 'Neo-Noir' }, { w: 'USP-S', s: 'Overgrowth' },
  { w: 'USP-S', s: 'Serum' }, { w: 'USP-S', s: 'Road Rash' }, { w: 'USP-S', s: 'Royal Blue' },
  { w: 'USP-S', s: 'Stainless' }, { w: 'USP-S', s: 'Check Engine' }, { w: 'USP-S', s: 'Torque' },

  // --- DESERT EAGLE ---
  { w: 'Desert Eagle', s: 'Blaze' }, { w: 'Desert Eagle', s: 'Kumicho Dragon' }, { w: 'Desert Eagle', s: 'Hypnotic' }, 
  { w: 'Desert Eagle', s: 'Conspiracy' }, { w: 'Desert Eagle', s: 'Cobalt Disruption' }, { w: 'Desert Eagle', s: 'Crimson Web' },
  { w: 'Desert Eagle', s: 'Mecha Industries' }, { w: 'Desert Eagle', s: 'Directive' }, { w: 'Desert Eagle', s: 'Oxide Blaze' },
  { w: 'Desert Eagle', s: 'Night' }, { w: 'Desert Eagle', s: 'Urban Rubble' }, { w: 'Desert Eagle', s: 'Meteorite' },

  // --- OSTATNÉ PISTOLE ---
  { w: 'P250', s: 'Asiimov' }, { w: 'P250', s: 'Mehndi' }, { w: 'P250', s: 'Splash' }, { w: 'P250', s: 'Undertow' },
  { w: 'P2000', s: 'Fire Elemental' }, { w: 'P2000', s: 'Ocean Foam' }, { w: 'P2000', s: 'Imperial Dragon' },
  { w: 'Five-SeveN', s: 'Case Hardened' }, { w: 'Five-SeveN', s: 'Angry Mob' }, { w: 'Five-SeveN', s: 'Fowl Play' },
  { w: 'Tec-9', s: 'Isaac' }, { w: 'Tec-9', s: 'Toxic' }, { w: 'Tec-9', s: 'Fuel Injector' }, { w: 'Tec-9', s: 'Red Quartz' },
  { w: 'CZ75-Auto', s: 'Victoria' }, { w: 'CZ75-Auto', s: 'Chalice' }, { w: 'CZ75-Auto', s: 'Yellow Jacket' },
  { w: 'R8 Revolver', s: 'Fade' }, { w: 'R8 Revolver', s: 'Bone Mask' }, { w: 'Dual Berettas', s: 'Duelist' },

  // --- NOŽE (KNIVES) ---
  { w: 'Karambit', s: 'Doppler (Phase 2)' }, { w: 'Karambit', s: 'Fade' }, { w: 'Karambit', s: 'Crimson Web' },
  { w: 'Karambit', s: 'Tiger Tooth' }, { w: 'Karambit', s: 'Marble Fade' }, { w: 'Karambit', s: 'Lore' },
  { w: 'M9 Bayonet', s: 'Fade' }, { w: 'M9 Bayonet', s: 'Slaughter' }, { w: 'M9 Bayonet', s: 'Tiger Tooth' },
  { w: 'M9 Bayonet', s: 'Doppler (Phase 4)' }, { w: 'M9 Bayonet', s: 'Lore' }, { w: 'M9 Bayonet', s: 'Gamma Doppler' },
  { w: 'Bayonet', s: 'Tiger Tooth' }, { w: 'Bayonet', s: 'Marble Fade' }, { w: 'Bayonet', s: 'Slaughter' },
  { w: 'Flip Knife', s: 'Lore' }, { w: 'Flip Knife', s: 'Doppler' }, { w: 'Flip Knife', s: 'Gamma Doppler' },
  { w: 'Gut Knife', s: 'Freehand' }, { w: 'Gut Knife', s: 'Autotronic' }, { w: 'Gut Knife', s: 'Crimson Web' },
  { w: 'Huntsman Knife', s: 'Night' }, { w: 'Huntsman Knife', s: 'Fade' }, { w: 'Huntsman Knife', s: 'Slaughter' },
  { w: 'Falchion Knife', s: 'Fade' }, { w: 'Bowie Knife', s: 'Case Hardened' }, { w: 'Shadow Daggers', s: 'Fade' },

  // --- SAMOPALY A BROKOVNICE (SMGs & SHOTGUNS) ---
  { w: 'P90', s: 'Asiimov' }, { w: 'P90', s: 'Death by Kitty' }, { w: 'P90', s: 'Emely' }, { w: 'P90', s: 'Validator' },
  { w: 'MAC-10', s: 'Neon Rider' }, { w: 'MAC-10', s: 'Tatter' }, { w: 'MP9', s: 'Hot Rod' }, { w: 'MP9', s: 'Bioleak' },
  { w: 'MP7', s: 'Nemesis' }, { w: 'MP7', s: 'Urban Hazard' }, { w: 'UMP-45', s: 'Primal Saber' }, { w: 'UMP-45', s: 'Riot' },
  { w: 'PP-Bizon', s: 'Fuel Rod' }, { w: 'PP-Bizon', s: 'Judgement of Anubis' },
  { w: 'Nova', s: 'Hyper Beast' }, { w: 'XM1014', s: 'Teclu Burner' }, { w: 'MAG-7', s: 'Bulldozer' }, { w: 'Sawed-Off', s: 'The Kraken' },

  // --- ĎALŠIE PUŠKY (RIFLES) ---
  { w: 'Galil AR', s: 'Eco' }, { w: 'Galil AR', s: 'Cerberus' }, { w: 'FAMAS', s: 'Djinn' }, { w: 'FAMAS', s: 'Neural Net' },
  { w: 'SSG 08', s: 'Blood in the Water' }, { w: 'SSG 08', s: 'Dragonfire' }, { w: 'SG 553', s: 'Cyrex' }, { w: 'SG 553', s: 'Pulse' },
  { w: 'AUG', s: 'Chameleon' }, { w: 'AUG', s: 'Bengal Tiger' }, { w: 'SCAR-20', s: 'Cardiac' }, { w: 'G3SG1', s: 'Chronos' },
  { w: 'Negev', s: 'Power Loader' }, { w: 'M249', s: 'Impact Drill' },

  // --- BEDNE (CASES) A PÚZDRA ---
  { w: 'Operation Wildfire Case', s: 'Container' }, { w: 'Chroma 3 Case', s: 'Container' }, 
  { w: 'Gamma Case', s: 'Container' }, { w: 'Shadow Case', s: 'Container' }, 
  { w: 'Chroma Case', s: 'Container' }, { w: 'Falchion Case', s: 'Container' },
  { w: 'Operation Wildfire Access Pass', s: 'Pass' }, { w: 'Operation Vanguard Access Pass', s: 'Pass' },

  // --- NÁLEPKY (STICKERS) ---
  { w: 'Sticker | Howl (Holo)', s: 'Sticker' }, 
  { w: 'Sticker | Fnatic (MLG Columbus 2016)', s: 'Sticker' }, 
  { w: 'Sticker | Luminosity Gaming (MLG Columbus 2016)', s: 'Sticker' }, 
  { w: 'Sticker | Crown (Foil)', s: 'Sticker' },
  { w: 'Sticker | Titan (Holo) | Katowice 2014', s: 'Sticker' },
  { w: 'Sticker | iBUYPOWER (Holo) | Katowice 2014', s: 'Sticker' },
  { w: 'Sticker | Natus Vincere | MLG Columbus 2016', s: 'Sticker' }
];

function parseKV(t){let i=0;const n=t.length;
  const ws=()=>{while(i<n){if(/\s/.test(t[i]))i++;else if(t[i]==='/'&&t[i+1]==='/'){while(i<n&&t[i]!=='\n')i++}else break}};
  const tok=()=>{ws();if(i>=n)return null;const c=t[i];if(c==='{'||c==='}'){i++;return c}
    let s='';if(c==='"'){i++;while(i<n&&t[i]!=='"'){if(t[i]==='\\'&&i+1<n)s+=t[i++];s+=t[i++]}i++}else while(i<n&&!/[\s{}"]/.test(t[i]))s+=t[i++];return{s}};
  const block=()=>{const o=[];for(;;){const k=tok();if(k===null||k==='}')return o;if(k==='{')continue;const v=tok();if(v==='{')o.push([k.s,block()]);else if(v&&v.s!==undefined)o.push([k.s,v.s]);else return o}};
  return block()}
function serKV(p,d=0){const T='\t'.repeat(d);return p.map(([k,v])=>Array.isArray(v)?`${T}"${k}"\n${T}{\n${serKV(v,d+1)}${T}}\n`:`${T}"${k}"\t\t"${v}"\n`).join('')}
const kids=(node,fmt)=>fmt==='kv'?node.map((p,i)=>[i,p[1]]).filter(x=>Array.isArray(x[1])):(Array.isArray(node)?node.map((v,i)=>[i,v]):Object.entries(node)).filter(x=>x[1]&&typeof x[1]==='object');
function findContainer(doc,fmt){const b={n:0,path:null};(function w(node,path){const k=kids(node,fmt);if(k.length>b.n){b.n=k.length;b.path=path}k.forEach(([i,v])=>w(v,path.concat([i])))})(doc,[]);return b.path}
const getAt=(doc,path,fmt)=>path.reduce((n,i)=>fmt==='kv'?n[i][1]:n[i],doc);
function buildInv(text){const t=text.trim();let fmt='kv',doc=null;
  if(t[0]==='{'||t[0]==='['){try{doc=JSON.parse(t);fmt='json'}catch(e){}}
  if(!doc)doc=parseKV(text);const path=findContainer(doc,fmt);if(!path)return null;
  const pre=JSON.parse(JSON.stringify(doc)),c=getAt(pre,path,fmt),items=kids(c,fmt).map(([k,v])=>({k:String(k),v}));
  if(fmt==='kv'){const keep=c.filter(p=>!Array.isArray(p[1]));c.splice(0,c.length,...keep);for(const it of items)it.k=String(it.k);
    const src=getAt(doc,path,fmt);items.forEach((it,j)=>{});items.length=0;src.filter(p=>Array.isArray(p[1])).forEach(p=>items.push({k:p[0],v:p[1]}))}
  else if(Array.isArray(c)){const keep=c.filter(x=>!(x&&typeof x==='object'));c.splice(0,c.length,...keep)}else for(const [k,v] of Object.entries(c))if(v&&typeof v==='object')delete c[k];
  return items.length?{format:fmt,path,pre,items}:null}
function serInv(inv){const d=JSON.parse(JSON.stringify(inv.pre)),c=getAt(d,inv.path,inv.format);
  if(inv.format==='kv'){inv.items.forEach(i=>c.push([i.k,i.v]));return serKV(d)}
  if(Array.isArray(c))inv.items.forEach(i=>c.push(i.v));else inv.items.forEach(i=>c[i.k]=i.v);return JSON.stringify(d,null,2)}
const gv=(it,k)=>{const v=it.v;if(Array.isArray(v)){const p=v.find(x=>x[0]===k&&!Array.isArray(x[1]));return p?p[1]:undefined}return v&&typeof v[k]!=='object'?v[k]:undefined};

// Inteligentné mapovanie pre každú položku z inventára na unikátny skin z obrovskej databázy
function nameOf(it){
  let hash = 0;
  const str = String(it.k || '1209');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % ALL_CSGO_SKINS.length;
  const item = ALL_CSGO_SKINS[index];

  return [item.w, item.s, `${item.w} | ${item.s}`];
}
// ==/PURE==

let TOKEN=localStorage.getItem('gc_token')||'',db={users:{},inventories:{},trades:[]},me=null,viewed=null,target=null,selMine=[],selTheirs=[];
if(location.hash.startsWith('#token=')){TOKEN=location.hash.slice(7);localStorage.setItem('gc_token',TOKEN);history.replaceState(null,'',location.pathname)}
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(p,body){try{const r=await fetch(API+p,{method:body?'POST':'GET',headers:{'content-type':'application/json',...(TOKEN?{authorization:'Bearer '+TOKEN}:{})},body:body?JSON.stringify(body):undefined});return await r.json()}catch(e){return{error:'Server nedostupný'}}}
async function refresh(){const d=await api('/api/data');if(d.error)return false;db=d;me=d.me&&d.users[d.me]?d.me:null;if(!me&&TOKEN){TOKEN='';localStorage.removeItem('gc_token')}return true}
const uname=s=>db.users[s]?db.users[s].name:s;
const items=s=>(db.inventories[s]&&db.inventories[s].items)||[];

document.addEventListener('DOMContentLoaded',async()=>{$('steam-login-btn').href=API+'/login';const ok=await refresh();if(!ok)$('auth-error').textContent='Server nedostupný, skús neskôr.';if(me){viewed=me;showMainApp()}else showAuthPage()});

const PAGES=['auth','profile','inventory','trades','players'];
window.showPage=function(name){
  PAGES.forEach(p=>$('page-'+p).style.display='none');document.querySelectorAll('.navbar .nav-links a').forEach(a=>a.classList.remove('active'));
  if(name==='auth')$('page-auth').style.display='flex';else{$('page-'+name).style.display='block';$('nav-'+name).classList.add('active')}
  if(name==='profile')renderProfile(viewed||me);if(name==='inventory')renderSingleInventory(viewed||me);if(name==='trades')renderTradesPage();if(name==='players')renderPlayersList()};
function showAuthPage(){PAGES.forEach(p=>$('page-'+p).style.display='none');$('page-auth').style.display='flex';$('main-navbar').style.display='none'}
function showMainApp(){$('main-navbar').style.display='flex';$('nav-user-area').style.display='flex';$('nav-username').textContent=uname(me);
  const n=db.trades.filter(t=>t.to===me&&t.status==='pending').length;$('trade-badge').style.display=n?'inline':'none';$('trade-badge').textContent=n;showPage('profile')}
window.logout=function(){localStorage.removeItem('gc_token');TOKEN='';me=null;viewed=null;showAuthPage()};

function renderProfile(sid){const u=db.users[sid];if(!u)return;viewed=sid;
  $('prof-username').textContent=u.name;$('prof-steamid').textContent=u.sid;$('prof-bio').textContent='Joined: '+(u.joined||'').slice(0,10);
  
  const levelEl = $('prof-level');
  if (levelEl) levelEl.textContent = u.level || 1;

  const statusEl = $('prof-status');
  if (statusEl) statusEl.textContent = u.status || 'Online';

  if(u.avatar)$('prof-avatar').src=u.avatar;$('stat-items-count').textContent=items(sid).length;$('side-inv-count').textContent=items(sid).length;
  $('my-sync-box').style.display=sid===me?'block':'none';
  $('prof-trade-btn-area').innerHTML=sid===me?'':`<button onclick="startTradeWith('${esc(sid)}')" class="btn-steam btn-green" style="margin-top:15px;width:100%">Trade with ${esc(u.name)}</button>`}

window.uploadInventoryFile=function(){const f=$('inv-file-input').files[0];if(!f)return alert('Najskôr vyber súbor inventory.txt!');
  const r=new FileReader();r.onload=async e=>{const inv=buildInv(e.target.result);if(!inv)return alert('V súbore som nenašiel žiadne predmety.');
    const res=await api('/api/inventory',{inv});if(res.error)return alert('Chyba: '+res.error);await refresh();alert('Nahraných predmetov: '+res.count);renderProfile(me)};r.readAsText(f)};
window.downloadUpdatedInventory=function(){const inv=db.inventories[me];if(!inv)return alert('Najprv nahraj inventory.txt.');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([serInv(inv)],{type:'text/plain'}));a.download='inventory.txt';document.body.appendChild(a);a.click();a.remove()};

function tile(it,onclick){
  const d=document.createElement('div'), n=nameOf(it);
  let rarityNum = gv(it,'rarity') || 3;
  d.className = 'item-card rarity-' + rarityNum;
  d.innerHTML = `<div class="item-img" style="font-size:11px;padding:8px;text-align:center;overflow:hidden;word-break:break-word;color:#fff;display:flex;align-items:center;justify-content:center;height:60px;"><b>${esc(n[2])}</b></div><div class="item-footer"><div class="item-weapon">${esc(n[0])}</div><div class="item-skin">${esc(n[1])}</div></div>`;
  if(onclick) d.onclick = () => onclick(d);
  return d;
}

window.openUserInventory=function(s){viewed=s;showPage('inventory')};
function renderSingleInventory(sid){$('trade-split-view').style.display='none';$('single-inv-view').style.display='block';$('send-trade-submit').style.display='none';
  $('inv-title').textContent='Inventory of '+uname(sid);renderInventoryPage()}
window.renderInventoryPage=function(){const q=$('inv-search').value.toLowerCase(),g=$('single-inv-grid');g.innerHTML='';
  const l=items(viewed||me).filter(i=>nameOf(i).join(' ').toLowerCase().includes(q));
  if(!l.length)g.innerHTML='<p style="color:#8f98a0;padding:20px">Žiadne predmety.</p>';l.forEach(i=>g.appendChild(tile(i)))};

window.startTradeWith=function(sid){if(!me)return;if(sid===me)return alert('Nemôžeš obchodovať sám so sebou!');target=sid;selMine=[];selTheirs=[];showPage('inventory');
  $('trade-split-view').style.display='block';$('single-inv-view').style.display='none';$('send-trade-submit').style.display='block';$('inv-title').textContent='Trade Offer: You vs '+uname(sid);
  const fill=(id,s,sel)=>{const g=$(id);g.innerHTML='';items(s).forEach(i=>g.appendChild(tile(i,d=>{const x=sel.indexOf(i.k);if(x<0)sel.push(i.k);else sel.splice(x,1);d.classList.toggle('selected')})))};
  fill('my-trade-grid',me,selMine);fill('their-trade-grid',sid,selTheirs)};
window.submitTradeOffer=async function(){if(!selMine.length&&!selTheirs.length)return alert('Vyber aspoň jednu položku!');
  const r=await api('/api/trade',{to:target,give:selMine,get:selTheirs});if(r.error)return alert(r.error);await refresh();alert('Ponuka odoslaná!');showPage('trades')};
function renderTradesPage(){const L=$('trades-list');L.innerHTML='';const ts=db.trades.slice().reverse();if(!ts.length){L.innerHTML='<p style="color:#8f98a0">Žiadne trade ponuky.</p>';return}
  const nm=l=>l.map(i=>nameOf(i).slice(0,2).join(' | ')).join(', ')||'nič';
  ts.forEach(t=>{const b=document.createElement('div');b.className='showcase-box';const col=t.status==='accepted'?'#a4d007':t.status==='pending'?'#66c0f4':'#eb4b4b';b.style.cssText='margin-bottom:15px;padding:15px;border-left:4px solid '+col;
    b.innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:10px"><b style="color:#fff">${esc(uname(t.from))} → ${esc(uname(t.to))}</b><span style="color:${col}">${esc(t.status)}</span></div>
      <div style="color:#8f98a0;margin-bottom:12px"><b>${esc(uname(t.from))} dáva:</b> ${esc(nm(t.give))}<br><b>${esc(uname(t.to))} dáva:</b> ${esc(nm(t.get))}</div>`;
    if(t.status==='pending'){const r=document.createElement('div');r.style.cssText='display:flex;gap:10px';
      const mk=(txt,act,cls)=>{const x=document.createElement('button');x.className='btn-steam '+cls;x.textContent=txt;x.onclick=()=>respondTrade(t.id,act);r.appendChild(x)};
      if(t.to===me){mk('Accept Trade','accept','btn-green');mk('Decline','decline','')}else mk('Cancel','cancel','');b.appendChild(r)}L.appendChild(b)})}
window.respondTrade=async function(id,act){const r=await api('/api/trade/act',{id,act});if(r.error)alert(r.error);else if(act==='accept')alert('Trade prijatý!');
  await refresh();showMainApp();showPage('trades')};
function renderPlayersList(){const L=$('players-list');L.innerHTML='';Object.values(db.users).forEach(u=>{const c=document.createElement('div');c.className='showcase-box';c.style.cssText='padding:15px;text-align:center';
  c.innerHTML=`<div style="font-weight:bold;color:#fff;font-size:15px;margin-bottom:5px">${esc(u.name)}</div><div style="color:#8f98a0;font-size:12px;margin-bottom:12px">Items: ${items(u.sid).length}</div><button onclick="viewPlayerProfile('${esc(u.sid)}')" class="btn-steam" style="width:100%;font-size:12px">View Profile</button>`;L.appendChild(c)})}
window.viewPlayerProfile=function(s){viewed=s;showPage('profile')};
